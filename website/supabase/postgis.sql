-- ============================================================
-- KLINOVA: PostGIS + PRIVACY-SAFE GEOGRAPHIC AGGREGATION
-- Enable PostGIS, migrate lat/lng to geometry, add H3-style
-- district aggregation so patient points never leave the DB.
-- ============================================================

-- ── Step 1: Enable PostGIS ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Step 2: Add geometry column to whatsapp_triage ───────────
-- Keep the plain float columns for now; add a derived geometry.
-- Once PostGIS is running, the geometry column is the source of truth.
ALTER TABLE whatsapp_triage
  ADD COLUMN IF NOT EXISTS location_geom geometry(Point, 4326);

-- Back-fill from existing float columns
UPDATE whatsapp_triage
SET location_geom = ST_SetSRID(
    ST_MakePoint(location_lng, location_lat),
    4326
  )
WHERE location_lat IS NOT NULL
  AND location_lng IS NOT NULL
  AND location_geom IS NULL;

-- Spatial index
CREATE INDEX IF NOT EXISTS triage_location_geom_idx
  ON whatsapp_triage USING GIST (location_geom);

-- ── Step 3: Trigger to keep geometry in sync on INSERT ───────
CREATE OR REPLACE FUNCTION sync_triage_geometry()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.location_geom := ST_SetSRID(
      ST_MakePoint(NEW.location_lng, NEW.location_lat),
      4326
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_triage_geometry_trigger ON whatsapp_triage;
CREATE TRIGGER sync_triage_geometry_trigger
  BEFORE INSERT OR UPDATE OF location_lat, location_lng
  ON whatsapp_triage
  FOR EACH ROW EXECUTE FUNCTION sync_triage_geometry();

-- ── Step 4: Privacy-safe district aggregate function ─────────
-- Buckets patient points into ~10km × 10km grid cells.
-- Returns count per cell — never individual patient coordinates.
-- Minimum suppression: cells with fewer than MIN_COUNT cases are hidden.
CREATE OR REPLACE FUNCTION get_triage_grid_stats(
  p_country    text    DEFAULT NULL,
  p_grid_deg   float   DEFAULT 0.1,   -- ~11km grid cells
  p_min_count  int     DEFAULT 3       -- suppress small populations
)
RETURNS TABLE (
  grid_lat     float,
  grid_lng     float,
  country      text,
  urgency      text,
  cases        bigint,
  last_case_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Restrict to authorised roles
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('doctor', 'nurse', 'admin', 'owner', 'government', 'analyst', 'ministry')
      AND (role NOT IN ('government', 'ministry') OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND gov_subscribed = true
      ))
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    -- Snap to grid
    round(ST_Y(location_geom)::numeric / p_grid_deg) * p_grid_deg AS grid_lat,
    round(ST_X(location_geom)::numeric / p_grid_deg) * p_grid_deg AS grid_lng,
    t.country,
    t.urgency,
    count(*)::bigint AS cases,
    max(t.created_at) AS last_case_at
  FROM whatsapp_triage t
  WHERE location_geom IS NOT NULL
    AND (p_country IS NULL OR t.country = p_country)
  GROUP BY 1, 2, 3, 4
  HAVING count(*) >= p_min_count   -- suppress small-count cells
  ORDER BY cases DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_triage_grid_stats(text, float, int) TO authenticated;

-- ── Step 5: Nearest-facility query (no patient data involved) ─
-- Finds the N nearest pharmacies/clinics to a given point.
-- Input: public lat/lng (from patient's device — not stored here).
-- Output: facility names and distances only.
CREATE OR REPLACE FUNCTION nearest_facilities(
  p_lat     float,
  p_lng     float,
  p_type    text    DEFAULT 'pharmacy',  -- pharmacy | clinic | hospital
  p_limit   int     DEFAULT 5,
  p_max_km  float   DEFAULT 50
)
RETURNS TABLE (
  name        text,
  distance_km float
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_point geometry := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
BEGIN
  -- Only authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    f.name,
    round((ST_DistanceSphere(f.geom, v_point) / 1000.0)::numeric, 2)::float AS distance_km
  FROM facilities f
  WHERE f.type = p_type
    AND ST_DWithin(
      f.geom::geography,
      v_point::geography,
      p_max_km * 1000  -- convert km to meters
    )
  ORDER BY f.geom <-> v_point
  LIMIT p_limit;
END;
$$;

-- ── Step 6: Facilities table with geometry ────────────────────
-- Replaces the dynamic OSM/Healthsites.io fetch with a cached local copy.
-- Populate via the /api/facilities endpoint sync job.
CREATE TABLE IF NOT EXISTS facilities (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text    NOT NULL,
  type       text    NOT NULL CHECK (type IN ('hospital','clinic','pharmacy','dentist','lab')),
  country    text,
  address    text,
  lat        float,
  lng        float,
  geom       geometry(Point, 4326),
  source     text    DEFAULT 'osm',   -- osm | healthsites | klinova
  verified   boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS facilities_geom_idx   ON facilities USING GIST (geom);
CREATE INDEX IF NOT EXISTS facilities_type_idx   ON facilities(type);
CREATE INDEX IF NOT EXISTS facilities_country_idx ON facilities(country);

-- Sync geometry from lat/lng
CREATE OR REPLACE FUNCTION sync_facility_geometry()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_facility_geometry_trigger ON facilities;
CREATE TRIGGER sync_facility_geometry_trigger
  BEFORE INSERT OR UPDATE OF lat, lng ON facilities
  FOR EACH ROW EXECUTE FUNCTION sync_facility_geometry();

-- RLS: facilities are read-only public data
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facilities_public_read" ON facilities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "facilities_admin_write" ON facilities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'owner'))
  );

GRANT EXECUTE ON FUNCTION nearest_facilities(float, float, text, int, float) TO authenticated;

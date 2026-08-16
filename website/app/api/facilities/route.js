// Server-side facility proxy — OpenStreetMap Overpass API (no auth required)
// Covers Togo, Ghana, Benin, Ivory Coast, Burkina Faso, Nigeria, Senegal

// Exact bounding boxes per country [south, west, north, east]
const BBOX = {
  TG: [ 6.0,  -0.2, 11.2,  1.8],
  GH: [ 4.7,  -3.4, 11.2,  1.2],
  BJ: [ 6.2,   0.8, 12.5,  3.8],
  CI: [ 4.3,  -8.7, 10.7, -2.5],
  BF: [ 9.4,  -5.6, 15.1,  2.4],
  NG: [ 4.2,   2.7, 13.9, 14.7],
  SN: [12.3, -17.5, 15.0,-11.4],
}

// amenity= tags used in West Africa
const AMENITY_TYPES = 'hospital|clinic|pharmacy|dentist|laboratory|doctors|health_centre|dispensary|chemist|maternity|blood_bank'
// healthcare= tags — widely used across francophone West Africa
const HEALTHCARE_TYPES = 'hospital|clinic|pharmacy|dentist|laboratory|doctor|health_post|health_centre|centre_de_sante|dispensary|maternity|blood_bank'

// Build an Overpass query covering one OR multiple bboxes in a single request
function buildQuery(bboxes, limit, timeout) {
  const parts = bboxes.map(([s, w, n, e]) => [
    `node["amenity"~"^(${AMENITY_TYPES})$"](${s},${w},${n},${e});`,
    `way["amenity"~"^(${AMENITY_TYPES})$"](${s},${w},${n},${e});`,
    `node["healthcare"~"^(${HEALTHCARE_TYPES})$"](${s},${w},${n},${e});`,
    `way["healthcare"~"^(${HEALTHCARE_TYPES})$"](${s},${w},${n},${e});`,
  ].join('\n')).join('\n')

  return `[out:json][timeout:${timeout}];\n(\n${parts}\n);\nout center ${limit};`
}

async function queryOSM(bboxes, limit = 3000, timeout = 55) {
  const query = buildQuery(bboxes, limit, timeout)
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'User-Agent': 'Klinova/1.0', 'Content-Type': 'text/plain' },
      signal: AbortSignal.timeout((timeout + 10) * 1000),
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.elements ?? []).flatMap(el => {
      const x = el.lon ?? el.center?.lon
      const y = el.lat ?? el.center?.lat
      if (!x || !y) return []
      // prefer amenity tag, fall back to healthcare tag
      const type = el.tags?.amenity ?? el.tags?.healthcare ?? 'hospital'
      return [{
        name:     el.tags?.name ?? el.tags?.['name:en'] ?? el.tags?.['name:fr'] ?? null,
        type,
        location: { x, y },
      }]
    })
  } catch (e) {
    console.error('OSM query failed:', e?.message)
    return []
  }
}

function groupByType(places) {
  const out = { hospital: [], clinic: [], pharmacy: [], dentist: [], lab: [] }
  places.forEach(p => {
    const t = (p.type ?? '').toLowerCase()
    if      (['hospital','hospital/clinic'].includes(t))                                                                         out.hospital.push(p)
    else if (['clinic','doctors','doctor','health_centre','health_post','centre_de_sante','dispensary','maternity'].includes(t)) out.clinic.push(p)
    else if (['pharmacy','chemist'].includes(t))                                                                                 out.pharmacy.push(p)
    else if (t === 'dentist')                                                                                                    out.dentist.push(p)
    else if (['laboratory','blood_bank'].includes(t))                                                                            out.lab.push(p)
    else                                                                                                                         out.clinic.push(p)
  })
  return out
}

function dedup(places) {
  const seen = new Set()
  return places.filter(p => {
    const key = `${Math.round(p.location.x * 1000)},${Math.round(p.location.y * 1000)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// In-memory cache
let allCache = null
let allCacheAt = 0
const countryCache = {}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const countryParam = searchParams.get('country')

  // ── Single-country: use that country's exact bbox ──────────────────────────
  if (countryParam) {
    const now = Date.now()
    if (countryCache[countryParam] && now - countryCache[countryParam].at < 1_800_000) {
      return Response.json(countryCache[countryParam].data, {
        headers: { 'Cache-Control': 'public, max-age=1800' }
      })
    }

    const bbox = BBOX[countryParam]
    if (!bbox) {
      return Response.json({ hospital: [], clinic: [], pharmacy: [], dentist: [], lab: [] })
    }

    const places  = await queryOSM([bbox], 3000, 55)
    const grouped = groupByType(dedup(places))
    countryCache[countryParam] = { data: grouped, at: now }

    return Response.json(grouped, {
      headers: { 'Cache-Control': 'public, max-age=1800' }
    })
  }

  // ── All Region: single Overpass request covering all 7 countries ───────────
  if (allCache && Date.now() - allCacheAt < 3600_000) {
    return Response.json(allCache, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    })
  }

  const allBboxes = Object.values(BBOX)
  const places    = await queryOSM(allBboxes, 5000, 60)
  const grouped   = groupByType(dedup(places))

  allCache   = grouped
  allCacheAt = Date.now()

  return Response.json(grouped, {
    headers: { 'Cache-Control': 'public, max-age=3600' }
  })
}

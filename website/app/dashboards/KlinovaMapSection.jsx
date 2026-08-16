'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const API_KEY = process.env.NEXT_PUBLIC_ARCGIS_API_KEY

// ── Symptom categorisation ────────────────────────────────────────────────────
const SYMPTOM_DEFS = {
  fever:       { keywords: ['fever','malaria','chills','temperature','paludisme','fièvre'], color: [231,76,60],   label: 'Fever / Malaria'  },
  respiratory: { keywords: ['cough','breath','chest','respiratory','lung','toux','respir'], color: [52,152,219],  label: 'Respiratory'      },
  digestive:   { keywords: ['stomach','diarr','vomit','nausea','belly','abdomen','gastro'], color: [241,196,15], label: 'Digestive'        },
  dental:      { keywords: ['tooth','dental','dentist','mouth','gum'],                      color: [155,89,182],  label: 'Dental'           },
  headache:    { keywords: ['head','migraine','dizzy','vertigo'],                           color: [230,126,34],  label: 'Headache'         },
  skin:        { keywords: ['skin','rash','wound','burn','itch'],                           color: [39,174,96],   label: 'Skin / Wound'     },
  maternity:   { keywords: ['pregn','birth','baby','maternal','maternit','grossesse'],      color: [255,105,180], label: 'Maternity'        },
}
const OTHER_COLOR = [127,140,141]

function categorise(intent = '') {
  const i = intent.toLowerCase()
  for (const [key, { keywords }] of Object.entries(SYMPTOM_DEFS)) {
    if (keywords.some(k => i.includes(k))) return key
  }
  return 'other'
}

// ── Layer config ──────────────────────────────────────────────────────────────
const LAYER_CFG = [
  { id: 'heatmap',    label: 'Density',    bg: '#E74C3C', emoji: '🌡️' },
  { id: 'symptoms',   label: 'Symptoms',   bg: '#9B59B6', emoji: '🩺' },
  { id: 'outbreaks',  label: 'WHO Alerts', bg: '#C0392B', emoji: '⚠️' },
  { id: 'hospitals',  label: 'Hospitals',  bg: '#2980B9', emoji: '🏥' },
  { id: 'clinics',    label: 'Clinics',    bg: '#1ABC9C', emoji: '🏨' },
  { id: 'pharmacies', label: 'Pharmacies', bg: '#27AE60', emoji: '💊' },
  { id: 'dentists',   label: 'Dentists',   bg: '#8E44AD', emoji: '🦷' },
  { id: 'labs',       label: 'Labs',       bg: '#D35400', emoji: '🔬' },
  { id: 'urgency',    label: 'Urgency',    bg: '#D99A2B', emoji: '📍' },
]

// ── Country selector config ───────────────────────────────────────────────────
const COUNTRY_SELECTOR = [
  { code: null, label: 'All Region',    flag: '🌍', center: [-1.0, 8.0],   zoom: 5 },
  { code: 'TG', label: 'Togo',          flag: '🇹🇬', center: [0.82, 8.0],  zoom: 7 },
  { code: 'GH', label: 'Ghana',         flag: '🇬🇭', center: [-1.0, 7.9],  zoom: 7 },
  { code: 'BJ', label: 'Benin',         flag: '🇧🇯', center: [2.3, 9.3],   zoom: 7 },
  { code: 'CI', label: "Côte d'Ivoire", flag: '🇨🇮', center: [-5.5, 7.5],  zoom: 7 },
  { code: 'BF', label: 'Burkina Faso',  flag: '🇧🇫', center: [-1.5, 12.0], zoom: 7 },
  { code: 'NG', label: 'Nigeria',       flag: '🇳🇬', center: [8.0, 9.0],   zoom: 6 },
  { code: 'SN', label: 'Senegal',       flag: '🇸🇳', center: [-14.5, 14.0],zoom: 7 },
]

// ── Facilities — fetched via server-side proxy (Healthsites.io + OSM) ─────────
async function fetchAllFacilities(country = null) {
  const url = country ? `/api/facilities?country=${country}` : '/api/facilities'
  const empty = { hospital: [], clinic: [], pharmacy: [], dentist: [], lab: [] }
  try {
    const res = await fetch(url)
    if (!res.ok) return empty
    return await res.json()
  } catch { return empty }
}

// ── West Africa regional health data ─────────────────────────────────────────
const REGIONAL_COUNTRIES = [
  { name: 'Togo',           flag: '🇹🇬', keywords: ['togo', 'lomé', 'lome'],                    capital: 'Lomé'       },
  { name: 'Ghana',          flag: '🇬🇭', keywords: ['ghana', 'accra'],                           capital: 'Accra'      },
  { name: 'Benin',          flag: '🇧🇯', keywords: ['benin', 'cotonou', 'porto-novo'],           capital: 'Cotonou'    },
  { name: 'Nigeria',        flag: '🇳🇬', keywords: ['nigeria', 'lagos', 'abuja'],                capital: 'Abuja'      },
  { name: 'Burkina Faso',   flag: '🇧🇫', keywords: ['burkina', 'ouagadougou'],                   capital: 'Ouaga.'     },
  { name: "Côte d'Ivoire",  flag: '🇨🇮', keywords: ['ivory', 'ivoire', 'abidjan', 'yamousso'],  capital: 'Abidjan'    },
  { name: 'Senegal',        flag: '🇸🇳', keywords: ['senegal', 'dakar'],                         capital: 'Dakar'      },
  { name: 'Niger',          flag: '🇳🇪', keywords: ['niamey', ' niger'],                         capital: 'Niamey'     },
  { name: 'Mali',           flag: '🇲🇱', keywords: ['mali', 'bamako'],                           capital: 'Bamako'     },
  { name: 'Guinea',         flag: '🇬🇳', keywords: ['guinea', 'conakry'],                        capital: 'Conakry'    },
  { name: 'Sierra Leone',   flag: '🇸🇱', keywords: ['sierra leone', 'freetown'],                 capital: 'Freetown'   },
  { name: 'Liberia',        flag: '🇱🇷', keywords: ['liberia', 'monrovia'],                      capital: 'Monrovia'   },
  { name: 'Cameroon',       flag: '🇨🇲', keywords: ['cameroon', 'yaoundé', 'yaounde', 'douala'], capital: 'Yaoundé'    },
  { name: 'DR Congo',       flag: '🇨🇩', keywords: ['congo', 'kinshasa', 'drc'],                 capital: 'Kinshasa'   },
  { name: 'Mauritania',     flag: '🇲🇷', keywords: ['mauritania', 'nouakchott'],                 capital: 'Nouakchott' },
  { name: 'Gambia',         flag: '🇬🇲', keywords: ['gambia', 'banjul'],                         capital: 'Banjul'     },
]

const SEV_COLOR = { critical: '#E74C3C', warning: '#E67E22', info: '#3498DB' }
const SEV_BG    = { critical: '#FDF0EF', warning: '#FEF9E7', info:  '#EBF5FB' }

// ── SDK loader ────────────────────────────────────────────────────────────────
function loadArcGIS() {
  return new Promise(resolve => {
    if (window.__arcgisReady) { resolve(); return }
    if (!document.getElementById('arcgis-css')) {
      const l = document.createElement('link')
      l.id = 'arcgis-css'; l.rel = 'stylesheet'
      l.href = 'https://js.arcgis.com/4.29/esri/themes/light/main.css'
      document.head.appendChild(l)
    }
    if (document.getElementById('arcgis-js')) {
      document.getElementById('arcgis-js').addEventListener('load', () => { window.__arcgisReady = true; resolve() })
      return
    }
    const s = document.createElement('script')
    s.id = 'arcgis-js'; s.src = 'https://js.arcgis.com/4.29/'
    s.onload = () => { window.__arcgisReady = true; resolve() }
    document.head.appendChild(s)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function KlinovaMapSection() {
  const mapRef   = useRef(null)
  const viewRef  = useRef(null)
  const layersRef = useRef({})

  const [ready, setReady] = useState(false)
  const [counts, setCounts] = useState({ cases: 0, hospitals: 0, clinics: 0, pharmacies: 0, dentists: 0, labs: 0, outbreaks: 0 })
  const [active, setActive] = useState(
    Object.fromEntries(LAYER_CFG.map(l => [l.id, l.id !== 'urgency']))
  )
  const [sympLegend, setSympLegend] = useState([])
  const [whoOutbreaks, setWhoOutbreaks] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loadingFac, setLoadingFac] = useState(false)
  const updateLayersRef  = useRef(null)
  const isInitialMount   = useRef(true)

  // When user picks a different country, reload facility layers
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    if (!updateLayersRef.current) return
    updateLayersRef.current(selectedCountry)
  }, [selectedCountry])

  function toggle(id) {
    setActive(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (layersRef.current[id]) layersRef.current[id].visible = next[id]
      return next
    })
  }

  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    async function setup() {
      await loadArcGIS()
      if (cancelled) return

      // Fetch Klinova triage data
      const supabase = createClient()
      const { data: raw } = await supabase
        .from('whatsapp_triage')
        .select('id, location_lat, location_lng, urgency, patient_name, intent, summary')
        .not('location_lat', 'is', null)
      const pts = raw ?? []

      // Fetch all facilities from server-side proxy (Healthsites.io + OSM, no CORS)
      const [osmFacilities, outbreakRes] = await Promise.all([
        fetchAllFacilities(),
        fetch('/api/outbreaks').then(r => r.json()).catch(() => ({ outbreaks: [], advisories: [] })),
      ])

      const hospitals      = osmFacilities.hospital
      const clinics        = osmFacilities.clinic
      const pharmacyPlaces = osmFacilities.pharmacy
      const dentists       = osmFacilities.dentist
      const labs           = osmFacilities.lab

      const whoOutbreaks = outbreakRes.outbreaks ?? []

      if (cancelled || !mapRef.current) return

      setCounts({ cases: pts.length, hospitals: hospitals.length, clinics: clinics.length, pharmacies: pharmacyPlaces.length, dentists: dentists.length, labs: labs.length, outbreaks: whoOutbreaks.length })
      setWhoOutbreaks(whoOutbreaks)

      // Symptom legend
      const found = new Set(pts.map(p => categorise(p.intent)).filter(c => c !== 'other'))
      setSympLegend([...found].map(c => ({
        label: SYMPTOM_DEFS[c].label,
        color: `rgb(${SYMPTOM_DEFS[c].color.join(',')})`,
      })))

      window.require([
        'esri/config',
        'esri/Map',
        'esri/views/MapView',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/layers/FeatureLayer',
        'esri/renderers/HeatmapRenderer',
        'esri/widgets/Zoom',
        'esri/widgets/Home',
      ], (esriConfig, EsriMap, MapView, Graphic, GraphicsLayer, FeatureLayer, HeatmapRenderer, Zoom, Home) => {
        if (cancelled) return
        esriConfig.apiKey = API_KEY

        // 1 — Heatmap (density of patient cases)
        const heatLayer = pts.length > 0 ? new FeatureLayer({
          source: pts.map((p, i) => new Graphic({
            geometry: { type: 'point', longitude: p.location_lng, latitude: p.location_lat },
            attributes: { OBJECTID: i },
          })),
          objectIdField: 'OBJECTID',
          geometryType: 'point',
          fields: [{ name: 'OBJECTID', type: 'oid' }],
          renderer: new HeatmapRenderer({
            colorStops: [
              { ratio: 0,    color: 'rgba(255,255,255,0)'   },
              { ratio: 0.25, color: 'rgba(255,240,100,0.5)' },
              { ratio: 0.55, color: 'rgba(255,150,0,0.75)'  },
              { ratio: 0.8,  color: 'rgba(220,50,50,0.9)'   },
              { ratio: 1,    color: 'rgba(150,0,0,1)'        },
            ],
            radius: 35,
            maxDensity: 0.008,
            minDensity: 0,
          }),
          visible: true,
          title: 'Patient Density',
        }) : null
        if (heatLayer) layersRef.current.heatmap = heatLayer

        // 2 — Symptom-categorised pins
        const sympLayer = new GraphicsLayer({ title: 'Symptoms', visible: true })
        pts.forEach(p => {
          const cat = categorise(p.intent)
          const rgb = SYMPTOM_DEFS[cat]?.color ?? OTHER_COLOR
          sympLayer.add(new Graphic({
            geometry: { type: 'point', longitude: p.location_lng, latitude: p.location_lat },
            symbol: {
              type: 'simple-marker',
              color: [...rgb, 0.85],
              outline: { color: [255,255,255,0.9], width: 1.5 },
              size: 11,
            },
            attributes: {
              Name:     p.patient_name ?? 'Patient',
              Category: SYMPTOM_DEFS[cat]?.label ?? 'Other',
              Intent:   p.intent ?? '—',
              Summary:  p.summary ?? '—',
            },
            popupTemplate: {
              title: '{Name}',
              content: [{ type: 'fields', fieldInfos: [
                { fieldName: 'Category', label: 'Symptom Category' },
                { fieldName: 'Intent',   label: 'Medical Intent'   },
                { fieldName: 'Summary',  label: 'Summary'          },
              ]}],
            },
          }))
        })
        layersRef.current.symptoms = sympLayer

        // 3 — WHO outbreak pins
        const outbreakLayer = new GraphicsLayer({ title: 'WHO Alerts', visible: true })
        whoOutbreaks
          .filter(ob => ob.location_lat && ob.location_lng)
          .forEach(ob => {
            const isCritical = ob.severity === 'critical'
            outbreakLayer.add(new Graphic({
              geometry: { type: 'point', longitude: ob.location_lng, latitude: ob.location_lat },
              symbol: {
                type: 'simple-marker',
                style: 'triangle',
                color: isCritical ? [192,57,43,0.95] : [230,126,34,0.9],
                outline: { color: [255,255,255,0.9], width: 1.5 },
                size: 16,
              },
              attributes: {
                Disease:  ob.disease,
                Location: ob.location_name,
                Severity: ob.severity,
                Summary:  ob.summary ?? '—',
              },
              popupTemplate: {
                title: '⚠️ {Disease}',
                content: [{ type: 'fields', fieldInfos: [
                  { fieldName: 'Location', label: 'Location' },
                  { fieldName: 'Severity', label: 'Severity' },
                  { fieldName: 'Summary',  label: 'WHO Summary' },
                ]}],
              },
            }))
          })
        layersRef.current.outbreaks = outbreakLayer

        // 5 — Real hospitals from ArcGIS Places
        const hospLayer = new GraphicsLayer({ title: 'Hospitals', visible: true })
        hospitals.forEach(h => {
          if (!h.location?.x) return
          hospLayer.add(new Graphic({
            geometry: { type: 'point', longitude: h.location.x, latitude: h.location.y },
            symbol: {
              type: 'simple-marker',
              style: 'square',
              color: [41,128,185,0.9],
              outline: { color: [255,255,255,0.9], width: 1.5 },
              size: 13,
            },
            attributes: { Name: h.name ?? 'Hospital' },
            popupTemplate: { title: '{Name}', content: 'Hospital · Klinova Health Map' },
          }))
        })
        layersRef.current.hospitals = hospLayer

        // — Clinics (teal circles)
        const clinicLayer = new GraphicsLayer({ title: 'Clinics', visible: true })
        clinics.forEach(c => {
          if (!c.location?.x) return
          clinicLayer.add(new Graphic({
            geometry: { type: 'point', longitude: c.location.x, latitude: c.location.y },
            symbol: { type: 'simple-marker', style: 'circle', color: [26,188,156,0.9], outline: { color: [255,255,255,0.9], width: 1.5 }, size: 11 },
            attributes: { Name: c.name ?? 'Clinic' },
            popupTemplate: { title: '{Name}', content: 'Clinic · Klinova Health Map' },
          }))
        })
        layersRef.current.clinics = clinicLayer

        // — Pharmacies (green diamonds)
        const pharmLayer = new GraphicsLayer({ title: 'Pharmacies', visible: true })
        pharmacyPlaces.forEach(ph => {
          if (!ph.location?.x) return
          pharmLayer.add(new Graphic({
            geometry: { type: 'point', longitude: ph.location.x, latitude: ph.location.y },
            symbol: { type: 'simple-marker', style: 'diamond', color: [39,174,96,0.9], outline: { color: [255,255,255,0.9], width: 1.5 }, size: 13 },
            attributes: { Name: ph.name ?? 'Pharmacy' },
            popupTemplate: { title: '{Name}', content: 'Pharmacy · Klinova Health Map' },
          }))
        })
        layersRef.current.pharmacies = pharmLayer

        // — Dentists (purple cross)
        const dentistLayer = new GraphicsLayer({ title: 'Dentists', visible: true })
        dentists.forEach(d => {
          if (!d.location?.x) return
          dentistLayer.add(new Graphic({
            geometry: { type: 'point', longitude: d.location.x, latitude: d.location.y },
            symbol: { type: 'simple-marker', style: 'cross', color: [142,68,173,0.9], outline: { color: [142,68,173,0.9], width: 2 }, size: 13 },
            attributes: { Name: d.name ?? 'Dentist' },
            popupTemplate: { title: '{Name}', content: 'Dentist · Klinova Health Map' },
          }))
        })
        layersRef.current.dentists = dentistLayer

        // — Labs (orange x)
        const labLayer = new GraphicsLayer({ title: 'Labs', visible: true })
        labs.forEach(l => {
          if (!l.location?.x) return
          labLayer.add(new Graphic({
            geometry: { type: 'point', longitude: l.location.x, latitude: l.location.y },
            symbol: { type: 'simple-marker', style: 'x', color: [211,84,0,0.9], outline: { color: [211,84,0,0.9], width: 2 }, size: 13 },
            attributes: { Name: l.name ?? 'Laboratory' },
            popupTemplate: { title: '{Name}', content: 'Laboratory · Klinova Health Map' },
          }))
        })
        layersRef.current.labs = labLayer

        // 6 — Urgency-coloured triage pins (off by default)
        const urgLayer = new GraphicsLayer({ title: 'Urgency Pins', visible: false })
        const URG = { low:[46,204,113], medium:[241,196,15], high:[231,76,60], emergency:[155,89,182] }
        pts.forEach(p => {
          const rgb = URG[p.urgency] ?? URG.medium
          urgLayer.add(new Graphic({
            geometry: { type: 'point', longitude: p.location_lng, latitude: p.location_lat },
            symbol: {
              type: 'simple-marker',
              color: [...rgb, 0.9],
              outline: { color: [255,255,255,0.9], width: 1.5 },
              size: 14,
            },
            attributes: {
              Name:    p.patient_name ?? 'Patient',
              Urgency: p.urgency,
              Intent:  p.intent ?? '—',
            },
            popupTemplate: {
              title: '{Name}',
              content: [{ type: 'fields', fieldInfos: [
                { fieldName: 'Urgency', label: 'Urgency' },
                { fieldName: 'Intent',  label: 'Intent'  },
              ]}],
            },
          }))
        })
        layersRef.current.urgency = urgLayer

        // ── Map + view ────────────────────────────────────────────────
        const layers = [
          ...(heatLayer ? [heatLayer] : []),
          sympLayer, outbreakLayer, hospLayer, clinicLayer, pharmLayer, dentistLayer, labLayer, urgLayer,
        ]
        const map = new EsriMap({ basemap: 'streets-navigation-vector', layers })
        viewRef.current = new MapView({
          container: mapRef.current, map,
          center: [1.22, 6.14], zoom: 8,
          ui: { components: [] },
          popup: {
            dockEnabled: true,
            dockOptions: { position: 'bottom-right', breakpoint: false },
          },
        })
        viewRef.current.ui.add(new Zoom({ view: viewRef.current }), 'bottom-right')
        viewRef.current.ui.add(new Home({ view: viewRef.current }), 'bottom-right')
        viewRef.current.when(() => { if (!cancelled) setReady(true) })

        // ── Dynamic facility updater (called when country selector changes) ──
        function fillFacilityLayers(facs) {
          const layerDefs = [
            { data: facs.hospital  ?? [], ref: layersRef.current.hospitals,  sym: { type: 'simple-marker', style: 'square',  color: [41,128,185,0.9], outline: { color: [255,255,255,0.9], width: 1.5 }, size: 13 }, popup: 'Hospital · Klinova Health Map'   },
            { data: facs.clinic    ?? [], ref: layersRef.current.clinics,    sym: { type: 'simple-marker', style: 'circle',  color: [26,188,156,0.9], outline: { color: [255,255,255,0.9], width: 1.5 }, size: 11 }, popup: 'Clinic · Klinova Health Map'     },
            { data: facs.pharmacy  ?? [], ref: layersRef.current.pharmacies, sym: { type: 'simple-marker', style: 'diamond', color: [39,174,96,0.9],  outline: { color: [255,255,255,0.9], width: 1.5 }, size: 13 }, popup: 'Pharmacy · Klinova Health Map'   },
            { data: facs.dentist   ?? [], ref: layersRef.current.dentists,   sym: { type: 'simple-marker', style: 'cross',   color: [142,68,173,0.9], outline: { color: [142,68,173,0.9], width: 2    }, size: 13 }, popup: 'Dentist · Klinova Health Map'    },
            { data: facs.lab       ?? [], ref: layersRef.current.labs,       sym: { type: 'simple-marker', style: 'x',       color: [211,84,0,0.9],   outline: { color: [211,84,0,0.9],   width: 2    }, size: 13 }, popup: 'Laboratory · Klinova Health Map' },
          ]
          layerDefs.forEach(({ data, ref, sym, popup }) => {
            if (!ref) return
            ref.removeAll()
            data.forEach(item => {
              if (!item.location?.x) return
              ref.add(new Graphic({
                geometry: { type: 'point', longitude: item.location.x, latitude: item.location.y },
                symbol: sym,
                attributes: { Name: item.name ?? popup.split(' ·')[0] },
                popupTemplate: { title: '{Name}', content: popup },
              }))
            })
          })
        }

        updateLayersRef.current = async (country) => {
          setLoadingFac(true)
          try {
            const facs = await fetchAllFacilities(country)
            fillFacilityLayers(facs)
            setCounts(prev => ({
              ...prev,
              hospitals:  facs.hospital?.length  ?? 0,
              clinics:    facs.clinic?.length    ?? 0,
              pharmacies: facs.pharmacy?.length  ?? 0,
              dentists:   facs.dentist?.length   ?? 0,
              labs:       facs.lab?.length       ?? 0,
            }))
            const sel = COUNTRY_SELECTOR.find(c => c.code === country)
            if (sel && viewRef.current) {
              viewRef.current.goTo({ center: sel.center, zoom: sel.zoom })
            }
          } finally {
            setLoadingFac(false)
          }
        }
      })
    }

    setup()
    return () => {
      cancelled = true
      viewRef.current?.destroy()
    }
  }, [])

  return (
    <section className="bg-white rounded-xl border border-border shadow-card overflow-hidden">

      {/* Header */}
      <div className="p-5 pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-ink">Disease &amp; Health Tracking Map</h3>
            <p className="text-xs text-ink/50 mt-0.5">
              Live Klinova data · Klinova Location Platform · West Africa
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-ink/60 shrink-0">
            <span>🩺 {counts.cases} cases</span>
            <span>⚠️ {counts.outbreaks} WHO alerts</span>
            <span>🏥 {counts.hospitals} hospitals</span>
            <span>🏨 {counts.clinics} clinics</span>
            <span>💊 {counts.pharmacies} pharmacies</span>
            <span>🦷 {counts.dentists} dentists</span>
            <span>🔬 {counts.labs} labs</span>
          </div>
        </div>

        {/* Country / region selector */}
        <div className="flex flex-wrap gap-1.5">
          {COUNTRY_SELECTOR.map(c => (
            <button
              key={c.code ?? 'all'}
              onClick={() => setSelectedCountry(c.code)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
              style={selectedCountry === c.code
                ? { background: '#2980B9', borderColor: '#2980B9', color: '#fff' }
                : { background: '#fff', borderColor: '#ddd', color: '#555' }}>
              <span>{c.flag}</span>
              <span>{c.label}</span>
              {loadingFac && selectedCountry === c.code && (
                <span className="ml-1 w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Layer toggles */}
        <div className="flex flex-wrap gap-2">
          {LAYER_CFG.map(l => (
            <button key={l.id} onClick={() => toggle(l.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all"
              style={active[l.id]
                ? { background: l.bg, borderColor: l.bg, color: '#fff' }
                : { background: '#fff', borderColor: '#ddd', color: '#666' }}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>

        {/* Symptom legend (only shows when Symptoms layer active and data present) */}
        {active.symptoms && sympLegend.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {sympLegend.map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-ink/50">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs text-ink/40">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-400" /> Other
            </span>
          </div>
        )}

        {/* Map legend */}
        <div className="flex flex-wrap gap-3 text-xs text-ink/50">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm shrink-0 bg-[#2980B9]" /> Hospital</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#1ABC9C]" /> Clinic</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 shrink-0 bg-[#27AE60]" style={{ clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} /> Pharmacy</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 shrink-0 bg-[#8E44AD]" style={{ clipPath: 'polygon(45% 0,55% 0,55% 45%,100% 45%,100% 55%,55% 55%,55% 100%,45% 100%,45% 55%,0 55%,0 45%,45% 45%)' }} /> Dentist</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 shrink-0 bg-[#D35400]" style={{ clipPath: 'polygon(20% 0,50% 30%,80% 0,100% 20%,70% 50%,100% 80%,80% 100%,50% 70%,20% 100%,0 80%,30% 50%,0 20%)' }} /> Lab</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 shrink-0 bg-[#C0392B]" style={{ clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} /> WHO Alert</span>
          <span className="text-ink/30 ml-1">Healthsites.io + OpenStreetMap · 7 West African countries</span>
          {counts.cases === 0 && (
            <span className="text-ink/30 italic">
              Patient locations appear here once the Klinova app &amp; WhatsApp triage are active
            </span>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className="relative" style={{ height: 500 }}>
        {!ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#F5EFE3] gap-2">
            <div className="w-6 h-6 border-2 border-kgreen border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-ink/40">Loading map…</span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Regional health status */}
      <div className="p-5 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-ink text-sm">Regional Health Status</h4>
            <p className="text-xs text-ink/40 mt-0.5">West Africa &amp; neighbouring nations · WHO outbreak data</p>
          </div>
          {whoOutbreaks.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium border border-red-200">
              {whoOutbreaks.length} active alert{whoOutbreaks.length !== 1 ? 's' : ''} in region
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIONAL_COUNTRIES.map(country => {
            const alerts = whoOutbreaks.filter(ob => {
              const loc = (ob.location_name ?? '').toLowerCase()
              const dis = (ob.disease ?? '').toLowerCase()
              return country.keywords.some(k => loc.includes(k) || dis.includes(k))
            })
            const topSev = alerts.find(a => a.severity === 'critical')?.severity
              ?? alerts.find(a => a.severity === 'warning')?.severity
              ?? alerts[0]?.severity ?? null
            return (
              <div key={country.name}
                className="rounded-lg border p-2.5 flex flex-col gap-1 transition-colors"
                style={{
                  borderColor: topSev ? SEV_COLOR[topSev] + '60' : '#E5DDD0',
                  background:  topSev ? SEV_BG[topSev]   : '#FAFAF8',
                }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="text-xs font-semibold text-ink truncate">{country.name}</span>
                </div>
                {alerts.length > 0 ? (
                  <div className="space-y-0.5">
                    {alerts.slice(0, 2).map((a, i) => (
                      <p key={i} className="text-xs leading-tight truncate"
                        style={{ color: SEV_COLOR[a.severity] }}>
                        {a.disease}
                      </p>
                    ))}
                    {alerts.length > 2 && (
                      <p className="text-xs text-ink/40">+{alerts.length - 2} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-green-600">No active alerts ✓</p>
                )}
                <p className="text-xs text-ink/30 mt-auto">{country.capital}</p>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-ink/30 mt-3 text-center">
          Data sourced from WHO Disease Outbreak News · updated daily · powered by Klinova
        </p>
      </div>
    </section>
  )
}

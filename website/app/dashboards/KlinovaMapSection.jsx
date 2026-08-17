'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

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
  { id: 'heatmap',    label: 'Density',    bg: '#E74C3C' },
  { id: 'symptoms',   label: 'Symptoms',   bg: '#9B59B6' },
  { id: 'outbreaks',  label: 'WHO Alerts', bg: '#C0392B' },
  { id: 'hospitals',  label: 'Hospitals',  bg: '#2980B9' },
  { id: 'clinics',    label: 'Clinics',    bg: '#1ABC9C' },
  { id: 'pharmacies', label: 'Pharmacies', bg: '#27AE60' },
  { id: 'dentists',   label: 'Dentists',   bg: '#8E44AD' },
  { id: 'labs',       label: 'Labs',       bg: '#D35400' },
  { id: 'urgency',    label: 'Urgency',    bg: '#D99A2B' },
]

function LayerIcon({ id, size = 13 }) {
  const p = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'heatmap':    return <svg {...p}><circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="5" strokeOpacity=".5"/><circle cx="8" cy="8" r="7.5" strokeOpacity=".2"/></svg>
    case 'symptoms':   return <svg {...p}><circle cx="8" cy="8" r="5"/><path d="M8 5.5v3M8 10.5v.5" strokeWidth="2"/></svg>
    case 'outbreaks':  return <svg {...p}><path d="M8 2L14.5 13.5H1.5L8 2z"/><path d="M8 7v2.5M8 11.5h.01"/></svg>
    case 'hospitals':  return <svg {...p}><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M8 6v4M6 8h4"/></svg>
    case 'clinics':    return <svg {...p}><rect x="3" y="3" width="10" height="10" rx="1.5"/><path d="M5.5 8h5M8 5.5v5" strokeWidth="1.5"/></svg>
    case 'pharmacies': return <svg {...p}><path d="M4 2h8v3l-4 4-4-4V2z"/><path d="M4 9l4 4 4-4"/></svg>
    case 'dentists':   return <svg {...p}><path d="M5.5 2C4 2 2 3.5 2 6c0 4 2.5 8 3.5 8 .8 0 1.2-1.5 2.5-1.5S9.7 14 10.5 14C11.5 14 14 10 14 6c0-2.5-2-4-3.5-4-1 0-1.8 1-3 1S6.5 2 5.5 2z"/></svg>
    case 'labs':       return <svg {...p}><path d="M6 2v5.5L2.5 13.5h11L10 7.5V2"/><path d="M5 2h6"/><path d="M5 10h3" strokeOpacity=".5"/></svg>
    case 'urgency':    return <svg {...p}><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6 3.5 9.5 8 14.5 8 14.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5z"/><circle cx="8" cy="6" r="1.8" fill="currentColor" stroke="none"/></svg>
    default: return null
  }
}

// ── Country selector ──────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchAllFacilities(country = null) {
  const url   = country ? `/api/facilities?country=${country}` : '/api/facilities'
  const empty = { hospital: [], clinic: [], pharmacy: [], dentist: [], lab: [] }
  try {
    const res = await fetch(url)
    if (!res.ok) return empty
    return await res.json()
  } catch { return empty }
}

function toGeoJSON(features) {
  return { type: 'FeatureCollection', features }
}

function facilityGeoJSON(arr) {
  return toGeoJSON(
    (arr ?? []).filter(f => f.location?.x).map(f => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.location.x, f.location.y] },
      properties: { name: f.name ?? 'Facility' },
    }))
  )
}

// ── Mapbox CDN loader ─────────────────────────────────────────────────────────
function loadMapbox() {
  return new Promise(resolve => {
    if (window.mapboxgl) { resolve(window.mapboxgl); return }
    if (!document.getElementById('mapbox-css')) {
      const l = document.createElement('link')
      l.id = 'mapbox-css'; l.rel = 'stylesheet'
      l.href = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'
      document.head.appendChild(l)
    }
    if (document.getElementById('mapbox-js')) {
      document.getElementById('mapbox-js').addEventListener('load', () => resolve(window.mapboxgl))
      return
    }
    const s = document.createElement('script')
    s.id = 'mapbox-js'
    s.src = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'
    s.onload = () => resolve(window.mapboxgl)
    document.head.appendChild(s)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function KlinovaMapSection() {
  const mapDivRef     = useRef(null)
  const mapInstance   = useRef(null)
  const updateLayersRef = useRef(null)

  const [ready, setReady]               = useState(false)
  const [noToken, setNoToken]           = useState(false)
  const [counts, setCounts]             = useState({ cases: 0, hospitals: 0, clinics: 0, pharmacies: 0, dentists: 0, labs: 0, outbreaks: 0 })
  const [active, setActive]             = useState(Object.fromEntries(LAYER_CFG.map(l => [l.id, l.id !== 'urgency'])))
  const [sympLegend, setSympLegend]     = useState([])
  const [whoOutbreaks, setWhoOutbreaks] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loadingFac, setLoadingFac]     = useState(false)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    updateLayersRef.current?.(selectedCountry)
  }, [selectedCountry])

  function toggle(id) {
    setActive(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (mapInstance.current) {
        try { mapInstance.current.setLayoutProperty(id, 'visibility', next[id] ? 'visible' : 'none') } catch {}
      }
      return next
    })
  }

  useEffect(() => {
    if (!mapDivRef.current) return
    let cancelled = false

    if (!MAPBOX_TOKEN) { setNoToken(true); return }

    async function setup() {
      const mapboxgl = await loadMapbox()
      if (cancelled) return

      mapboxgl.accessToken = MAPBOX_TOKEN

      const supabase = createClient()
      const { data: raw } = await supabase
        .from('whatsapp_triage')
        .select('id, location_lat, location_lng, urgency, patient_name, intent, summary')
        .not('location_lat', 'is', null)
      const pts = raw ?? []

      const [osmFacilities, outbreakRes] = await Promise.all([
        fetchAllFacilities(),
        fetch('/api/outbreaks').then(r => r.json()).catch(() => ({ outbreaks: [], advisories: [] })),
      ])

      const hospitals      = osmFacilities.hospital  ?? []
      const clinics        = osmFacilities.clinic    ?? []
      const pharmacyPlaces = osmFacilities.pharmacy  ?? []
      const dentists       = osmFacilities.dentist   ?? []
      const labs           = osmFacilities.lab       ?? []
      const outbreaks      = outbreakRes.outbreaks   ?? []

      if (cancelled) return

      setCounts({
        cases:      pts.length,
        hospitals:  hospitals.length,
        clinics:    clinics.length,
        pharmacies: pharmacyPlaces.length,
        dentists:   dentists.length,
        labs:       labs.length,
        outbreaks:  outbreaks.length,
      })
      setWhoOutbreaks(outbreaks)

      const found = new Set(pts.map(p => categorise(p.intent)).filter(c => c !== 'other'))
      setSympLegend([...found].map(c => ({
        label: SYMPTOM_DEFS[c].label,
        color: `rgb(${SYMPTOM_DEFS[c].color.join(',')})`,
      })))

      // ── Build map ─────────────────────────────────────────────────────────
      const map = new mapboxgl.Map({
        container: mapDivRef.current,
        style:     'mapbox://styles/mapbox/streets-v12',
        center:    [1.22, 6.14],
        zoom:      7,
      })
      mapInstance.current = map

      map.on('load', () => {
        if (cancelled) return

        // ── Sources ────────────────────────────────────────────────────────
        map.addSource('cases', {
          type: 'geojson',
          data: toGeoJSON(pts.map(p => {
            const cat = categorise(p.intent)
            const rgb = SYMPTOM_DEFS[cat]?.color ?? OTHER_COLOR
            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [p.location_lng, p.location_lat] },
              properties: {
                name:          p.patient_name ?? 'Patient',
                urgency:       p.urgency ?? 'medium',
                intent:        p.intent  ?? '—',
                summary:       p.summary ?? '—',
                symptomLabel:  SYMPTOM_DEFS[cat]?.label ?? 'Other',
                symptomColor:  `rgba(${[...rgb, 0.85].join(',')})`,
                urgencyColor: (() => {
                  const URG = { low: 'rgba(46,204,113,0.9)', medium: 'rgba(241,196,15,0.9)', high: 'rgba(231,76,60,0.9)', emergency: 'rgba(155,89,182,0.9)' }
                  return URG[p.urgency] ?? URG.medium
                })(),
              },
            }
          })),
        })

        map.addSource('outbreaks', {
          type: 'geojson',
          data: toGeoJSON(
            outbreaks.filter(ob => ob.location_lat && ob.location_lng).map(ob => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [ob.location_lng, ob.location_lat] },
              properties: {
                disease:  ob.disease,
                location: ob.location_name,
                severity: ob.severity,
                summary:  ob.summary ?? '—',
                color:    ob.severity === 'critical' ? '#C0392B' : '#E67E22',
              },
            }))
          ),
        })

        map.addSource('hospitals',  { type: 'geojson', data: facilityGeoJSON(hospitals)      })
        map.addSource('clinics',    { type: 'geojson', data: facilityGeoJSON(clinics)        })
        map.addSource('pharmacies', { type: 'geojson', data: facilityGeoJSON(pharmacyPlaces) })
        map.addSource('dentists',   { type: 'geojson', data: facilityGeoJSON(dentists)       })
        map.addSource('labs',       { type: 'geojson', data: facilityGeoJSON(labs)           })

        // ── Layers ─────────────────────────────────────────────────────────
        map.addLayer({
          id: 'heatmap', type: 'heatmap', source: 'cases',
          paint: {
            'heatmap-weight':    1,
            'heatmap-intensity': 1.5,
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(255,255,255,0)',
              0.25, 'rgba(255,240,100,0.5)',
              0.55, 'rgba(255,150,0,0.75)',
              0.8,  'rgba(220,50,50,0.9)',
              1,    'rgba(150,0,0,1)',
            ],
            'heatmap-radius':  35,
            'heatmap-opacity': 0.85,
          },
          layout: { visibility: 'visible' },
        })

        map.addLayer({
          id: 'symptoms', type: 'circle', source: 'cases',
          paint: {
            'circle-color':        ['get', 'symptomColor'],
            'circle-radius':       7,
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1.5,
          },
          layout: { visibility: 'visible' },
        })

        map.addLayer({
          id: 'urgency', type: 'circle', source: 'cases',
          paint: {
            'circle-color':        ['get', 'urgencyColor'],
            'circle-radius':       9,
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1.5,
          },
          layout: { visibility: 'none' },
        })

        map.addLayer({
          id: 'outbreaks', type: 'circle', source: 'outbreaks',
          paint: {
            'circle-color':        ['get', 'color'],
            'circle-radius':       10,
            'circle-stroke-color': 'white',
            'circle-stroke-width': 2,
          },
          layout: { visibility: 'visible' },
        })

        ;[
          { id: 'hospitals',  color: '#2980B9', radius: 9  },
          { id: 'clinics',    color: '#1ABC9C', radius: 8  },
          { id: 'pharmacies', color: '#27AE60', radius: 8  },
          { id: 'dentists',   color: '#8E44AD', radius: 8  },
          { id: 'labs',       color: '#D35400', radius: 8  },
        ].forEach(({ id, color, radius }) => {
          map.addLayer({
            id, type: 'circle', source: id,
            paint: {
              'circle-color':        color,
              'circle-radius':       radius,
              'circle-stroke-color': 'white',
              'circle-stroke-width': 1.5,
            },
            layout: { visibility: 'visible' },
          })
        })

        // ── Popups ─────────────────────────────────────────────────────────
        const interactiveLayers = ['symptoms', 'urgency', 'outbreaks', 'hospitals', 'clinics', 'pharmacies', 'dentists', 'labs']
        interactiveLayers.forEach(layerId => {
          map.on('click', layerId, e => {
            const p = e.features[0].properties
            let html = ''
            if (layerId === 'outbreaks') {
              html = `<strong>${p.disease}</strong><br><small style="color:#888">${p.location}</small><br><span style="font-size:11px">${p.summary}</span>`
            } else if (layerId === 'symptoms' || layerId === 'urgency') {
              html = `<strong>${p.name}</strong><br><span style="color:#555;font-size:12px">${p.symptomLabel ?? ''}</span><br><small style="color:#888">${p.intent}</small>`
            } else {
              html = `<strong>${p.name}</strong>`
            }
            new mapboxgl.Popup({ maxWidth: '240px' })
              .setLngLat(e.lngLat)
              .setHTML(html)
              .addTo(map)
          })
          map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
        })

        // ── Country selector updater ───────────────────────────────────────
        updateLayersRef.current = async (country) => {
          setLoadingFac(true)
          try {
            const facs = await fetchAllFacilities(country)
            map.getSource('hospitals') ?.setData(facilityGeoJSON(facs.hospital))
            map.getSource('clinics')   ?.setData(facilityGeoJSON(facs.clinic))
            map.getSource('pharmacies')?.setData(facilityGeoJSON(facs.pharmacy))
            map.getSource('dentists')  ?.setData(facilityGeoJSON(facs.dentist))
            map.getSource('labs')      ?.setData(facilityGeoJSON(facs.lab))
            setCounts(prev => ({
              ...prev,
              hospitals:  facs.hospital?.length  ?? 0,
              clinics:    facs.clinic?.length    ?? 0,
              pharmacies: facs.pharmacy?.length  ?? 0,
              dentists:   facs.dentist?.length   ?? 0,
              labs:       facs.lab?.length       ?? 0,
            }))
            const sel = COUNTRY_SELECTOR.find(c => c.code === country)
            if (sel) map.flyTo({ center: sel.center, zoom: sel.zoom })
          } finally {
            setLoadingFac(false)
          }
        }

        setReady(true)
      })
    }

    setup()
    return () => {
      cancelled = true
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  if (noToken) {
    return (
      <section className="bg-white rounded-xl border border-border shadow-card p-8 text-center">
        <div className="flex justify-center mb-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0E6B4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h3 className="font-semibold text-ink mb-1">Map not configured</h3>
        <p className="text-sm text-ink/50">
          Add <code className="bg-ivory px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to Vercel environment variables to enable the health map.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-xl border border-border shadow-card overflow-hidden">

      {/* Header */}
      <div className="p-5 pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-ink">Disease &amp; Health Tracking Map</h3>
            <p className="text-xs text-ink/50 mt-0.5">
              Live Klinova data · Mapbox · West Africa
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-ink/60 shrink-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9B59B6] shrink-0"/>{counts.cases} cases</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C0392B] shrink-0"/>{counts.outbreaks} WHO alerts</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2980B9] shrink-0"/>{counts.hospitals} hospitals</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1ABC9C] shrink-0"/>{counts.clinics} clinics</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#27AE60] shrink-0"/>{counts.pharmacies} pharmacies</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8E44AD] shrink-0"/>{counts.dentists} dentists</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D35400] shrink-0"/>{counts.labs} labs</span>
          </div>
        </div>

        {/* Country selector */}
        <div className="flex flex-wrap gap-1.5">
          {COUNTRY_SELECTOR.map(c => (
            <button key={c.code ?? 'all'} onClick={() => setSelectedCountry(c.code)}
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
              <LayerIcon id={l.id} /> {l.label}
            </button>
          ))}
        </div>

        {/* Symptom legend */}
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

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-ink/50">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#2980B9]" /> Hospital</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#1ABC9C]" /> Clinic</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#27AE60]" /> Pharmacy</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#8E44AD]" /> Dentist</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#D35400]" /> Lab</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full shrink-0 bg-[#C0392B]" /> WHO Alert</span>
          <span className="text-ink/30 ml-1">Healthsites.io + OpenStreetMap · 7 West African countries</span>
          {counts.cases === 0 && (
            <span className="text-ink/30 italic">
              Patient locations appear once Klinova app &amp; WhatsApp triage are active
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
        <div ref={mapDivRef} className="w-full h-full" />
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
                  background:  topSev ? SEV_BG[topSev]          : '#FAFAF8',
                }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="text-xs font-semibold text-ink truncate">{country.name}</span>
                </div>
                {alerts.length > 0 ? (
                  <div className="space-y-0.5">
                    {alerts.slice(0, 2).map((a, i) => (
                      <p key={i} className="text-xs leading-tight truncate" style={{ color: SEV_COLOR[a.severity] }}>
                        {a.disease}
                      </p>
                    ))}
                    {alerts.length > 2 && <p className="text-xs text-ink/40">+{alerts.length - 2} more</p>}
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

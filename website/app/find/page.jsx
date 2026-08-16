'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'

const C = {
  ink:    '#15302A',
  green:  '#0E6B4F',
  deep:   '#0A5440',
  gold:   '#D99A2B',
  coral:  '#CF5A3C',
  amber:  '#E0A23B',
  soft:   '#E3EFE8',
  ivory:  '#F5EFE3',
  sand:   '#EDE4D2',
  line:   '#E7DECC',
  mute:   '#6E7F76',
}

const fetcher = (url) => fetch(url).then(r => r.json())

const NAV = [
  { key: 'overview',   icon: '🏠', label: 'Overview' },
  { key: 'doctors',    icon: '🩺', label: 'Doctors' },
  { key: 'clinics',    icon: '🏥', label: 'Clinics' },
  { key: 'pharmacies', icon: '💊', label: 'Pharmacies' },
]

export default function FindPage() {
  const [lang, setLang]       = useState('en')
  const [section, setSection] = useState('overview')
  const [search, setSearch]   = useState('')
  const [country, setCountry] = useState('All')
  const [geoCity, setGeoCity] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data, isLoading } = useSWR('/api/directory', fetcher, { refreshInterval: 60000 })

  const doctors    = data?.doctors    ?? []
  const clinics    = data?.clinics    ?? []
  const pharmacies = data?.pharmacies ?? []

  const COVERED_COUNTRIES = ['Togo', 'Ghana', 'Benin', "Côte d'Ivoire"]
  const countries = ['All', ...COVERED_COUNTRIES]

  function filterList(list) {
    return list.filter(item => {
      const matchCountry = country === 'All' || (item.country ?? '').toLowerCase() === country.toLowerCase()
      const q = search.toLowerCase()
      const matchSearch = !q ||
        (item.full_name ?? item.name ?? '').toLowerCase().includes(q) ||
        (item.city ?? '').toLowerCase().includes(q) ||
        (item.address ?? '').toLowerCase().includes(q) ||
        (item.specialty ?? '').toLowerCase().includes(q)
      return matchCountry && matchSearch
    })
  }

  const filteredDoctors    = filterList(doctors)
  const filteredClinics    = filterList(clinics)
  const filteredPharmacies = filterList(pharmacies)

  async function detectLocation() {
    if (!('geolocation' in navigator)) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': 'en' } })
          const json = await res.json()
          const city = json.address?.city ?? json.address?.town ?? json.address?.village ?? ''
          const ctry = json.address?.country ?? ''
          if (city) { setSearch(city); setGeoCity(city) }
          if (ctry) setCountry(ctry)
        } catch {}
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    )
  }

  const t = lang === 'fr' ? FR : EN

  // By-country breakdowns for overview
  const byCountry = useMemo(() => {
    const map = {}
    const all = [
      ...doctors.map(x => ({ ...x, _type: 'doctor' })),
      ...clinics.map(x => ({ ...x, _type: 'clinic' })),
      ...pharmacies.map(x => ({ ...x, _type: 'pharmacy' })),
    ]
    all.forEach(x => {
      const c = x.country || 'Unknown'
      if (!map[c]) map[c] = { doctors: 0, clinics: 0, pharmacies: 0 }
      if (x._type === 'doctor')   map[c].doctors++
      if (x._type === 'clinic')   map[c].clinics++
      if (x._type === 'pharmacy') map[c].pharmacies++
    })
    return Object.entries(map).sort((a, b) => {
      const ta = a[1].doctors + a[1].clinics + a[1].pharmacies
      const tb = b[1].doctors + b[1].clinics + b[1].pharmacies
      return tb - ta
    })
  }, [doctors, clinics, pharmacies])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: C.ivory }}>

      {/* Top nav */}
      <header style={{ background: C.deep, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}
            className="mobile-menu-btn">☰</button>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/klinova-logo-green.jpg" alt="Klinova" height={36} />
          </a>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {lang === 'fr' ? 'Annuaire' : 'Directory'}
          </span>
        </div>

        <div style={{ display: 'flex', align: 'center', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher…' : 'Search…'}
              style={{
                padding: '7px 14px 7px 34px', borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 13,
                fontFamily: 'inherit', width: 200, outline: 'none',
              }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          </div>

          {/* Lang toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.1)', borderRadius: 7, padding: 2 }}>
            {['en','fr'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '4px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, letterSpacing: '.05em', fontFamily: 'inherit',
                  background: lang === l ? '#fff' : 'transparent', color: lang === l ? C.deep : 'rgba(255,255,255,.65)', transition: 'all .15s' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: '#fff', borderRight: `1px solid ${C.line}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
        }}>
          {/* Filters */}
          <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${C.line}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.mute, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 8px' }}>
              {lang === 'fr' ? 'Pays' : 'Country'}
            </p>
            <select value={country} onChange={e => setCountry(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.ivory, color: C.ink, fontSize: 13, fontFamily: 'inherit' }}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button onClick={detectLocation} disabled={geoLoading}
              style={{ width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: geoCity ? C.gold : C.sand, color: geoCity ? '#fff' : C.ink, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              {geoLoading ? '…' : geoCity ? `📍 ${geoCity}` : `📍 ${lang === 'fr' ? 'Près de moi' : 'Near me'}`}
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ padding: '8px 0' }}>
            {NAV.map(item => (
              <button key={item.key} onClick={() => setSection(item.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: section === item.key ? C.soft : 'transparent',
                  borderLeft: section === item.key ? `3px solid ${C.green}` : '3px solid transparent',
                  fontFamily: 'inherit', fontWeight: section === item.key ? 700 : 500,
                  fontSize: 14, color: section === item.key ? C.deep : C.mute,
                  transition: 'all .12s',
                }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>
                  {lang === 'fr'
                    ? { overview: 'Aperçu', doctors: 'Médecins', clinics: 'Cliniques', pharmacies: 'Pharmacies' }[item.key]
                    : item.label}
                </span>
                {item.key !== 'overview' && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: section === item.key ? C.green : C.sand, color: section === item.key ? '#fff' : C.mute, borderRadius: 20, padding: '1px 7px', minWidth: 22, textAlign: 'center' }}>
                    {item.key === 'doctors' ? filteredDoctors.length : item.key === 'clinics' ? filteredClinics.length : filteredPharmacies.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Get listed CTA */}
          <div style={{ marginTop: 'auto', padding: 16, borderTop: `1px solid ${C.line}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.ink, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Vous êtes prestataire ?' : 'Are you a provider?'}
            </p>
            <p style={{ fontSize: 11, color: C.mute, margin: '0 0 10px', lineHeight: 1.5 }}>
              {lang === 'fr' ? 'Votre profil apparaît automatiquement dès l\'inscription.' : 'Your profile is listed automatically on sign up.'}
            </p>
            <a href="/get-started/doctors"
              style={{ display: 'block', textAlign: 'center', padding: '8px 0', borderRadius: 8, background: C.green, color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
              {lang === 'fr' ? 'Rejoindre →' : 'Join →'}
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* ── OVERVIEW ── */}
          {section === 'overview' && (
            <div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>
                {lang === 'fr' ? 'Annuaire des prestataires' : 'Provider directory'}
              </h1>
              <p style={{ fontSize: 14, color: C.mute, margin: '0 0 28px' }}>
                {lang === 'fr'
                  ? 'Médecins, cliniques et pharmacies sur le réseau Klinova — mis à jour automatiquement.'
                  : 'Doctors, clinics, and pharmacies on the Klinova network, updated automatically as they join.'}
              </p>

              {/* Total cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
                {[
                  { icon: '🩺', label: lang === 'fr' ? 'Médecins' : 'Doctors',    value: doctors.length,    color: C.green },
                  { icon: '🏥', label: lang === 'fr' ? 'Cliniques' : 'Clinics',   value: clinics.length,    color: C.coral },
                  { icon: '💊', label: lang === 'fr' ? 'Pharmacies' : 'Pharmacies', value: pharmacies.length, color: C.gold  },
                  { icon: '🌍', label: lang === 'fr' ? 'Pays' : 'Countries',      value: byCountry.length,  color: C.deep  },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'Fraunces', Georgia, serif", lineHeight: 1 }}>
                      {isLoading ? '…' : value}
                    </div>
                    <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* By country table */}
              <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>
                    {lang === 'fr' ? 'Par pays' : 'By country'}
                  </h2>
                  <span style={{ fontSize: 12, color: C.mute }}>{lang === 'fr' ? 'Mis à jour en temps réel' : 'Live auto-updating'}</span>
                </div>
                {byCountry.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: C.mute, fontSize: 14 }}>
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <p style={{ margin: '0 0 16px', color: C.ink, fontWeight: 500 }}>
                        {lang === 'fr' ? 'Aucun prestataire encore inscrit.' : 'No providers yet, be the first to join.'}
                      </p>
                      <a href="/login?mode=signup"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: 8, background: C.green }}>
                        {lang === 'fr' ? 'Rejoindre le réseau →' : 'Join the network →'}
                      </a>
                    </div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                        {[lang === 'fr' ? 'Pays' : 'Country', lang === 'fr' ? 'Médecins' : 'Doctors', lang === 'fr' ? 'Cliniques' : 'Clinics', lang === 'fr' ? 'Pharmacies' : 'Pharmacies', 'Total'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 700, color: C.mute, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {byCountry.map(([ctry, counts]) => {
                        const total = counts.doctors + counts.clinics + counts.pharmacies
                        return (
                          <tr key={ctry} style={{ borderBottom: `1px solid ${C.line}` }}
                            onClick={() => { setCountry(ctry); setSection('doctors') }}
                            className="hover-row">
                            <td style={{ padding: '12px 20px', fontWeight: 600, color: C.ink }}>
                              <span style={{ marginRight: 8 }}>🌍</span>{ctry}
                            </td>
                            <td style={{ padding: '12px 20px', color: C.green, fontWeight: 600 }}>{counts.doctors}</td>
                            <td style={{ padding: '12px 20px', color: C.coral, fontWeight: 600 }}>{counts.clinics}</td>
                            <td style={{ padding: '12px 20px', color: C.gold, fontWeight: 600 }}>{counts.pharmacies}</td>
                            <td style={{ padding: '12px 20px' }}>
                              <span style={{ background: C.soft, color: C.deep, borderRadius: 999, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>{total}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* City breakdown */}
              {byCountry.length > 0 && (
                <div style={{ marginTop: 24, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '20px' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>
                    {lang === 'fr' ? 'Par ville' : 'By city'}
                  </h2>
                  <CityBreakdown doctors={doctors} clinics={clinics} pharmacies={pharmacies} lang={lang} onSelect={(city, ctry) => { setSearch(city); setCountry(ctry); setSection('doctors') }} />
                </div>
              )}
            </div>
          )}

          {/* ── DOCTORS ── */}
          {section === 'doctors' && (
            <ProviderSection
              title={lang === 'fr' ? 'Médecins' : 'Doctors'}
              items={filteredDoctors}
              renderCard={doc => <DoctorCard key={doc.id} doc={doc} lang={lang} />}
              lang={lang}
              isLoading={isLoading}
              onJoin="/get-started/doctors"
            />
          )}

          {/* ── CLINICS ── */}
          {section === 'clinics' && (
            <ProviderSection
              title={lang === 'fr' ? 'Cliniques & Hôpitaux' : 'Clinics & Hospitals'}
              items={filteredClinics}
              renderCard={c => <FacilityCard key={c.id} item={c} icon="🏥" type={lang === 'fr' ? 'Clinique' : 'Clinic'} lang={lang} />}
              lang={lang}
              isLoading={isLoading}
              onJoin="/get-started/clinics"
            />
          )}

          {/* ── PHARMACIES ── */}
          {section === 'pharmacies' && (
            <ProviderSection
              title="Pharmacies"
              items={filteredPharmacies}
              renderCard={p => <FacilityCard key={p.id} item={p} icon="💊" type="Pharmacy" lang={lang} />}
              lang={lang}
              isLoading={isLoading}
              onJoin="/get-started/pharmacy"
            />
          )}

        </main>
      </div>

      <style>{`
        .hover-row { cursor: pointer; transition: background .1s; }
        .hover-row:hover { background: ${C.ivory}; }
        @media (max-width: 640px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}

function CityBreakdown({ doctors, clinics, pharmacies, lang, onSelect }) {
  const cities = useMemo(() => {
    const map = {}
    const all = [
      ...doctors.map(x => ({ city: x.city, country: x.country, _t: 'd' })),
      ...clinics.map(x => ({ city: x.city, country: x.country, _t: 'c' })),
      ...pharmacies.map(x => ({ city: x.city, country: x.country, _t: 'p' })),
    ]
    all.forEach(x => {
      if (!x.city) return
      const key = `${x.city}|${x.country}`
      if (!map[key]) map[key] = { city: x.city, country: x.country, d: 0, c: 0, p: 0 }
      map[key][x._t]++
    })
    return Object.values(map).sort((a, b) => (b.d + b.c + b.p) - (a.d + a.c + a.p)).slice(0, 20)
  }, [doctors, clinics, pharmacies])

  if (cities.length === 0) return <p style={{ fontSize: 13, color: C.mute }}>City data will appear as providers complete their profiles.</p>

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {cities.map(({ city, country, d, c, p }) => (
        <button key={`${city}|${country}`} onClick={() => onSelect(city, country)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.ivory, cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>📍 {city}</span>
          <span style={{ fontSize: 11, color: C.mute }}>{country}</span>
          <span style={{ fontSize: 11, fontWeight: 700, background: C.soft, color: C.deep, borderRadius: 20, padding: '1px 6px' }}>{d + c + p}</span>
        </button>
      ))}
    </div>
  )
}

function ProviderSection({ title, items, renderCard, lang, isLoading, onJoin }) {
  // Group by country → city
  const grouped = useMemo(() => {
    const map = {}
    items.forEach(item => {
      const ctry = item.country || 'Unknown'
      const city = item.city || ''
      if (!map[ctry]) map[ctry] = {}
      if (!map[ctry][city]) map[ctry][city] = []
      map[ctry][city].push(item)
    })
    return map
  }, [items])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: 0 }}>{title}</h1>
        <span style={{ background: C.soft, color: C.deep, borderRadius: 999, padding: '3px 12px', fontSize: 13, fontWeight: 700 }}>{items.length}</span>
      </div>

      {isLoading ? (
        <p style={{ color: C.mute, fontSize: 14 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.mute }}>
          <p style={{ fontSize: 15, marginBottom: 12 }}>
            {lang === 'fr' ? 'Aucun résultat trouvé.' : 'No providers match your search.'}
          </p>
          <a href={onJoin} style={{ color: C.green, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            {lang === 'fr' ? 'Rejoindre le réseau →' : 'Join the network →'}
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.entries(grouped).map(([ctry, cities]) => (
            <div key={ctry}>
              {/* Country header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${C.soft}` }}>
                <span style={{ fontSize: 16 }}>🌍</span>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: 0 }}>{ctry}</h2>
                <span style={{ fontSize: 12, color: C.mute }}>
                  — {Object.values(cities).flat().length} provider{Object.values(cities).flat().length !== 1 ? 's' : ''}
                </span>
              </div>

              {Object.entries(cities).map(([city, cityItems]) => (
                <div key={city} style={{ marginBottom: 20 }}>
                  {city && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.mute, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 10px' }}>
                      📍 {city} — {cityItems.length}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                    {cityItems.map(item => renderCard(item))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DoctorCard({ doc, lang }) {
  const isInhouse = doc.doctor_type === 'inhouse'
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${C.line}`, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: isInhouse ? '#F4E2BC' : C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🩺</div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>Dr. {doc.full_name ?? '—'}</p>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
            background: isInhouse ? '#F4E2BC' : C.soft, color: isInhouse ? '#D99A2B' : C.green }}>
            {isInhouse ? (lang === 'fr' ? 'Télémédecin Klinova' : 'Klinova Teledoctor') : (lang === 'fr' ? 'Médecin partenaire' : 'Partner MD')}
          </span>
        </div>
      </div>
      {doc.specialty && <p style={{ fontSize: 12, color: C.mute, margin: '0 0 4px' }}>{doc.specialty}</p>}
      {(doc.city || doc.country) && (
        <p style={{ fontSize: 11, color: C.mute, margin: '0 0 10px' }}>📍 {[doc.city, doc.country].filter(Boolean).join(', ')}</p>
      )}
      <a href="/login?mode=signup&role=patient"
        style={{ display: 'block', textAlign: 'center', padding: '7px 0', borderRadius: 8, background: C.green, color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
        {lang === 'fr' ? 'Consulter via Klinova' : 'Book via Klinova'}
      </a>
    </div>
  )
}

function FacilityCard({ item, icon, type, lang }) {
  const DAYS = { 0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday' }
  const todayH = item.hours?.[DAYS[new Date().getDay()]]
  const isOpen = todayH?.open !== false

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${C.line}`, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name ?? '—'}</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: C.sand, color: C.mute }}>{type}</span>
            {item.accepting_patients !== false && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: C.soft, color: C.green }}>
                {lang === 'fr' ? 'Accepte patients' : 'Accepting'}
              </span>
            )}
          </div>
        </div>
      </div>
      {item.address && <p style={{ fontSize: 11, color: C.mute, margin: '0 0 3px' }}>📍 {item.address}</p>}
      {todayH && (
        <p style={{ fontSize: 11, margin: '0 0 8px', color: isOpen ? C.green : C.coral, fontWeight: 600 }}>
          {isOpen ? `${lang === 'fr' ? 'Ouvert' : 'Open'}: ${todayH.from}–${todayH.to}` : (lang === 'fr' ? 'Fermé aujourd\'hui' : 'Closed today')}
        </p>
      )}
      {item.services?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 10 }}>
          {item.services.slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: 9, padding: '2px 5px', borderRadius: 5, background: C.sand, color: C.mute }}>{s}</span>
          ))}
          {item.services.length > 3 && <span style={{ fontSize: 10, color: C.mute }}>+{item.services.length - 3}</span>}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        {item.phone && (
          <a href={`tel:${item.phone}`} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8, border: `1px solid ${C.line}`, color: C.ink, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
            {lang === 'fr' ? 'Appeler' : 'Call'}
          </a>
        )}
        <a href="/get-started/patients" style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8, background: C.green, color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
          {lang === 'fr' ? 'Réserver' : 'Book'}
        </a>
      </div>
    </div>
  )
}

const EN = {}
const FR = {}

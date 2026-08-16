'use client'

const C = {
  ink:'#15302A', green:'#0E6B4F', greenDeep:'#0A5440', greenSoft:'#E3EFE8',
  ivory:'#F5EFE3', sand:'#EDE4D2', gold:'#D99A2B', goldSoft:'#F4E2BC',
  mute:'#6E7F76', line:'#E7DECC', card:'#FFFFFF',
}
const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function GovernmentsPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:${ui};color:${C.ink};background:${C.ivory};line-height:1.6;-webkit-font-smoothing:antialiased}
        a{color:inherit;text-decoration:none}
        .wrap{max-width:1140px;margin:0 auto;padding:0 22px}
        .eyebrow{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.green}}
        h1{font-family:${display};font-weight:600;font-size:clamp(36px,4.8vw,58px);line-height:1.03;letter-spacing:-.028em;margin:18px 0 0}
        h1 .accent{color:${C.green}}
        h2{font-family:${display};font-weight:600;font-size:clamp(27px,3.4vw,38px);line-height:1.08;letter-spacing:-.02em;margin-top:12px}
        h3{font-family:${display};font-weight:600;font-size:20px;margin-top:0}
        section{padding:80px 0;border-bottom:1px solid ${C.line}}
        .sub{color:#41554C;font-size:16px;margin-top:14px;line-height:1.65}
        .btn{display:inline-flex;align-items:center;gap:8px;border-radius:11px;padding:13px 22px;font-family:${ui};font-weight:700;font-size:14px;cursor:pointer;border:none;transition:transform .14s,box-shadow .14s,background .14s;text-decoration:none}
        .btn:hover{transform:translateY(-1px)}
        .btn-primary{background:${C.green};color:#fff;box-shadow:0 8px 24px -8px rgba(14,107,79,.7)}
        .btn-primary:hover{background:${C.greenDeep}}
        .btn-ghost{background:rgba(255,255,255,.7);color:${C.ink};border:1.5px solid ${C.line}}
        .btn-ghost:hover{border-color:${C.green};color:${C.greenDeep};background:#fff}
        /* NAV */
        header{position:sticky;top:0;z-index:100;background:rgba(245,239,227,.92);backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid rgba(231,222,204,.6)}
        nav{display:flex;align-items:center;gap:6px;height:66px;padding:0 28px;max-width:1200px;margin:0 auto}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1;justify-content:center}
        .nav-links a{font-size:13.5px;font-weight:600;color:${C.mute};padding:7px 12px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover,.nav-links a.active{color:${C.ink};background:rgba(14,107,79,.07)}
        .nav-links a.active{color:${C.greenDeep}}
        .nav-right{display:flex;align-items:center;gap:8px;flex:none}
        /* HERO */
        .hero{padding:80px 0 96px;position:relative;overflow:hidden;background:${C.greenDeep};border-bottom:none}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 80% 50%,rgba(14,107,79,.4) 0%,transparent 70%);pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(217,154,43,.15);border:1px solid rgba(217,154,43,.3);border-radius:999px;padding:6px 16px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${C.gold};margin-bottom:18px}
        .hero h1{color:#fff}
        .hero h1 .accent{color:${C.gold}}
        .lede{font-size:17px;color:rgba(255,255,255,.78);margin-top:22px;max-width:55ch;line-height:1.68}
        .cta{display:flex;gap:10px;margin-top:30px;flex-wrap:wrap}
        /* CRISIS STATS */
        .stats-band{background:${C.greenDeep};padding:48px 0;border-bottom:1px solid rgba(255,255,255,.08)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(255,255,255,.06);border-radius:20px;overflow:hidden}
        .stat-block{padding:32px 28px;background:transparent}
        .stat-num{font-family:${display};font-size:48px;font-weight:600;color:#fff;line-height:1;letter-spacing:-.02em}
        .stat-unit{font-family:${display};font-size:24px;color:${C.gold}}
        .stat-label{font-size:14px;color:rgba(255,255,255,.6);margin-top:8px;line-height:1.5}
        /* RURAL MODEL */
        .rural-layout{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-top:48px}
        .rural-graphic{background:${C.greenDeep};border-radius:24px;padding:36px 28px}
        .rural-graphic-title{font-family:${display};font-weight:600;font-size:20px;color:#fff;margin-bottom:20px}
        .village-row{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)}
        .village-row:last-child{border-bottom:none}
        .village-icon{font-size:20px;flex:none}
        .village-label{font-size:13px;color:rgba(255,255,255,.65);flex:1}
        .village-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}
        .village-status.active{background:rgba(14,107,79,.3);color:#6ED8A8}
        .village-status.pending{background:rgba(217,154,43,.2);color:${C.gold}}
        /* WHAT WE OFFER */
        .offer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
        .offer-card{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px 22px;display:flex;flex-direction:column;gap:12px}
        .offer-icon{font-size:28px}
        .offer-card h3{font-size:16px;font-weight:700;font-family:${ui};margin:0}
        .offer-card p{font-size:14px;color:${C.mute};line-height:1.6;margin:0;flex:1}
        /* COMPLIANCE */
        .compliance{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
        .comp-card{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px}
        .comp-card h3{font-family:${display};font-size:18px;font-weight:600;margin-bottom:10px}
        .comp-card p{font-size:14px;color:${C.mute};line-height:1.65}
        .comp-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
        .comp-tag{background:${C.greenSoft};color:${C.greenDeep};font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px}
        /* PROCESS */
        .process{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px;position:relative}
        .process::before{content:'';position:absolute;top:22px;left:5%;right:5%;height:1px;background:${C.line};z-index:0}
        .pstep{background:${C.ivory};padding:0;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px}
        .pstep-dot{width:44px;height:44px;border-radius:50%;background:${C.green};color:#fff;font-weight:800;font-size:15px;display:grid;place-items:center;flex:none;position:relative;z-index:1}
        .pstep h4{font-size:15px;font-weight:700;font-family:${ui};margin:0}
        .pstep p{font-size:13px;color:${C.mute};line-height:1.55;margin:0}
        /* DISEASE SURVEILLANCE */
        .surv-layout{display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:start;margin-top:48px}
        .surv-features{display:flex;flex-direction:column;gap:14px}
        .surv-feat{display:flex;gap:14px;align-items:flex-start}
        .surv-feat-icon{width:40px;height:40px;border-radius:12px;background:${C.greenSoft};color:${C.greenDeep};display:grid;place-items:center;font-size:18px;flex:none}
        .surv-feat h4{font-size:15px;font-weight:700;font-family:${ui};margin:0 0 4px}
        .surv-feat p{font-size:13.5px;color:${C.mute};line-height:1.55;margin:0}
        .surv-map{background:${C.greenDeep};border-radius:24px;padding:28px}
        .surv-map-title{font-family:${display};font-weight:600;font-size:18px;color:#fff;margin-bottom:16px}
        .heat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px}
        .heat-label{color:rgba(255,255,255,.65)}
        .heat-bar-wrap{flex:1;margin:0 12px;height:6px;background:rgba(255,255,255,.1);border-radius:999px;overflow:hidden}
        .heat-bar{height:100%;border-radius:999px;background:${C.green}}
        .heat-count{font-weight:700;color:#fff;white-space:nowrap}
        /* CONTACT CTA */
        .contact-cta{background:${C.sand};border-radius:24px;padding:56px 48px;text-align:center}
        .contact-cta h2{margin-top:10px}
        .contact-cta p{font-size:16px;color:#41554C;margin-top:14px;max-width:52ch;margin-left:auto;margin-right:auto;line-height:1.65}
        .contact-options{display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap}
        /* FOOTER */
        footer{background:${C.greenDeep};color:rgba(255,255,255,.7);padding:60px 0 30px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
        .footer-logo-name{font-family:${display};font-weight:700;font-size:18px;color:#fff;margin-bottom:10px}
        .footer-blurb{font-size:13.5px;line-height:1.65;max-width:28ch}
        .footer-tagline{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${C.gold};margin-top:14px}
        .footer-col-title{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px}
        .footer-col a{display:block;font-size:14px;color:rgba(255,255,255,.65);margin-bottom:10px;transition:color .15s}
        .footer-col a:hover{color:#fff}
        .footer-bottom{display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.1);margin-top:48px;padding-top:24px;font-size:12.5px}
        /* ── tablet ─────────────────────────── */
        @media(max-width:1024px){
          .stats-grid{grid-template-columns:1fr 1fr}
          .offer-grid{grid-template-columns:1fr 1fr}
          .rural-layout{grid-template-columns:1fr}
          .surv-layout{grid-template-columns:1fr}
          .process{grid-template-columns:1fr 1fr}
          .process::before{display:none}
          .footer-grid{grid-template-columns:1fr 1fr 1fr}
        }
        /* ── mobile ─────────────────────────── */
        @media(max-width:768px){
          section{padding:56px 0}
          .stats-band{padding:32px 0}
          .stats-grid,.offer-grid,.compliance,.process,.rural-layout,.surv-layout{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          nav{padding:0 14px;height:58px}
          .nav-links{display:none}
          .nav-right a:not(:last-child){display:none}
          .contact-cta{padding:36px 20px}
          .process::before{display:none}
          .stat-num{font-size:36px}
        }
        /* ── small phone ─────────────────────── */
        @media(max-width:480px){
          section{padding:40px 0}
          .wrap{padding:0 16px}
          .footer-grid{grid-template-columns:1fr}
          h1{font-size:30px}
          h2{font-size:22px}
          .hero{padding:52px 0 64px}
          .contact-cta{padding:28px 16px}
          .stat-num{font-size:30px}
          .nav-right .btn{font-size:12px!important;padding:8px 12px!important}
          .footer-col{display:none}
          .footer-grid > div:first-child{display:block}
          .stats-band{padding:24px 0}
        }
      `}</style>

      <header>
        <nav>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height:32, width:'auto', mixBlendMode:'multiply' }} />
          </a>
          <div className="nav-links">
            <a href="/patients">Patients</a>
            <a href="/partner">Partners</a>
            <a href="/governments" className="active">Governments</a>
            <a href="/#pricing">Pricing</a>
          </div>
          <div className="nav-right">
            <a href="/login" style={{ fontSize:13.5, fontWeight:600, color:C.ink, padding:'9px 16px', borderRadius:8, border:`1.5px solid ${C.line}`, background:'#fff', whiteSpace:'nowrap' }}>Log in</a>
            <a href="mailto:contact@klinova.co?subject=Government Partnership" className="btn btn-primary" style={{ fontSize:13, padding:'10px 18px', whiteSpace:'nowrap' }}>Contact our team</a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge">Government & NGO partnerships</div>
          <h1>One doctor. Every<br/><span className="accent">1 in 5,000 villages.</span></h1>
          <p className="lede">Klinova is the telemedicine backbone that lets governments extend quality primary care to every rural community — without building a new clinic in each one.</p>
          <div className="cta">
            <a href="#contact" className="btn btn-primary">Request a briefing</a>
            <a href="mailto:contact@klinova.co" className="btn" style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,.2)', textDecoration:'none' }}>Download overview</a>
          </div>
        </div>
      </section>

      {/* CRISIS STATS */}
      <div className="stats-band">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-block">
              <div><span className="stat-num">1</span><span className="stat-unit">:</span><span className="stat-num">5,000</span></div>
              <div className="stat-label">Doctor-to-patient ratio in rural West Africa</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">72</span><span className="stat-unit">%</span></div>
              <div className="stat-label">Of preventable deaths occur outside major cities</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">14</span></div>
              <div className="stat-label">Languages supported — patients receive care in the language they speak</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">48</span><span className="stat-unit">h</span></div>
              <div className="stat-label">Average time from contract to first village going live</div>
            </div>
          </div>
        </div>
      </div>

      {/* RURAL VILLAGE MODEL */}
      <section>
        <div className="wrap">
          <div className="eyebrow">The rural village model</div>
          <h2>Healthcare coverage where there are no roads to build clinics.</h2>
          <div className="rural-layout">
            <div>
              <p className="sub">Klinova doesn't replace the healthcare system — it extends it. We connect the 1 doctor in the district center to the 5,000 patients spread across remote villages, via WhatsApp, SMS, or the Klinova app.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:28 }}>
                {[
                  { icon:'📲', h:'Any phone, any village', body:'Patients use WhatsApp, SMS, or the Klinova app to reach a licensed doctor. No clinic visit required.' },
                  { icon:'👨‍⚕️', h:'One doctor, many villages', body:'A single doctor deployed by Klinova can handle consultations for hundreds of villages per month through structured triage.' },
                  { icon:'🏥', h:'Escalation when needed', body:'When a patient needs in-person care, Klinova coordinates referral to the nearest government health center.' },
                  { icon:'📊', h:'Real-time data for your ministry', body:'Your ministry of health gets live anonymized data: symptoms, geography, volume — everything you need to plan resources.' },
                ].map(f => (
                  <div key={f.h} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:C.greenSoft, color:C.greenDeep, display:'grid', placeItems:'center', fontSize:18, flexShrink:0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, fontFamily:ui, marginBottom:4 }}>{f.h}</div>
                      <div style={{ fontSize:14, color:C.mute, lineHeight:1.6 }}>{f.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rural-graphic">
              <div className="rural-graphic-title">Village coverage map</div>
              {[
                { icon:'🏘️', label:'Kpové District — 12 villages', status:'active', txt:'Live' },
                { icon:'🏘️', label:'Bassar Region — 8 villages', status:'active', txt:'Live' },
                { icon:'🏘️', label:'Centrale Region — 5 villages', status:'pending', txt:'Onboarding' },
                { icon:'🏘️', label:'Savanes Region — 18 villages', status:'pending', txt:'Planned Q4' },
                { icon:'🏘️', label:'Maritime Region — 22 villages', status:'active', txt:'Live' },
              ].map(v => (
                <div className="village-row" key={v.label}>
                  <div className="village-icon">{v.icon}</div>
                  <div className="village-label">{v.label}</div>
                  <div className={`village-status ${v.status}`}>{v.txt}</div>
                </div>
              ))}
              <div style={{ marginTop:16, background:'rgba(255,255,255,.06)', borderRadius:12, padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,.5)', textAlign:'center' }}>Illustrative — actual coverage varies by contract</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT KLINOVA OFFERS GOVERNMENTS */}
      <section>
        <div className="wrap">
          <div className="eyebrow">What you get</div>
          <h2>A complete telemedicine program, ready to deploy.</h2>
          <p className="sub">Klinova provides everything a ministry of health needs to launch a national telemedicine program — white-labeled under your brand if preferred.</p>
          <div className="offer-grid">
            {[
              { icon:'🏥', h:'Primary care telemedicine', p:'Licensed doctors serving your citizens by app, WhatsApp, or SMS. Consultations documented, prescriptions issued digitally.' },
              { icon:'💊', h:'Medication delivery network', p:'Prescriptions route automatically to the nearest partner pharmacy. Last-mile delivery via our network of local riders.' },
              { icon:'📡', h:'Disease surveillance', p:"Anonymized, real-time symptom data by region. Outbreak detection. Exportable to your ministry's dashboards via API." },
              { icon:'📋', h:'National patient registry', p:'Every patient seen is logged with full consultation history, encrypted and GDPR-compliant. Portable between providers.' },
              { icon:'🌍', h:'Multilingual, every region', p:'Klinova works in 14 languages. Rural patients are served in Eʋe, Kabiyè, Twi, Hausa, Fon, Dioula — not just French.' },
              { icon:'📱', h:'Works on any phone', p:'Smart phones, feature phones, SMS. Community health workers can triage on behalf of patients without smartphones.' },
            ].map(o => (
              <div className="offer-card" key={o.h}>
                <div className="offer-icon">{o.icon}</div>
                <h3>{o.h}</h3>
                <p>{o.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISEASE SURVEILLANCE */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Disease surveillance</div>
          <h2>See outbreaks before they become crises.</h2>
          <div className="surv-layout">
            <div className="surv-features">
              {[
                { icon:'📍', h:'Geographic symptom mapping', p:'Every triage generates a location-tagged symptom report. Cluster detection runs automatically against WHO outbreak thresholds.' },
                { icon:'🔔', h:'Real-time outbreak alerts', p:'Your ministry epidemiology team gets an instant alert when a symptom cluster exceeds threshold — before it reaches the hospital.' },
                { icon:'📤', h:'API export to your systems', p:'Data exports in FHIR R4 format, compatible with WHO DHIS2, OpenMRS, or any ministry health information system.' },
                { icon:'🔒', h:'Privacy by design', p:'All exported data is anonymized and aggregated. No patient PII leaves Klinova without explicit patient consent.' },
              ].map(f => (
                <div className="surv-feat" key={f.h}>
                  <div className="surv-feat-icon">{f.icon}</div>
                  <div>
                    <h4>{f.h}</h4>
                    <p>{f.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="surv-map">
              <div className="surv-map-title">Active symptom signals</div>
              {[
                { label:'Fever + cough', pct:72, count:'1,204 cases' },
                { label:'Diarrhea', pct:48, count:'803 cases' },
                { label:'Malaria symptoms', pct:91, count:'1,521 cases' },
                { label:'Respiratory', pct:35, count:'585 cases' },
                { label:'Skin conditions', pct:22, count:'367 cases' },
              ].map(r => (
                <div className="heat-row" key={r.label}>
                  <div className="heat-label">{r.label}</div>
                  <div className="heat-bar-wrap"><div className="heat-bar" style={{ width:`${r.pct}%` }}/></div>
                  <div className="heat-count">{r.count}</div>
                </div>
              ))}
              <div style={{ marginTop:14, fontSize:11, color:'rgba(255,255,255,.35)', textAlign:'center' }}>Live data — anonymized and aggregated</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Compliance & data sovereignty</div>
          <h2>Built to meet government procurement standards.</h2>
          <div className="compliance">
            <div className="comp-card">
              <h3>Data sovereignty</h3>
              <p>Patient data for each country is stored within its jurisdiction or in the designated regional zone agreed in the contract. Data is never transferred across borders without explicit bilateral agreement.</p>
              <div className="comp-tags">
                <span className="comp-tag">In-country storage</span>
                <span className="comp-tag">No cross-border transfer</span>
                <span className="comp-tag">GDPR compliant</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>Security standards</h3>
              <p>AES-256 field-level encryption for all PHI. TLS 1.3 in transit. Row-level security. Audit logs on every data access. HIPAA-aligned. Penetration tested.</p>
              <div className="comp-tags">
                <span className="comp-tag">AES-256-GCM</span>
                <span className="comp-tag">TLS 1.3</span>
                <span className="comp-tag">HIPAA</span>
                <span className="comp-tag">Audit logging</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>Medical licensing</h3>
              <p>All doctors on the Klinova platform hold valid registration with the national medical licensing authority in their country. We do not allow unlicensed practitioners to see patients.</p>
              <div className="comp-tags">
                <span className="comp-tag">Licensed providers only</span>
                <span className="comp-tag">Country-by-country verification</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>Procurement & contracting</h3>
              <p>Klinova supports open tender processes and is available under government framework agreements. Pilot programs can be structured as 90-day proof-of-concept contracts.</p>
              <div className="comp-tags">
                <span className="comp-tag">Open tender compatible</span>
                <span className="comp-tag">90-day pilot option</span>
                <span className="comp-tag">White-label available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTRACT PROCESS */}
      <section>
        <div className="wrap">
          <div className="eyebrow">How it works</div>
          <h2>From first conversation to village coverage.</h2>
          <p className="sub">We move as fast as government procurement allows — and we know how to navigate it.</p>
          <div className="process">
            <div className="pstep">
              <div className="pstep-dot">1</div>
              <h4>Initial briefing</h4>
              <p>30-minute call with our government partnerships team. We learn your priorities, geography, and constraints.</p>
            </div>
            <div className="pstep">
              <div className="pstep-dot">2</div>
              <h4>Proposal & pilot scope</h4>
              <p>We submit a tailored proposal including pilot district, timeline, and cost per patient covered.</p>
            </div>
            <div className="pstep">
              <div className="pstep-dot">3</div>
              <h4>Pilot deployment</h4>
              <p>90-day proof of concept covering a target district. First villages go live within 48 hours of contract signing.</p>
            </div>
            <div className="pstep">
              <div className="pstep-dot">4</div>
              <h4>National rollout</h4>
              <p>Based on pilot results, scale to full national coverage under a multi-year program agreement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section id="contact" style={{ borderBottom:'none' }}>
        <div className="wrap">
          <div className="contact-cta">
            <div className="eyebrow">Start the conversation</div>
            <h2>Ready to bring telemedicine to your citizens?</h2>
            <p>Our government partnerships team is available for briefings, site visits, and proposal discussions. We work with ministries of health, national health insurance funds, and multilateral development partners.</p>
            <div className="contact-options">
              <a href="mailto:contact@klinova.co?subject=Government Partnership – Briefing Request" className="btn btn-primary">Request a briefing</a>
              <a href="mailto:contact@klinova.co?subject=Government Partnership – Overview Deck" className="btn btn-ghost">Request our deck</a>
            </div>
            <div style={{ marginTop:20, fontSize:13, color:C.mute }}>contact@klinova.co — we respond within 1 business day.</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-logo-name">KLINOVA</div>
              <div className="footer-blurb">The Invisible Grid powering African healthcare. Lomé, Togo.</div>
              <div className="footer-tagline">Born in Africa. Built for Life.</div>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-col">
                <a href="/patients">For patients</a>
                <a href="/partner">For partners</a>
                <a href="/governments">For governments</a>
                <a href="/#pricing">Pricing</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Partners</div>
              <div className="footer-col">
                <a href="/partner#clinics">Clinics</a>
                <a href="/partner#pharmacies">Pharmacies</a>
                <a href="/partner#doctors">Doctors</a>
                <a href="/governments">Governments</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-col">
                <a href="mailto:contact@klinova.co">Contact</a>
                <a href="/privacy">Privacy and data</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Klinova. All rights reserved.</span>
            <span>Powered by Klinova</span>
          </div>
        </div>
      </footer>
    </>
  )
}

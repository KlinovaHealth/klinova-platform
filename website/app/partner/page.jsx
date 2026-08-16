'use client'

const C = {
  ink:'#15302A', green:'#0E6B4F', greenDeep:'#0A5440', greenSoft:'#E3EFE8',
  ivory:'#F5EFE3', sand:'#EDE4D2', gold:'#D99A2B', goldSoft:'#F4E2BC',
  amber:'#E0A23B', mute:'#6E7F76', line:'#E7DECC', card:'#FFFFFF',
}
const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function PartnersPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:${ui};color:${C.ink};background:${C.ivory};line-height:1.6;-webkit-font-smoothing:antialiased}
        a{color:inherit;text-decoration:none}
        button{font-family:${ui}}
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
        .btn-gold{background:${C.gold};color:#fff;box-shadow:0 8px 24px -8px rgba(217,154,43,.6)}
        .btn-gold:hover{background:${C.amber}}
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
        .hero{padding:80px 0 96px;overflow:hidden;position:relative}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 70% 40%,rgba(14,107,79,.07) 0%,transparent 70%);pointer-events:none}
        .hero-inner{max-width:760px}
        .lede{font-size:17px;color:#41554C;margin-top:22px;max-width:55ch;line-height:1.68}
        .cta{display:flex;gap:10px;margin-top:30px;flex-wrap:wrap}
        .trust{display:flex;gap:22px;margin-top:22px;flex-wrap:wrap;font-size:12.5px;color:${C.mute};font-weight:600}
        .trust-item{display:flex;align-items:center;gap:7px}
        .trust-dot{width:5px;height:5px;border-radius:50%;background:${C.gold};flex:none}
        /* PARTNER TYPES */
        .ptype-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
        .ptype-card{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px 22px;display:flex;flex-direction:column;gap:14px}
        .ptype-icon{font-size:32px}
        .ptype-card h3{font-size:17px;font-weight:700;font-family:${ui};margin:0}
        .ptype-card p{font-size:14px;color:${C.mute};line-height:1.6;margin:0;flex:1}
        .ptype-tag{display:inline-block;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;background:${C.greenSoft};color:${C.greenDeep}}
        /* DASHBOARD MODULES */
        .dash-layout{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin-top:48px}
        .module-list{display:flex;flex-direction:column;gap:12px}
        .mod{background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:20px 18px;display:flex;align-items:flex-start;gap:14px}
        .mod-icon{width:40px;height:40px;border-radius:12px;background:${C.greenSoft};color:${C.greenDeep};display:grid;place-items:center;font-size:18px;flex:none}
        .mod-text h4{font-size:15px;font-weight:700;font-family:${ui};margin:0 0 4px}
        .mod-text p{font-size:13px;color:${C.mute};line-height:1.55;margin:0}
        .dash-preview{background:${C.greenDeep};border-radius:24px;padding:28px;position:sticky;top:90px}
        .dash-preview-title{font-family:${display};font-size:22px;font-weight:600;color:#fff;margin-bottom:18px}
        .dash-stat{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;margin-bottom:10px}
        .dash-stat-label{font-size:13px;color:rgba(255,255,255,.6)}
        .dash-stat-val{font-family:${display};font-size:26px;font-weight:600;color:#fff}
        .dash-stat-badge{font-size:11px;font-weight:700;color:${C.gold};background:rgba(217,154,43,.15);padding:3px 8px;border-radius:999px}
        /* HOW TO JOIN */
        .join-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
        .jstep{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px 24px}
        .jstep-num{font-family:${display};font-size:48px;font-weight:600;color:${C.greenSoft};line-height:1;margin-bottom:12px}
        .jstep h3{font-size:17px;font-weight:700;font-family:${ui};margin:0 0 8px}
        .jstep p{font-size:14px;color:${C.mute};line-height:1.6;margin:0}
        /* REVENUE */
        .rev-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:40px}
        .rev-card{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px 22px;display:flex;flex-direction:column;gap:8px}
        .rev-card h3{font-family:${display};font-size:32px;font-weight:600;color:${C.greenDeep}}
        .rev-card-label{font-size:14px;font-weight:700;color:${C.ink}}
        .rev-card p{font-size:13.5px;color:${C.mute};line-height:1.6}
        /* PILOT APPLICATION */
        .pilot{background:${C.sand};border:1px solid ${C.line};border-radius:24px;padding:48px;margin-top:0;display:grid;grid-template-columns:1.2fr .8fr;gap:48px;align-items:center}
        .pilot h2{margin-top:8px}
        .pilot p{margin-top:14px;font-size:15px;color:#41554C;line-height:1.65}
        .pilot-bullets{display:flex;flex-direction:column;gap:8px;margin-top:20px}
        .pilot-bullet{display:flex;align-items:center;gap:10px;font-size:14px;color:${C.ink};font-weight:500}
        .pilot-bullet::before{content:'✓';font-weight:800;color:${C.green};font-size:13px;flex:none}
        .pilot-form{background:${C.card};border-radius:18px;padding:28px;display:flex;flex-direction:column;gap:14px}
        .form-field{display:flex;flex-direction:column;gap:6px}
        .form-label{font-size:12px;font-weight:700;color:${C.mute};letter-spacing:.06em;text-transform:uppercase}
        .form-input{padding:11px 14px;border:1.5px solid ${C.line};border-radius:10px;font-family:${ui};font-size:14px;color:${C.ink};background:#fff;transition:border-color .15s;outline:none}
        .form-input:focus{border-color:${C.green}}
        .form-select{padding:11px 14px;border:1.5px solid ${C.line};border-radius:10px;font-family:${ui};font-size:14px;color:${C.ink};background:#fff;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236E7F76' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
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
          .ptype-grid{grid-template-columns:1fr 1fr}
          .rev-grid{grid-template-columns:1fr 1fr}
          .dash-layout{grid-template-columns:1fr}
          .dash-preview{position:static}
          .footer-grid{grid-template-columns:1fr 1fr 1fr}
        }
        /* ── mobile ─────────────────────────── */
        @media(max-width:768px){
          section{padding:56px 0}
          .ptype-grid,.join-steps,.rev-grid,.dash-layout,.pilot{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          nav{padding:0 14px;height:58px}
          .nav-links{display:none}
          .nav-right a:not(:last-child){display:none}
          .pilot{padding:28px 20px}
          .dash-preview{position:static}
        }
        /* ── small phone ─────────────────────── */
        @media(max-width:480px){
          section{padding:40px 0}
          .wrap{padding:0 16px}
          .footer-grid{grid-template-columns:1fr}
          h1{font-size:32px}
          h2{font-size:24px}
          .pilot-form{padding:20px 16px}
          .form-input,.form-select{font-size:16px}
          .nav-right .btn{font-size:12px!important;padding:8px 12px!important}
          .footer-col{display:none}
          .footer-grid > div:first-child{display:block}
          .rev-card h3{font-size:28px}
        }
      `}</style>

      <header>
        <nav>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height:32, width:'auto', mixBlendMode:'multiply' }} />
          </a>
          <div className="nav-links">
            <a href="/patients">Patients</a>
            <a href="/partner" className="active">Partners</a>
            <a href="/governments">Governments</a>
            <a href="/#pricing">Pricing</a>
          </div>
          <div className="nav-right">
            <a href="/login" style={{ fontSize:13.5, fontWeight:600, color:C.ink, padding:'9px 16px', borderRadius:8, border:`1.5px solid ${C.line}`, background:'#fff', whiteSpace:'nowrap' }}>Log in</a>
            <a href="mailto:contact@klinova.co?subject=Partner Application" className="btn btn-primary" style={{ fontSize:13, padding:'10px 18px', whiteSpace:'nowrap' }}>Become a partner</a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero" style={{ borderBottom:'none' }}>
        <div className="wrap">
          <div className="hero-inner">
            <div className="eyebrow">For healthcare partners</div>
            <h1>Join Africa's <span className="accent">healthcare grid.</span></h1>
            <p className="lede">Clinics, pharmacies, labs, doctors, and transport providers connect to Klinova's patient network — reach more people, reduce no-shows, get paid faster.</p>
            <div className="cta">
              <a href="#apply" className="btn btn-primary">Apply to be a partner</a>
              <a href="mailto:contact@klinova.co" className="btn btn-ghost">Talk to our team</a>
            </div>
            <div className="trust">
              <span className="trust-item"><span className="trust-dot"/><span>No setup fee for pilot partners</span></span>
              <span className="trust-item"><span className="trust-dot"/><span>Instant patient referrals</span></span>
              <span className="trust-item"><span className="trust-dot"/><span>Revenue share model</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER TYPES */}
      <section id="clinics">
        <div className="wrap">
          <div className="eyebrow">Partner types</div>
          <h2>Whether you have a clinic, pharmacy, lab, or motorbike — there's a place for you.</h2>
          <div className="ptype-grid">
            <div className="ptype-card">
              <div className="ptype-icon">🏥</div>
              <h3>Clinics & hospitals</h3>
              <p>Receive pre-triaged patient referrals ready for in-person care. Digital patient dossiers arrive before they walk in the door.</p>
              <span className="ptype-tag">Referrals + dashboard</span>
            </div>
            <div className="ptype-card" id="pharmacies">
              <div className="ptype-icon">💊</div>
              <h3>Pharmacies</h3>
              <p>Receive digital prescriptions directly from Klinova doctors. Zero paper, instant notification, faster dispensing.</p>
              <span className="ptype-tag">Digital Rx + delivery</span>
            </div>
            <div className="ptype-card" id="doctors">
              <div className="ptype-icon">👨‍⚕️</div>
              <h3>Doctors & nurses</h3>
              <p>Consult patients by chat, voice, or video on your own schedule. Klinova handles triage, records, and payment.</p>
              <span className="ptype-tag">Teleconsult income</span>
            </div>
            <div className="ptype-card">
              <div className="ptype-icon">🛵</div>
              <h3>Delivery & transport</h3>
              <p>Deliver medications from partner pharmacies to patients. Join the network and receive steady, verified delivery requests.</p>
              <span className="ptype-tag">Last-mile delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* CLINIC DASHBOARD */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Clinic partner dashboard</div>
          <h2>Everything your clinic needs, in one place.</h2>
          <p className="sub">Klinova's partner dashboard is built around how clinics actually work — appointments, referrals, prescriptions, and performance, all in one screen.</p>
          <div className="dash-layout">
            <div className="module-list">
              {[
                { icon:'📥', h:'Patient referral queue', p:'See incoming Klinova referrals in real time. Accept or reschedule with one click. Patient dossier attached.' },
                { icon:'📅', h:'Appointment management', p:'Full booking calendar linked to your actual capacity. Patients see your real-time availability.' },
                { icon:'📋', h:'Digital health records', p:'Access patient history, prior consults, and prescriptions. No clipboard, no paper.' },
                { icon:'💊', h:'Pharmacy & Rx module', p:'Issue digital prescriptions that route automatically to the nearest partner pharmacy.' },
                { icon:'📊', h:'Analytics & reporting', p:'Track consultations, referrals, revenue, and patient outcomes by day, week, or month.' },
                { icon:'💳', h:'Payments & billing', p:'Klinova handles patient billing and sends your share within 48 hours of each consultation.' },
              ].map(m => (
                <div className="mod" key={m.h}>
                  <div className="mod-icon">{m.icon}</div>
                  <div className="mod-text">
                    <h4>{m.h}</h4>
                    <p>{m.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="dash-preview">
              <div className="dash-preview-title">Clinic overview</div>
              <div className="dash-stat">
                <div>
                  <div className="dash-stat-label">Referrals today</div>
                  <div className="dash-stat-val">14</div>
                </div>
                <div className="dash-stat-badge">+3 new</div>
              </div>
              <div className="dash-stat">
                <div>
                  <div className="dash-stat-label">Revenue this month</div>
                  <div className="dash-stat-val">287k XOF</div>
                </div>
                <div className="dash-stat-badge">↑ 22%</div>
              </div>
              <div className="dash-stat">
                <div>
                  <div className="dash-stat-label">Avg. patient wait</div>
                  <div className="dash-stat-val">12 min</div>
                </div>
                <div className="dash-stat-badge">↓ 8 min</div>
              </div>
              <div style={{ marginTop:18, padding:'14px 16px', background:'rgba(255,255,255,.06)', borderRadius:12 }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:8, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>Pending Rx to fill</div>
                {['Amina K. – Amoxicillin 500mg','Kodjo M. – Metformin 850mg','Abena A. – Ibuprofen 400mg'].map(r => (
                  <div key={r} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,.75)', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:C.gold, flexShrink:0 }}/>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Revenue model</div>
          <h2>You get paid. We grow together.</h2>
          <p className="sub">Klinova partners earn revenue on every referral and consultation routed through the platform.</p>
          <div className="rev-grid">
            <div className="rev-card">
              <h3>80%</h3>
              <div className="rev-card-label">Consultation revenue to clinics</div>
              <p>For every in-clinic visit generated by a Klinova referral, your clinic keeps 80% of the consultation fee.</p>
            </div>
            <div className="rev-card">
              <h3>100%</h3>
              <div className="rev-card-label">Prescription revenue to pharmacies</div>
              <p>You keep full prescription revenue. Klinova earns only a small dispatch fee for routing the prescription to you.</p>
            </div>
            <div className="rev-card">
              <h3>48h</h3>
              <div className="rev-card-label">Payment settlement</div>
              <p>Revenue is settled to your mobile money or bank account within 48 hours of each transaction. No waiting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section>
        <div className="wrap">
          <div className="eyebrow">How to join</div>
          <h2>Onboard in three steps.</h2>
          <div className="join-steps">
            <div className="jstep">
              <div className="jstep-num">01</div>
              <h3>Apply online</h3>
              <p>Fill in the pilot partner form below. Tell us your partner type, location, and capacity. Takes under five minutes.</p>
            </div>
            <div className="jstep">
              <div className="jstep-num">02</div>
              <h3>Get verified</h3>
              <p>Our team verifies your license, location, and readiness. We typically respond within 3 business days.</p>
            </div>
            <div className="jstep">
              <div className="jstep-num">03</div>
              <h3>Go live</h3>
              <p>You're added to the Klinova network. Patients and referrals start flowing immediately. Your dashboard is live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PILOT APPLICATION FORM */}
      <section id="apply">
        <div className="wrap">
          <div className="pilot">
            <div>
              <div className="eyebrow">Pilot partner program</div>
              <h2>Join our pilot. No setup fee.</h2>
              <p>We're expanding our partner network across Togo, Ghana, Benin, and Côte d'Ivoire. Pilot partners are onboarded free of charge and work directly with our team.</p>
              <div className="pilot-bullets">
                <div className="pilot-bullet">No setup fee for pilot partners</div>
                <div className="pilot-bullet">Dedicated onboarding support</div>
                <div className="pilot-bullet">Co-marketing to our patient network</div>
                <div className="pilot-bullet">Early access to new features</div>
                <div className="pilot-bullet">Influence the product roadmap</div>
              </div>
            </div>
            <div className="pilot-form">
              <div style={{ fontFamily:display, fontWeight:600, fontSize:18, color:C.ink, marginBottom:4 }}>Partner application</div>
              <div className="form-field">
                <label className="form-label">Organization name</label>
                <input className="form-input" type="text" placeholder="Clinique Espoir" />
              </div>
              <div className="form-field">
                <label className="form-label">Partner type</label>
                <select className="form-select">
                  <option value="">Select type…</option>
                  <option>Clinic / Hospital</option>
                  <option>Pharmacy</option>
                  <option>Doctor / Nurse (individual)</option>
                  <option>Lab / Diagnostic centre</option>
                  <option>Delivery / Transport</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Country</label>
                <select className="form-select">
                  <option value="">Select country…</option>
                  <option>Togo</option>
                  <option>Ghana</option>
                  <option>Benin</option>
                  <option>Côte d'Ivoire</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Your name</label>
                <input className="form-input" type="text" placeholder="Dr. Abena Mensah" />
              </div>
              <div className="form-field">
                <label className="form-label">Contact email</label>
                <input className="form-input" type="email" placeholder="you@yourclinic.com" />
              </div>
              <a href="mailto:contact@klinova.co?subject=Partner Application" className="btn btn-primary" style={{ justifyContent:'center', marginTop:4 }}>
                Submit application
              </a>
              <p style={{ fontSize:12, color:C.mute, textAlign:'center' }}>We respond within 3 business days.</p>
            </div>
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

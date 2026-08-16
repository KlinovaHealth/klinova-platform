'use client'
import { useState } from 'react'

const C = {
  ink:'#15302A', green:'#0E6B4F', greenDeep:'#0A5440', greenSoft:'#E3EFE8',
  ivory:'#F5EFE3', sand:'#EDE4D2', gold:'#D99A2B', goldSoft:'#F4E2BC',
  mute:'#6E7F76', line:'#E7DECC', card:'#FFFFFF',
}
const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

const COUNTRIES = [
  { code:'TG', flag:'🇹🇬', name:'Togo',         solo:'1 500 XOF', family:'3 500 XOF' },
  { code:'BJ', flag:'🇧🇯', name:'Bénin',         solo:'1 500 XOF', family:'3 500 XOF' },
  { code:'CI', flag:'🇨🇮', name:"Côte d'Ivoire", solo:'1 500 XOF', family:'3 500 XOF' },
  { code:'GH', flag:'🇬🇭', name:'Ghana',         solo:'12 GHS',   family:'28 GHS'   },
  { code:'BF', flag:'🇧🇫', name:'Burkina Faso',  solo:'1 500 XOF', family:'3 500 XOF' },
  { code:'NG', flag:'🇳🇬', name:'Nigeria',       solo:'1 200 NGN', family:'2 800 NGN' },
  { code:'SN', flag:'🇸🇳', name:'Sénégal',       solo:'1 500 XOF', family:'3 500 XOF' },
]

export default function PatientsPage() {
  const [country, setCountry] = useState('TG')
  const selected = COUNTRIES.find(c => c.code === country)

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
        .btn{display:inline-flex;align-items:center;gap:8px;border-radius:11px;padding:13px 22px;font-family:${ui};font-weight:700;font-size:14px;cursor:pointer;border:none;transition:transform .14s,box-shadow .14s,background .14s}
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
        .hero{padding:80px 0 96px;overflow:hidden;position:relative}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 70% 40%,rgba(14,107,79,.07) 0%,transparent 70%);pointer-events:none}
        .hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:60px;align-items:center}
        .lede{font-size:17px;color:#41554C;margin-top:22px;max-width:42ch;line-height:1.68}
        .cta{display:flex;gap:10px;margin-top:30px;flex-wrap:wrap}
        .trust{display:flex;gap:22px;margin-top:22px;flex-wrap:wrap;font-size:12.5px;color:${C.mute};font-weight:600}
        .trust-item{display:flex;align-items:center;gap:7px}
        .trust-dot{width:5px;height:5px;border-radius:50%;background:${C.gold};flex:none}
        .hero-visual{display:flex;justify-content:center;align-items:center;position:relative}
        .hero-visual::before{content:'';position:absolute;width:320px;height:320px;background:radial-gradient(circle,rgba(14,107,79,.12) 0%,transparent 70%);border-radius:50%}
        /* STEPS */
        .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px}
        .step{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:26px 22px;display:flex;flex-direction:column;gap:12px}
        .step-num{width:36px;height:36px;border-radius:10px;background:${C.green};color:#fff;font-weight:800;font-size:14px;display:grid;place-items:center;flex:none}
        .step h3{font-size:16px;font-weight:700;font-family:${ui};margin:0}
        .step p{font-size:14px;color:${C.mute};line-height:1.6;margin:0}
        /* FEATURES */
        .feat{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
        .fcard{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:26px 22px;display:flex;flex-direction:column;gap:12px}
        .fcard-icon{width:44px;height:44px;border-radius:14px;background:${C.greenSoft};color:${C.greenDeep};display:grid;place-items:center;flex:none}
        .fcard h3{font-size:16px;font-weight:700;font-family:${ui};margin:0}
        .fcard p{font-size:14px;color:${C.mute};line-height:1.6;margin:0}
        /* PRICING */
        .price-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:28px}
        .ptab{padding:8px 16px;border-radius:999px;border:1.5px solid ${C.line};background:#fff;font-weight:700;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
        .ptab.active{background:${C.green};border-color:${C.green};color:#fff}
        .price-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px;max-width:740px}
        .pcard{background:${C.card};border:1.5px solid ${C.line};border-radius:20px;padding:30px 28px;display:flex;flex-direction:column;gap:16px}
        .pcard.featured{background:${C.greenDeep};border-color:${C.greenDeep};color:#fff}
        .pcard-label{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.green}}
        .pcard.featured .pcard-label{color:${C.goldSoft}}
        .pcard-price{font-family:${display};font-size:42px;font-weight:600;line-height:1;letter-spacing:-.02em}
        .pcard-period{font-size:14px;font-weight:500;color:${C.mute}}
        .pcard.featured .pcard-period{color:rgba(255,255,255,.6)}
        .pcard-feats{display:flex;flex-direction:column;gap:9px;flex:1}
        .pcard-feat{display:flex;align-items:flex-start;gap:9px;font-size:14px;line-height:1.5}
        .pcard-feat-check{color:${C.green};font-weight:800;flex:none;margin-top:1px}
        .pcard.featured .pcard-feat-check{color:${C.gold}}
        .pcard.featured .pcard-feat{color:rgba(255,255,255,.85)}
        /* GOV BANNER */
        .gov-banner{background:${C.greenSoft};border:1.5px solid rgba(14,107,79,.2);border-radius:20px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:24px;flex-wrap:wrap}
        .gov-banner h3{font-family:${display};font-size:22px;font-weight:600;color:${C.greenDeep};margin:0}
        .gov-banner p{font-size:14px;color:#41554C;margin-top:6px;max-width:50ch}
        /* LICENSING */
        .lic-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:40px}
        .lic-item{background:${C.card};border:1px solid ${C.line};border-radius:14px;padding:18px 20px}
        .lic-country{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.green}}
        .lic-body{font-size:14px;color:${C.ink};font-weight:500;margin-top:6px;line-height:1.4}
        .trust-cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
        .trust-col{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px}
        /* EMERGENCY */
        .emergency{display:flex;gap:9px;align-items:flex-start;background:#FFFBF0;border:1px solid #F0C060;border-radius:10px;padding:11px 14px;font-size:12.5px;color:#7A4A00;line-height:1.55;margin-top:18px;max-width:48ch}
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
          .steps{grid-template-columns:1fr 1fr}
          .feat{grid-template-columns:1fr 1fr}
          .lic-grid{grid-template-columns:1fr 1fr}
          .hero-grid{grid-template-columns:1fr;gap:36px}
          .hero-visual{display:none}
          .footer-grid{grid-template-columns:1fr 1fr 1fr}
        }
        /* ── mobile ─────────────────────────── */
        @media(max-width:768px){
          section{padding:56px 0}
          .hero-grid,.trust-cols,.price-cards{grid-template-columns:1fr}
          .steps{grid-template-columns:1fr 1fr}
          .feat{grid-template-columns:1fr 1fr}
          .lic-grid{grid-template-columns:1fr 1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          nav{padding:0 14px;height:58px}
          .nav-links{display:none}
          .nav-right a:not(:last-child){display:none}
          .gov-banner{flex-direction:column;align-items:flex-start}
        }
        /* ── small phone ─────────────────────── */
        @media(max-width:480px){
          section{padding:40px 0}
          .wrap{padding:0 16px}
          .steps,.feat,.lic-grid{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr}
          h1{font-size:32px}
          h2{font-size:24px}
          .price-tabs{gap:6px}
          .ptab{font-size:12px;padding:6px 12px}
          .nav-right .btn{font-size:12px!important;padding:8px 12px!important}
          .footer-col{display:none}
          .footer-grid > div:first-child{display:block}
        }
      `}</style>

      <header>
        <nav>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height:32, width:'auto', mixBlendMode:'multiply' }} />
          </a>
          <div className="nav-links">
            <a href="/governments">For Governments</a>
            <a href="/patients" className="active">For Individuals</a>
            <a href="/partner">For Partners</a>
            <a href="mailto:contact@klinova.co">Contact</a>
          </div>
          <div className="nav-right">
            <a href="/login" style={{ fontSize:13.5, fontWeight:600, color:C.ink, padding:'9px 16px', borderRadius:8, border:`1.5px solid ${C.line}`, background:'#fff', whiteSpace:'nowrap' }}>Log in</a>
            <a href="/login?mode=signup&role=patient" className="btn btn-primary" style={{ fontSize:13, padding:'10px 18px', textDecoration:'none', whiteSpace:'nowrap' }}>Create account</a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero" style={{ borderBottom:'none' }}>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">For patients</div>
              <h1>Quality healthcare, <span className="accent">on any phone.</span></h1>
              <p className="lede">See a licensed doctor by chat, voice, or video. Digital prescriptions, medication delivery, encrypted records. From 1,500 XOF/month or free via a government program if eligible.</p>
              <div className="cta">
                <a href="/login?mode=signup&role=patient" className="btn btn-primary" style={{ textDecoration:'none' }}>Get the app</a>
                <a href="https://wa.me/22890000000" className="btn btn-ghost" style={{ textDecoration:'none' }}>Chat on WhatsApp</a>
              </div>
              <div className="trust">
                <span className="trust-item"><span className="trust-dot"/><span>Free for patients via government programs</span></span>
                <span className="trust-item"><span className="trust-dot"/><span>Encrypted and private</span></span>
                <span className="trust-item"><span className="trust-dot"/><span>Works on any phone</span></span>
              </div>
              <div className="emergency">Not for emergencies. Call 15 (Togo), 195 (Ghana), 15 (Benin), or 185 (Côte d'Ivoire).</div>
            </div>
            <div className="hero-visual">
              <div style={{ width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, rgba(14,107,79,.15) 0%, transparent 70%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.7 }}><rect x="5" y="1" width="14" height="22" rx="3"/><path d="M12 18h.01"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="wrap">
          <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto' }}>
            <div className="eyebrow">How it works</div>
            <h2>From feeling unwell to cared for in minutes.</h2>
            <p className="sub">Four simple steps, in the language you speak and on the phone you already have.</p>
          </div>
          <div className="steps">
            {[
              { n:'1', h:'Tell us how you feel', p:'Describe your symptoms by text, voice, or photo in any of our fourteen supported languages.' },
              { n:'2', h:'Get guided to the right care', p:'Klinova reviews your symptoms and tells you clearly how urgent your situation is.' },
              { n:'3', h:'See a doctor', p:'Talk to a licensed doctor by chat, voice, or video from anywhere, anytime.' },
              { n:'4', h:'Get your medicine', p:'Your prescription goes straight to the nearest pharmacy. Pick it up or have it delivered.' },
            ].map(s => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="wrap">
          <div className="eyebrow">For patients</div>
          <h2>Care built around how people actually live here.</h2>
          <div className="feat">
            {[
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>, h:'Care in your language', p:'Klinova supports 14 languages including Ewe, Kabiye, Twi, Fon, Dioula, Wolof, Bambara, Hausa, and more.' },
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11"/></svg>, h:'Free via government programs', p:'Most patients pay nothing. If your country has a national health program, Klinova is covered. Pay-per-use plans are also available.' },
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-4.5-6-7.5-6-10a6 6 0 0 1 12 0c0 2.5-2 5.5-6 10z"/><circle cx="12" cy="11" r="2"/></svg>, h:'Find care near you', p:'See the nearest doctors and pharmacies. Your medicine is routed to the closest location.' },
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>, h:'Records that follow you', p:'Your consultations, prescriptions, and results are encrypted and always accessible to you.' },
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 11c0 4.694-4.253 8.5-9.5 8.5a10.2 10.2 0 0 1-4.2-.9L1.5 20.5l1.6-4.8A8.1 8.1 0 0 1 1.5 11C1.5 6.306 5.753 2.5 11 2.5S20.5 6.306 20.5 11z"/></svg>, h:'Reach us anywhere', p:'Use the app, the website, or WhatsApp, whichever works best for you.' },
              { ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="1" width="14" height="22" rx="3"/><path d="M12 18h.01"/></svg>, h:'Every phone counts', p:'No smartphone? Reach Klinova by SMS or with the help of a community health worker.' },
            ].map(f => (
              <div className="fcard" key={f.h}>
                <div className="fcard-icon">{f.ico}</div>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="wrap">
          <div className="eyebrow">Simple pricing</div>
          <h2>Plans that work for real life.</h2>
          <p className="sub">Most patients access Klinova free through government health programs. Individual plans available where government coverage isn't active yet.</p>

          <div className="price-tabs">
            {COUNTRIES.map(c => (
              <button key={c.code} className={`ptab${country === c.code ? ' active' : ''}`} onClick={() => setCountry(c.code)}>
                {c.flag} {c.name}
              </button>
            ))}
          </div>

          <div className="price-cards">
            <div className="pcard">
              <div className="pcard-label">Solo</div>
              <div><span className="pcard-price">{selected?.solo}</span><span className="pcard-period"> / month</span></div>
              <div className="pcard-feats">
                {['App + WhatsApp triage, 24/7','Video & voice consultations','Digital prescriptions','Health records','1 free medication delivery / month','10% off any partner clinic'].map(f => (
                  <div className="pcard-feat" key={f}><span className="pcard-feat-check">✓</span><span>{f}</span></div>
                ))}
              </div>
              <a href="/login?mode=signup&role=patient" className="btn btn-ghost" style={{ textDecoration:'none', textAlign:'center', justifyContent:'center' }}>Get started</a>
            </div>
            <div className="pcard featured">
              <div className="pcard-label">Family <span style={{ fontWeight:400, fontSize:11, opacity:.7 }}>You + 4 members</span></div>
              <div><span className="pcard-price">{selected?.family}</span><span className="pcard-period"> / month</span></div>
              <div className="pcard-feats">
                {['All Solo features for you + 4 family members','App + WhatsApp triage, 24/7','Video & voice consultations','Digital prescriptions','Health records','3 free medication deliveries / month','10% off any partner clinic'].map(f => (
                  <div className="pcard-feat" key={f}><span className="pcard-feat-check">✓</span><span>{f}</span></div>
                ))}
              </div>
              <a href="/login?mode=signup&role=patient" className="btn btn-primary" style={{ textDecoration:'none', textAlign:'center', justifyContent:'center' }}>Get started</a>
            </div>
          </div>

          <div className="gov-banner">
            <div>
              <h3>Covered by a government program?</h3>
              <p>If your country has a national health insurance scheme, Klinova consultations may be fully covered. Ask your local health office or contact us to check.</p>
            </div>
            <a href={`mailto:contact@klinova.co?subject=Government Coverage – ${selected?.name}`} className="btn btn-primary" style={{ textDecoration:'none', whiteSpace:'nowrap' }}>Check my coverage</a>
          </div>
        </div>
      </section>

      {/* MEDICAL STANDARDS */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Medical standards</div>
          <h2>Licensed physicians, country by country.</h2>
          <p className="sub">Every doctor on Klinova holds active registration with the national medical licensing authority in their country before they can see patients.</p>
          <div className="lic-grid">
            {[
              { country:'Togo', body:'Ordre des Médecins du Togo' },
              { country:'Ghana', body:'Medical and Dental Council of Ghana' },
              { country:'Benin', body:'Ordre National des Médecins du Bénin' },
              { country:"Côte d'Ivoire", body:"Ordre National des Médecins de Côte d'Ivoire" },
            ].map(l => (
              <div className="lic-item" key={l.country}>
                <div className="lic-country">{l.country}</div>
                <div className="lic-body">{l.body}</div>
              </div>
            ))}
          </div>
          <div className="trust-cols">
            <div className="trust-col">
              <h3 style={{ fontFamily:display, fontSize:18, marginBottom:10 }}>Built on clinical expertise.</h3>
              <p style={{ fontSize:14, color:C.mute, lineHeight:1.7 }}>Klinova's triage logic, prescription workflows, and patient safety standards are developed alongside practicing physicians and public health professionals across the region. No patient is seen without a credentialed provider.</p>
            </div>
            <div className="trust-col">
              <h3 style={{ fontFamily:display, fontSize:18, marginBottom:10 }}>Your data, protected by law.</h3>
              <p style={{ fontSize:14, color:C.mute, lineHeight:1.7, marginBottom:12 }}>We comply with GDPR, HIPAA, and applicable national health data laws in Togo, Ghana, Benin, and Côte d'Ivoire. All records are end-to-end encrypted. You own your data.</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['GDPR','HIPAA','EU 2016/679','45 CFR 160/164'].map(t => (
                  <span key={t} style={{ background:C.greenSoft, color:C.greenDeep, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:999 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderBottom:'none', background:C.greenDeep, padding:'64px 0' }}>
        <div className="wrap" style={{ textAlign:'center' }}>
          <h2 style={{ color:'#fff' }}>Ready to see a doctor?</h2>
          <p style={{ color:'rgba(255,255,255,.7)', marginTop:14, fontSize:16 }}>Create a free account and speak with a licensed doctor today.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:28, flexWrap:'wrap' }}>
            <a href="/login?mode=signup&role=patient" className="btn btn-primary" style={{ textDecoration:'none' }}>Create free account</a>
            <a href="https://wa.me/22890000000" className="btn" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,.2)', textDecoration:'none' }}>WhatsApp us</a>
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

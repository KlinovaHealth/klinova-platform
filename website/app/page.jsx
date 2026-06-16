'use client'

import { useState } from 'react'

const C = {
  ink: '#15302A',
  green: '#0E6B4F',
  greenDeep: '#0A5440',
  greenSoft: '#E3EFE8',
  ivory: '#F5EFE3',
  sand: '#EDE4D2',
  gold: '#D99A2B',
  goldSoft: '#F4E2BC',
  coral: '#CF5A3C',
  amber: '#E0A23B',
  mute: '#6E7F76',
  line: '#E7DECC',
  card: '#FFFFFF',
}

const display = "'Fraunces', Georgia, serif"
const ui = "'Plus Jakarta Sans', system-ui, sans-serif"

// Languages Klinova serves, with the market each anchors
const LANGS = [
  { name: 'Français', tag: { en: 'West Africa', fr: 'Afrique de l\'Ouest' } },
  { name: 'English', tag: { en: 'West Africa', fr: 'Afrique de l\'Ouest' } },
]

const LANG_LINE = 'Français · English'

export default function Home() {
  const [lang, setLang] = useState('en')

  const text = {
    en: {
      eyebrow1: 'Telemedicine for West Africa',
      h1_p1: 'Healthcare that speaks ',
      h1_accent: 'your language.',
      lede: 'See a trusted doctor from your phone, get your prescription, and find medicine nearby — by app, web, or WhatsApp. Pay with mobile money. Across Togo, Ghana, Benin, and Côte d\'Ivoire.',
      btn1: 'Get the app',
      btn2: 'For clinics & partners',
      langs: 'Available in ' + LANG_LINE,
      trust1: 'Pay with mobile money',
      trust2: 'Encrypted & private',
      trust3: 'Works on any phone',

      lband_eyebrow: 'Speak naturally',
      lband_h: 'French and English. One platform.',
      lband_p: 'Klinova meets people in the language they think and live in — across four countries and counting.',

      eyebrow2: 'How it works',
      h2_1: 'From "I feel unwell" to cared for — in minutes.',
      sub1: 'Four simple steps, in the language you speak and on the phone you already have.',
      step1_h: 'Tell us how you feel',
      step1_p: 'Describe your symptoms by text, voice, or photo — in French or English.',
      step2_h: 'Get guided to the right care',
      step2_p: 'Klinova checks your symptoms and tells you clearly how urgent it is.',
      step3_h: 'See a doctor',
      step3_p: 'Talk to a licensed doctor by chat, voice, or video. Pay with mobile money.',
      step4_h: 'Get your medicine',
      step4_p: 'Your prescription goes to the nearest pharmacy. Pick it up, or have it delivered.',

      eyebrow3: 'For patients',
      h2_2: 'Care built for how people really live here.',
      f1_h: 'Care in your language',
      f1_p: 'Speak naturally — Klinova is available in French and English across all four countries.',
      f2_h: 'Pay with mobile money',
      f2_p: 'No card needed. Pay for consultations and medicine with the mobile wallet you already use.',
      f3_h: 'Find care near you',
      f3_p: 'See the nearest doctors and pharmacies, with medicine routed to the closest one.',
      f4_h: 'Records that follow you',
      f4_p: 'Your consultations, prescriptions, and results — encrypted and always with you.',
      f5_h: 'Reach us anywhere',
      f5_p: 'Use the app, the website, or WhatsApp — whatever is easiest for you.',
      f6_h: 'Every phone counts',
      f6_p: 'No smartphone? Reach Klinova by SMS or with help from a community health worker.',

      eyebrow4: 'For partners',
      h2_3: 'Grow with the network reaching patients first.',
      p1_k: 'Clinics & hospitals',
      p1_h: 'Run your practice on Klinova',
      p1_l1: 'Bookings, records, and billing in one place',
      p1_l2: 'Receive referrals from triaged patients',
      p1_l3: 'Simple monthly SaaS — no big upfront cost',
      p2_k: 'Pharmacies',
      p2_h: 'Join the pharmacy network',
      p2_l1: 'Receive e-prescriptions from nearby patients',
      p2_l2: 'Show real-time stock to people who need it',
      p2_l3: 'More foot traffic, less wasted inventory',
      p3_k: 'Doctors',
      p3_h: 'See patients on your schedule',
      p3_l1: 'Consult by chat, voice, or video from anywhere',
      p3_l2: 'Get paid reliably through mobile money',
      p3_l3: 'Reach patients beyond your city',

      eyebrow5: 'Governments & NGOs',
      h2_4: 'See the health of a population — as it happens.',
      gov_p: 'Klinova turns everyday care into anonymized, geolocated insight: live dashboards for disease surveillance, coverage gaps, and where to send resources next. Individual records stay private — decisions get the whole picture.',
      pill1: 'Disease surveillance',
      pill2: 'Coverage maps',
      pill3: 'Resource planning',
      pill4: 'Anonymized & secure',

      eyebrow6: 'Why we exist',
      ratio: '1 : 5,000',
      impact_p: 'Across the region there is roughly one doctor for every 5,000 people — far below the standard of one per 1,000. Klinova helps close that gap by making the doctors who are here reachable by everyone, wherever they are.',
      card_h: 'Made in Lomé, for West Africa.',
      card_p: 'Klinova is built by a team that knows this region — its languages, its phones, and the way people pay. We start in Togo and grow across West Africa.',

      h2_5: 'Feel better, sooner.',
      cta_p: 'Download Klinova and talk to a doctor today — or partner with us to reach more patients.',

      footer_blurb: 'Telemedicine and digital health for West Africa. Lomé, Togo.',
      footer_product: 'Product',
      footer_partners: 'Partners',
      footer_company: 'Company',
      footer_how: 'How it works',
      footer_patients: 'For patients',
      footer_clinics: 'Clinics',
      footer_pharmacies: 'Pharmacies',
      footer_doctors: 'Doctors',
      footer_governments: 'Governments',
      footer_about: 'About',
      footer_contact: 'Contact',
      footer_privacy: 'Privacy & data',
      footer_cr: '© 2026 Klinova. All rights reserved.',
    },
    fr: {
      eyebrow1: 'Télémédecine pour l\'Afrique de l\'Ouest',
      h1_p1: 'Une santé qui parle ',
      h1_accent: 'votre langue.',
      lede: 'Consultez un médecin de confiance depuis votre téléphone, recevez votre ordonnance et trouvez vos médicaments à proximité — par appli, web ou WhatsApp. Payez avec mobile money. Au Togo, au Ghana, au Bénin et en Côte d\'Ivoire.',
      btn1: 'Télécharger l\'appli',
      btn2: 'Cliniques & partenaires',
      langs: 'Disponible en ' + LANG_LINE,
      trust1: 'Payez avec mobile money',
      trust2: 'Chiffré & confidentiel',
      trust3: 'Sur tout téléphone',

      lband_eyebrow: 'Parlez naturellement',
      lband_h: 'Français et anglais. Une seule plateforme.',
      lband_p: 'Klinova rejoint chacun dans la langue qu\'il pense et vit — dans quatre pays et plus encore.',

      eyebrow2: 'Comment ça marche',
      h2_1: 'De « je ne me sens pas bien » à soigné — en quelques minutes.',
      sub1: 'Quatre étapes simples, dans votre langue et sur le téléphone que vous avez déjà.',
      step1_h: 'Dites-nous comment vous allez',
      step1_p: 'Décrivez vos symptômes par texte, voix ou photo — en français ou en anglais.',
      step2_h: 'Soyez orienté vers le bon soin',
      step2_p: 'Klinova analyse vos symptômes et vous indique clairement l\'urgence.',
      step3_h: 'Consultez un médecin',
      step3_p: 'Parlez à un médecin agréé par chat, voix ou vidéo. Payez avec mobile money.',
      step4_h: 'Recevez vos médicaments',
      step4_p: 'Votre ordonnance est envoyée à la pharmacie la plus proche. À retirer ou livrée.',

      eyebrow3: 'Pour les patients',
      h2_2: 'Des soins pensés pour la vie d\'ici.',
      f1_h: 'Soins dans votre langue',
      f1_p: 'Parlez naturellement — Klinova est disponible en français et en anglais dans les quatre pays.',
      f2_h: 'Payez avec mobile money',
      f2_p: 'Pas de carte requise. Payez consultations et médicaments avec le portefeuille mobile que vous utilisez déjà.',
      f3_h: 'Trouvez des soins près de vous',
      f3_p: 'Voyez les médecins et pharmacies les plus proches, vos médicaments au plus près.',
      f4_h: 'Un dossier qui vous suit',
      f4_p: 'Vos consultations, ordonnances et résultats — chiffrés et toujours avec vous.',
      f5_h: 'Joignable partout',
      f5_p: 'Utilisez l\'appli, le site ou WhatsApp — au plus simple pour vous.',
      f6_h: 'Chaque téléphone compte',
      f6_p: 'Pas de smartphone ? Accédez à Klinova par SMS ou via un agent de santé communautaire.',

      eyebrow4: 'Pour les partenaires',
      h2_3: 'Grandissez avec le réseau qui touche les patients en premier.',
      p1_k: 'Cliniques & hôpitaux',
      p1_h: 'Gérez votre établissement sur Klinova',
      p1_l1: 'Rendez-vous, dossiers et facturation au même endroit',
      p1_l2: 'Recevez des patients déjà orientés',
      p1_l3: 'Abonnement mensuel simple — sans gros coût initial',
      p2_k: 'Pharmacies',
      p2_h: 'Rejoignez le réseau de pharmacies',
      p2_l1: 'Recevez des ordonnances électroniques de proximité',
      p2_l2: 'Affichez votre stock en temps réel',
      p2_l3: 'Plus de clients, moins de stock perdu',
      p3_k: 'Médecins',
      p3_h: 'Consultez à votre rythme',
      p3_l1: 'Consultez par chat, voix ou vidéo, où que vous soyez',
      p3_l2: 'Soyez payé de façon fiable via mobile money',
      p3_l3: 'Touchez des patients au-delà de votre ville',

      eyebrow5: 'Gouvernements & ONG',
      h2_4: 'Voir la santé d\'une population — en temps réel.',
      gov_p: 'Klinova transforme les soins quotidiens en données anonymisées et géolocalisées : tableaux de bord en direct pour la surveillance des maladies, les zones mal desservies et l\'allocation des ressources. Les dossiers individuels restent privés.',
      pill1: 'Surveillance des maladies',
      pill2: 'Cartes de couverture',
      pill3: 'Planification des ressources',
      pill4: 'Anonymisé & sécurisé',

      eyebrow6: 'Notre raison d\'être',
      ratio: '1 : 5 000',
      impact_p: 'Dans la région, il y a environ un médecin pour 5 000 personnes — bien en deçà de la norme d\'un pour 1 000. Klinova réduit cet écart en rendant les médecins accessibles à tous, où qu\'ils soient.',
      card_h: 'Conçu à Lomé, pour l\'Afrique de l\'Ouest.',
      card_p: 'Klinova est conçu par une équipe qui connaît cette région — ses langues, ses téléphones et ses moyens de paiement. Nous commençons au Togo et grandissons en Afrique de l\'Ouest.',

      h2_5: 'Allez mieux, plus vite.',
      cta_p: 'Téléchargez Klinova et parlez à un médecin aujourd\'hui — ou devenez partenaire pour toucher plus de patients.',

      footer_blurb: 'Télémédecine et santé numérique pour l\'Afrique de l\'Ouest. Lomé, Togo.',
      footer_product: 'Produit',
      footer_partners: 'Partenaires',
      footer_company: 'Entreprise',
      footer_how: 'Comment ça marche',
      footer_patients: 'Patients',
      footer_clinics: 'Cliniques',
      footer_pharmacies: 'Pharmacies',
      footer_doctors: 'Médecins',
      footer_governments: 'Gouvernements',
      footer_about: 'À propos',
      footer_contact: 'Contact',
      footer_privacy: 'Confidentialité',
      footer_cr: '© 2026 Klinova. Tous droits réservés.',
    }
  }

  const t = text[lang]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: ${ui}; color: ${C.ink}; background: ${C.ivory}; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        button { font-family: ${ui}; }
        img { display: block; max-width: 100%; }
        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 22px; }
        .serif { font-family: ${display}; }
        .eyebrow { font-size: 12.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${C.green}; }
        .btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 14px; padding: 13px 20px; font-family: ${ui}; font-weight: 700; font-size: 14.5px; cursor: pointer; border: none; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, color .15s ease; }
        .btn:hover { transform: translateY(-1px); }
        .btn-primary { background: ${C.green}; color: #fff; box-shadow: 0 10px 24px -12px rgba(14,107,79,.8); }
        .btn-ghost { background: transparent; color: ${C.ink}; border: 1.5px solid ${C.line}; }
        .btn-ghost:hover { border-color: ${C.green}; color: ${C.greenDeep}; }
        header { position: sticky; top: 0; z-index: 50; background: rgba(245,239,227,.82); backdrop-filter: blur(10px); border-bottom: 1px solid ${C.line}; }
        nav { display: flex; align-items: center; gap: 18px; height: 68px; padding: 0 22px; max-width: 1140px; margin: 0 auto; }
        .mark { display: inline-flex; align-items: center; gap: 10px; }
        .mark img { width: 34px; height: 34px; object-fit: contain; }
        .mark-name { font-family: ${display}; font-weight: 700; font-size: 22px; letter-spacing: -.01em; color: ${C.greenDeep}; }
        .lang { display: inline-flex; border: 1px solid ${C.line}; border-radius: 999px; overflow: hidden; background: ${C.card}; }
        .lang button { border: none; background: transparent; font-family: ${ui}; font-weight: 700; font-size: 12.5px; padding: 6px 11px; cursor: pointer; color: ${C.mute}; }
        .lang button.on { background: ${C.green}; color: #fff; }
        .hero { padding: 64px 0 64px; overflow: hidden; }
        .hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 46px; align-items: center; }
        h1 { font-family: ${display}; font-weight: 600; font-size: clamp(34px, 5vw, 56px); line-height: 1.04; letter-spacing: -.02em; margin: 16px 0 0; }
        h1 .accent { color: ${C.green}; }
        .lede { font-size: 17px; color: #41544B; margin-top: 18px; max-width: 38ch; }
        .cta { display: flex; gap: 12px; margin-top: 26px; flex-wrap: wrap; }
        .langs { margin-top: 22px; font-size: 12.5px; color: ${C.mute}; font-weight: 600; line-height: 1.5; }
        .trust { display: flex; gap: 18px; margin-top: 16px; flex-wrap: wrap; font-size: 12.5px; color: ${C.mute}; font-weight: 600; }
        .dot { width: 6px; height: 6px; border-radius: 9px; background: ${C.gold}; display: inline-block; margin-right: 7px; }
        .stage { position: relative; display: flex; justify-content: center; }
        .stage img { width: min(320px, 82vw); }
        /* language band */
        .lband { background: ${C.greenDeep}; color: #EAF4EF; padding: 40px 0; }
        .lband-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
        .lband .eyebrow { color: ${C.goldSoft}; }
        .lband h2 { color: #fff; font-family: ${display}; font-weight: 600; font-size: clamp(22px, 3vw, 30px); margin-top: 8px; line-height: 1.1; }
        .lband p { color: #A9C8BC; font-size: 14.5px; max-width: 42ch; }
        .lchips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
        .lchip { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); border-radius: 14px; padding: 11px 15px; display: flex; flex-direction: column; gap: 2px; min-width: 120px; }
        .lchip .nm { font-family: ${display}; font-weight: 600; font-size: 17px; color: #fff; }
        .lchip .tg { font-size: 11px; font-weight: 600; letter-spacing: .04em; color: #8FB3A6; text-transform: uppercase; }
        section { padding: 74px 0; border-bottom: 1px solid ${C.line}; }
        .band-alt { background: linear-gradient(180deg, #fff, #FBF7EF); }
        .band-center { text-align: center; max-width: 660px; margin: 0 auto; }
        h2 { font-family: ${display}; font-weight: 600; font-size: clamp(27px, 3.4vw, 38px); line-height: 1.08; letter-spacing: -.015em; margin-top: 12px; }
        .sub { color: #41544B; font-size: 16px; margin-top: 12px; }
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 46px; text-align: left; }
        .step { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 22px; }
        .step .no { font-family: ${display}; font-weight: 600; font-size: 15px; color: #fff; background: ${C.green}; width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; }
        .step h3 { font-size: 16px; margin-top: 16px; font-weight: 700; }
        .step p { font-size: 13.5px; color: ${C.mute}; margin-top: 7px; line-height: 1.55; }
        .feat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 46px; text-align: left; }
        .fcard { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px; }
        .fcard .ic { font-size: 28px; margin-bottom: 16px; }
        .fcard h3 { font-size: 16.5px; font-weight: 700; }
        .fcard p { font-size: 13.5px; color: ${C.mute}; margin-top: 8px; line-height: 1.55; }
        .split { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 42px; text-align: left; }
        .pcard { border-radius: 22px; padding: 26px; color: #fff; background: ${C.greenDeep}; position: relative; overflow: hidden; }
        .pcard:nth-child(2) { background: #13594A; }
        .pcard:nth-child(3) { background: #0E4C3F; }
        .pcard .k { font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: ${C.goldSoft}; }
        .pcard h3 { font-family: ${display}; font-weight: 600; font-size: 21px; margin-top: 10px; }
        .pcard ul { list-style: none; margin-top: 14px; display: flex; flex-direction: column; gap: 7px; }
        .pcard li { font-size: 13px; opacity: .9; display: flex; gap: 8px; align-items: flex-start; }
        .pcard li::before { content: ''; width: 7px; height: 7px; border-radius: 9px; background: ${C.gold}; margin-top: 6px; flex: none; }
        .gov { background: radial-gradient(120% 120% at 80% -10%, #16463A, #0C2B22); color: #EAF4EF; border-radius: 28px; padding: 48px; }
        .gov h2 { color: #fff; }
        .gov .sub { color: #A9C8BC; max-width: 60ch; }
        .pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
        .pill { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 8px 13px; font-size: 12.5px; font-weight: 600; color: #DDEFE7; }
        .impact { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .stat { font-family: ${display}; font-weight: 600; font-size: clamp(40px, 6vw, 64px); color: ${C.green}; line-height: 1; }
        .impact p { color: #41544B; font-size: 16px; margin-top: 10px; }
        .cta-band { background: ${C.green}; border-radius: 28px; padding: 54px; text-align: center; color: #fff; overflow: hidden; position: relative; }
        .cta-band h2 { font-family: ${display}; font-weight: 600; font-size: clamp(28px, 3.6vw, 40px); color: #fff; }
        .cta-band p { opacity: .9; margin-top: 12px; font-size: 16px; }
        .cta-band .cta { display: flex; gap: 12px; justify-content: center; margin-top: 26px; flex-wrap: wrap; }
        .cta-band .btn-primary { background: #fff; color: ${C.greenDeep}; }
        .cta-band .btn-ghost { color: #fff; border-color: rgba(255,255,255,.4); }
        footer { background: #0C211B; color: #B9D0C7; padding: 54px 0 30px; }
        .fgrid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 30px; }
        footer .mark-name { color: #fff; font-size: 24px; }
        footer .mark img { width: 30px; height: 30px; }
        .blurb { font-size: 13px; color: #7FA295; margin-top: 14px; max-width: 30ch; line-height: 1.6; }
        footer h4 { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: #6E8E81; margin-bottom: 14px; }
        footer ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        footer a { font-size: 13.5px; color: #B9D0C7; }
        footer a:hover { color: #fff; }
        .fbottom { border-top: 1px solid rgba(255,255,255,.08); margin-top: 40px; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12.5px; color: #6E8E81; flex-wrap: wrap; gap: 10px; }
        @media(max-width:920px){ .hero-grid{grid-template-columns:1fr;gap:30px} .stage{order:-1} .steps{grid-template-columns:1fr 1fr} .feat{grid-template-columns:1fr 1fr} .gov{padding:34px} .impact{grid-template-columns:1fr;gap:18px} .fgrid{grid-template-columns:1fr 1fr} }
        @media(max-width:760px){ .split{grid-template-columns:1fr} .cta-band,.gov{padding:30px} .lband-head{flex-direction:column;align-items:flex-start} }
        @media(max-width:520px){ .steps,.feat{grid-template-columns:1fr} .fbottom{flex-direction:column} .fgrid{grid-template-columns:1fr} .lchip{flex:1;min-width:calc(50% - 5px)} }
      `}</style>

      <header>
        <nav>
          <a className="mark" href="#top">
            <img src="/klinova-mark.png" alt="Klinova" />
            <span className="mark-name">Klinova</span>
          </a>
          <div style={{ flex: 1 }} />
          <div className="lang">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'fr' ? 'on' : ''} onClick={() => setLang('fr')}>FR</button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow">{t.eyebrow1}</div>
              <h1><span className="serif">{t.h1_p1}<span className="accent">{t.h1_accent}</span></span></h1>
              <p className="lede">{t.lede}</p>
              <div className="cta">
                <button className="btn btn-primary">{t.btn1}</button>
                <button className="btn btn-ghost">{t.btn2}</button>
              </div>
              <div className="langs">{t.langs}</div>
              <div className="trust">
                <span><span className="dot" />{t.trust1}</span>
                <span><span className="dot" />{t.trust2}</span>
                <span><span className="dot" />{t.trust3}</span>
              </div>
            </div>
            <div className="stage">
              <img src="/klinova-logo-full.png" alt="Klinova" />
            </div>
          </div>
        </section>

        {/* LANGUAGE BAND */}
        <div className="lband">
          <div className="wrap">
            <div className="lband-head">
              <div>
                <div className="eyebrow">{t.lband_eyebrow}</div>
                <h2>{t.lband_h}</h2>
              </div>
              <p>{t.lband_p}</p>
            </div>
            <div className="lchips">
              {LANGS.map((l) => (
                <div className="lchip" key={l.name}>
                  <span className="nm">{l.name}</span>
                  <span className="tg">{l.tag[lang]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="band-alt">
          <div className="wrap band-center">
            <div className="eyebrow">{t.eyebrow2}</div>
            <h2>{t.h2_1}</h2>
            <p className="sub">{t.sub1}</p>
          </div>
          <div className="wrap">
            <div className="steps">
              <div className="step"><div className="no">1</div><h3>{t.step1_h}</h3><p>{t.step1_p}</p></div>
              <div className="step"><div className="no">2</div><h3>{t.step2_h}</h3><p>{t.step2_p}</p></div>
              <div className="step"><div className="no">3</div><h3>{t.step3_h}</h3><p>{t.step3_p}</p></div>
              <div className="step"><div className="no">4</div><h3>{t.step4_h}</h3><p>{t.step4_p}</p></div>
            </div>
          </div>
        </section>

        {/* FOR PATIENTS */}
        <section id="patients">
          <div className="wrap band-center">
            <div className="eyebrow">{t.eyebrow3}</div>
            <h2>{t.h2_2}</h2>
          </div>
          <div className="wrap">
            <div className="feat">
              <div className="fcard"><div className="ic">🗣️</div><h3>{t.f1_h}</h3><p>{t.f1_p}</p></div>
              <div className="fcard"><div className="ic">📱</div><h3>{t.f2_h}</h3><p>{t.f2_p}</p></div>
              <div className="fcard"><div className="ic">📍</div><h3>{t.f3_h}</h3><p>{t.f3_p}</p></div>
              <div className="fcard"><div className="ic">📄</div><h3>{t.f4_h}</h3><p>{t.f4_p}</p></div>
              <div className="fcard"><div className="ic">💬</div><h3>{t.f5_h}</h3><p>{t.f5_p}</p></div>
              <div className="fcard"><div className="ic">📞</div><h3>{t.f6_h}</h3><p>{t.f6_p}</p></div>
            </div>
          </div>
        </section>

        {/* FOR PARTNERS */}
        <section id="partners" className="band-alt">
          <div className="wrap band-center">
            <div className="eyebrow">{t.eyebrow4}</div>
            <h2>{t.h2_3}</h2>
          </div>
          <div className="wrap">
            <div className="split">
              <div className="pcard"><div className="k">{t.p1_k}</div><h3>{t.p1_h}</h3><ul><li>{t.p1_l1}</li><li>{t.p1_l2}</li><li>{t.p1_l3}</li></ul></div>
              <div className="pcard"><div className="k">{t.p2_k}</div><h3>{t.p2_h}</h3><ul><li>{t.p2_l1}</li><li>{t.p2_l2}</li><li>{t.p2_l3}</li></ul></div>
              <div className="pcard"><div className="k">{t.p3_k}</div><h3>{t.p3_h}</h3><ul><li>{t.p3_l1}</li><li>{t.p3_l2}</li><li>{t.p3_l3}</li></ul></div>
            </div>
          </div>
        </section>

        {/* GOVERNMENTS */}
        <section id="gov">
          <div className="wrap">
            <div className="gov">
              <div className="eyebrow" style={{ color: C.goldSoft }}>{t.eyebrow5}</div>
              <h2>{t.h2_4}</h2>
              <p className="sub">{t.gov_p}</p>
              <div className="pills">
                <span className="pill">{t.pill1}</span>
                <span className="pill">{t.pill2}</span>
                <span className="pill">{t.pill3}</span>
                <span className="pill">{t.pill4}</span>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="band-alt">
          <div className="wrap impact">
            <div>
              <div className="eyebrow">{t.eyebrow6}</div>
              <div className="stat">{t.ratio}</div>
              <p>{t.impact_p}</p>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 24 }}>
              <h3 className="serif" style={{ fontSize: 21, fontWeight: 600 }}>{t.card_h}</h3>
              <p style={{ marginTop: 12, fontSize: 13.5, color: C.mute }}>{t.card_p}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>{t.h2_5}</h2>
              <p>{t.cta_p}</p>
              <div className="cta">
                <button className="btn btn-primary">{t.btn1}</button>
                <button className="btn btn-ghost">{t.btn2}</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div>
              <a className="mark" href="#top">
                <img src="/klinova-mark.png" alt="Klinova" />
                <span className="mark-name">Klinova</span>
              </a>
              <p className="blurb">{t.footer_blurb}</p>
            </div>
            <div><h4>{t.footer_product}</h4><ul><li><a href="#top">{t.footer_how}</a></li><li><a href="#patients">{t.footer_patients}</a></li><li><a href="#top">{t.btn1}</a></li></ul></div>
            <div><h4>{t.footer_partners}</h4><ul><li><a href="#partners">{t.footer_clinics}</a></li><li><a href="#partners">{t.footer_pharmacies}</a></li><li><a href="#partners">{t.footer_doctors}</a></li><li><a href="#gov">{t.footer_governments}</a></li></ul></div>
            <div><h4>{t.footer_company}</h4><ul><li><a href="#top">{t.footer_about}</a></li><li><a href="mailto:contact@klinova.co">{t.footer_contact}</a></li><li><a href="#top">{t.footer_privacy}</a></li></ul></div>
          </div>
          <div className="fbottom">
            <span>{t.footer_cr}</span>
            <span>{LANG_LINE}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

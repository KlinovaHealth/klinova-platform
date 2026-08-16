'use client'

import { useState, useEffect } from 'react'

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  ink:       '#15302A',
  green:     '#0E6B4F',
  greenDeep: '#0A5440',
  greenSoft: '#E3EFE8',
  ivory:     '#F5EFE3',
  sand:      '#EDE4D2',
  gold:      '#D99A2B',
  goldSoft:  '#F4E2BC',
  amber:     '#E0A23B',
  coral:     '#CF5A3C',
  mute:      '#6E7F76',
  line:      '#E7DECC',
  card:      '#FFFFFF',
}

const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

function KlinovaMark({ size = 36, light = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="36" height="36" rx="10" fill={light ? 'rgba(255,255,255,.12)' : '#0A5440'}/>
      <rect width="36" height="36" rx="10" fill="url(#klm)" opacity=".25"/>
      {/* K stroke — vertical */}
      <path d="M11 9.5V26.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      {/* K top diagonal */}
      <path d="M11.5 18L20.5 9.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      {/* K bottom diagonal */}
      <path d="M11.5 18L20.5 26.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      {/* Gold pulse dot — medical accent */}
      <circle cx="21.5" cy="18" r="2.2" fill="#D99A2B"/>
      <defs>
        <radialGradient id="klm" cx="0%" cy="0%" r="120%">
          <stop offset="0%" stopColor="white" stopOpacity=".3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ─── Language list ─────────────────────────────────────────── */
const LANG_LIST = [
  { code: 'en',  name: 'English',  region: 'Regional' },
  { code: 'fr',  name: 'Français', region: 'Régional' },
  { code: 'ee',  name: 'Eʋe',      region: 'Togo · Ghana · Bénin' },
  { code: 'kbp', name: 'Kabiyè',   region: 'Togo' },
  { code: 'tw',  name: 'Twi',      region: 'Ghana' },
  { code: 'fon', name: 'Fon',      region: 'Bénin · Togo' },
  { code: 'dyu', name: 'Dioula',   region: "Côte d'Ivoire" },
  { code: 'bci', name: 'Baoulé',   region: "Côte d'Ivoire" },
  { code: 'wo',  name: 'Wolof',    region: 'Sénégal · Gambie' },
  { code: 'bm',  name: 'Bambara',  region: 'Mali · Burkina' },
  { code: 'ha',  name: 'Hausa',    region: 'Niger · Nigeria' },
  { code: 'yo',  name: 'Yoruba',   region: 'Nigeria · Bénin' },
  { code: 'ig',  name: 'Igbo',     region: 'Nigeria' },
  { code: 'pcm', name: 'Pidgin',   region: 'Nigeria · Ghana' },
]

/* ─── SVG icons ─────────────────────────────────────────────── */
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9.5"/>
    <path d="M11 1.5c-3 3-4.5 6-4.5 9.5s1.5 6.5 4.5 9.5"/>
    <path d="M11 1.5c3 3 4.5 6 4.5 9.5s-1.5 6.5-4.5 9.5"/>
    <path d="M1.5 11h19"/>
    <path d="M2.5 7h17M2.5 15h17"/>
  </svg>
)
const IconWallet = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="6" width="19" height="14" rx="3"/>
    <path d="M1.5 10h19"/>
    <path d="M15 14.5h.01"/>
    <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20.5S2.5 13.2 2.5 8a8.5 8.5 0 0 1 17 0c0 5.2-8.5 12.5-8.5 12.5z"/>
    <circle cx="11" cy="8" r="2.5"/>
  </svg>
)
const IconFile = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 1.5H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-6-5.5z"/>
    <path d="M13 1.5V7h5.5"/>
    <path d="M7 12h8M7 16h5"/>
  </svg>
)
const IconMessage = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 11c0 4.694-4.253 8.5-9.5 8.5a10.2 10.2 0 0 1-4.2-.9L1.5 20.5l1.6-4.8A8.1 8.1 0 0 1 1.5 11c0-4.694 4.253-8.5 9.5-8.5s9.5 3.806 9.5 8.5z"/>
  </svg>
)
const IconPhone = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="1.5" width="10" height="19" rx="2.5"/>
    <path d="M10 17h2"/>
  </svg>
)
const IconStar = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? '#D99A2B' : 'none'} stroke="#D99A2B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.83.69 3.99L8 10.35l-3.59 1.89.69-3.99L2.2 5.68l4-.58L8 1.5z"/>
  </svg>
)

/* ─── Translations ──────────────────────────────────────────── */
const T = {
  en: {
    eyebrow1: 'Government Healthcare Infrastructure for Africa',
    h1_p1:   'Deploy telemedicine to ',
    h1_accent: 'your citizens.',
    lede: "Serve rural areas. Reduce clinic overcrowding. Save costs. Klinova is the telemedicine backbone that lets governments extend quality primary care to every community without building a new clinic in each one. Individuals can also subscribe directly.",
    btn1: 'Get the app',
    btn2: 'For clinics and partners',
    nav_login: 'Log in',
    nav_create: 'Create account',
    trust1: 'Citizens access care at no cost',
    trust2: 'Deploy in 48 hours from contract',
    trust3: 'Works on any phone',

    lband_eyebrow: 'Speak naturally',
    lband_h: 'Fourteen languages. One platform.',
    lband_p: 'Klinova connects with people in the language they think and live in, across four countries and growing.',

    eyebrow2: 'How it works',
    h2_1: 'Go from feeling unwell to cared for in minutes.',
    sub1: 'Four simple steps, in the language you speak and on the phone you already have.',
    step1_h: 'Tell us how you feel',
    step1_p: 'Describe your symptoms by text, voice, or photo in any of our fourteen supported languages.',
    step2_h: 'Get guided to the right care',
    step2_p: 'Klinova reviews your symptoms and clearly tells you how urgent your situation is.',
    step3_h: 'See a doctor',
    step3_p: 'Talk to a licensed doctor by chat, voice, or video and pay with mobile money.',
    step4_h: 'Get your medicine',
    step4_p: 'Your prescription goes straight to the nearest pharmacy. Pick it up or have it delivered.',

    eyebrow3: 'For patients',
    h2_2: 'Care built around how people actually live here.',
    f1_h: 'Care in your language',
    f1_p: 'Speak naturally. Klinova understands French and English, as well as Eʋe, Kabiyè, Twi, Fon, Dioula, Baoulé, Wolof, Bambara, and Hausa.',
    f2_h: 'Pay with mobile money',
    f2_p: 'No card needed. Pay for consultations and medicine with the mobile wallet you already use.',
    f3_h: 'Find care near you',
    f3_p: 'See the nearest doctors and pharmacies, with your medicine routed to the closest location.',
    f4_h: 'Records that follow you',
    f4_p: 'Your consultations, prescriptions, and results are encrypted and always accessible to you.',
    f5_h: 'Reach us anywhere',
    f5_p: 'Use the app, the website, or WhatsApp, whichever works best for you.',
    f6_h: 'Every phone counts',
    f6_p: 'No smartphone? Reach Klinova by SMS or with the help of a community health worker.',

    eyebrow4: 'For partners',
    h2_3: 'Grow with the network that reaches patients first.',
    p1_k: 'Clinics and hospitals',
    p1_h: 'Run your practice on Klinova',
    p1_l1: 'Bookings, records, and billing all in one place',
    p1_l2: 'Receive referrals from triaged patients',
    p1_l3: 'Simple monthly subscription with no large upfront cost',
    p2_k: 'Pharmacies',
    p2_h: 'Join the pharmacy network',
    p2_l1: 'Receive electronic prescriptions from nearby patients',
    p2_l2: 'Show real-time stock to people who need it',
    p2_l3: 'More foot traffic and less wasted inventory',
    p3_k: 'Doctors',
    p3_h: 'See patients on your schedule',
    p3_l1: 'Consult by chat, voice, or video from anywhere',
    p3_l2: 'Get paid reliably through mobile money',
    p3_l3: 'Reach patients well beyond your city',

    eyebrow5: 'Governments & NGOs',
    h2_4: 'Real-time disease surveillance licensed to your Ministry of Health, with clear steps and requirements to facilitate adoption and compliance.',
    gov_p: 'Governments and organizations like the WHO urgently need real-time data to combat outbreaks of Malaria, Cholera, and Dengue. Klinova licenses its Invisible Grid dashboard to Ministries of Health as a strategic asset, providing location-based intelligence from clinical encounters that helps identify coverage gaps, outbreak clusters, and resource needs. Individual privacy remains fully protected, supporting effective and responsible decision-making.',
    pill1: 'Outbreak detection',
    pill2: 'Live coverage maps',
    pill3: "Klinova's Invisible Grid",
    pill4: 'GDPR & HIPAA compliant',
    gov_step1_n: '01', gov_step1_h: 'Request a Demo',          gov_step1_p: 'Schedule a live walkthrough with the Klinova team.',
    gov_step2_n: '02', gov_step2_h: 'Sign a Data Agreement',   gov_step2_p: 'We provide a standard MOU template aligned with WHO data-governance guidelines.',
    gov_step3_n: '03', gov_step3_h: 'Onboarding & Integration',gov_step3_p: 'Connect your Ministry\'s systems. Typical setup is 4–6 weeks with dedicated support.',
    gov_step4_n: '04', gov_step4_h: 'Launch & Monitor',        gov_step4_p: 'Your team receives a live dashboard, staff training, and ongoing technical support.',

    eyebrow6: 'Why we exist',
    ratio: '1 : 5,000',
    impact_p: 'Across Africa, there is roughly one doctor for every 5,000 people. Klinova closes this gap. By building the digital network that connects patients, clinics, and delivery partners on one unified grid, we multiply the reach of every available doctor. We are making reliable healthcare accessible to anyone, anywhere on the continent.',
    card_h: 'Born in Africa. Built for Life.',
    card_p: 'Klinova is built by a team that knows this region deeply: its languages, its devices, and how people pay. We started in Togo and are growing across West Africa.',

    h2_5: 'Feel better, sooner.',
    cta_p: 'Download Klinova and speak with a doctor today. Or partner with us to reach more patients.',

    footer_blurb: "The Invisible Grid powering African healthcare. Lomé, Togo.",
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
    footer_privacy: 'Privacy and data',
    footer_cr: '© 2026 Klinova. All rights reserved.',

    nav_how: 'How it works',
    nav_patients: 'Patients',
    nav_partners: 'Partners',
    nav_gov: 'Governments',
    nav_pricing: 'Pricing',

    emergency: "Not for life-threatening emergencies. If it is an emergency, call 15 (Togo), 195 (Ghana), 15 (Benin), or 185 (Côte d'Ivoire).",
    lic_eyebrow: 'Medical standards',
    lic_h: 'Licensed physicians, country by country.',
    lic_p: 'Every doctor on Klinova holds active registration with the national medical licensing authority in their country before they can see patients on our platform.',
    lic_togo: 'Togo', lic_togo_body: 'Ordre des Médecins du Togo',
    lic_ghana: 'Ghana', lic_ghana_body: 'Medical and Dental Council of Ghana',
    lic_benin: 'Benin', lic_benin_body: 'Ordre National des Médecins du Bénin',
    lic_civ: "Côte d'Ivoire", lic_civ_body: "Ordre National des Médecins de Côte d'Ivoire",
    advisory_h: 'Built on clinical expertise.',
    advisory_p: "Klinova's triage logic, prescription workflows, and patient safety standards are developed alongside practicing physicians and public health professionals across the region. No patient is seen without a credentialed provider.",
    compliance_h: 'Your data, protected by law.',
    compliance_p: "We comply with GDPR (EU Regulation 2016/679), HIPAA (45 CFR Parts 160 and 164), and applicable national health data laws in Togo, Ghana, Benin, and Côte d'Ivoire. All records are end-to-end encrypted. You own your data.",
    privacy_link: 'Read our full privacy and data policy',
    pilot_eyebrow: 'Pilot partners',
    pilot_h: 'Trusted by early partners across West Africa.',
    pilot_note: 'Klinova is actively onboarding founding clinic, pharmacy, and hospital partners. Early partners help shape the platform and receive priority onboarding and support.',
    pilot_join: 'Apply for founding partner status',
    cta_eyebrow: 'Get started with Klinova',
    cta_patients: 'Start a consultation',
    cta_patients_sub: 'For patients',
    patient_create_account: 'Create a free account',
    patient_login: 'Log in',
    patient_see_pricing: 'See what\'s included →',
    patient_cta_sub: 'Sign up free to explore what Klinova offers. Choose a plan when you\'re ready.',
    cta_doctors: 'Join as a provider',
    cta_doctors_sub: 'For doctors',
    cta_clinics: 'Partner with Klinova',
    cta_clinics_sub: 'For clinics and hospitals',
    cta_pharmacy: 'Join the pharmacy network',
    cta_pharmacy_sub: 'For pharmacies',
    cta_gov_btn: 'Request a demo',
    cta_gov_sub: 'For governments and NGOs',
    price_eyebrow: 'Access for every situation',
    price_h: 'For governments, individuals, and partners.',
    price_individual: 'Solo',
    price_family: 'Family',
    price_family_sub: 'You + 4 family members',
    price_per_month: '/ month',
    price_included: "What's included",
    price_feat1: 'App + WhatsApp triage, 24/7',
    price_feat2: 'Video & voice consultations',
    price_feat3: 'Digital prescriptions',
    price_feat4: 'Health records',
    price_feat5: '1 free medication delivery / month',
    price_feat6: '10% off any partner clinic',
    price_family_extra: 'All of the above, for you + 4 family members',
    price_family_feat5: '3 free medication deliveries / month',
    price_cta: 'Get started',
    price_partners_h: 'For doctors, pharmacies & partners',
    price_doc_label: 'Doctors',
    price_doc_tag: 'Free to join',
    price_doc_desc: 'Keep 70% of every consultation. We send you pre-triaged patients, no marketing spend, no upfront cost.',
    price_pharm_label: 'Pharmacies',
    price_pharm_tag: '8–15% commission',
    price_pharm_desc: 'Pay a commission only on prescriptions fulfilled through Klinova. We route the orders and handle delivery.',
    price_clinic_label: 'Clinics & Hospitals',
    price_clinic_tag: '$20–40 / month',
    price_clinic_desc: 'Dashboard + calendar access, pinned on our map. Pay a small referral fee only when a pre-triaged patient actually walks in.',
    price_transport_label: 'Transport & Delivery',
    price_transport_tag: 'Free for patients',
    price_transport_desc: 'Deliver medications and transport patients included in every Care Plan. Klinova routes thousands of guaranteed, GPS-mapped deliveries to your drivers every month.',
    cta_transport_subj: 'Transport & Delivery Partnership – Klinova',
    price_note: 'Prices shown in local currency. No hidden fees. Cancel anytime.',

    modules_eyebrow: 'Clinic dashboard',
    modules_h: 'A complete suite for your clinic.',
    modules_sub: 'Every module built for African health professionals works on any device and is offline-ready.',
    mod1_h: 'Consultations',   mod1_p: 'Full workflow: reason, exam, diagnosis, treatment and follow-up notes.',
    mod2_h: 'Patients',        mod2_p: 'Complete medical record with visit history and emergency contacts.',
    mod3_h: 'Prescriptions',   mod3_p: 'Digital prescription with dosage instructions and printable view.',
    mod4_h: 'Appointments',    mod4_p: 'Doctor calendar, availability management and status tracking.',
    mod5_h: 'Payments',        mod5_p: 'Cash, mobile money (Flooz, TMoney, MTN). Receipts and history.',
    mod6_h: 'Nurse Triage',    mod6_p: 'Vital signs, triage notes and real-time waiting queue.',
    mod7_h: 'Reports',         mod7_p: 'KPIs, charts and clinic activity analysis.',
    mod8_h: 'Administration',  mod8_p: 'User management, roles and clinic settings.',
    cta_patients_subj: 'Start a Consultation – Klinova',
    cta_patients_body: 'Hello, I would like to start a consultation. My name is [your name] and I am reaching out from [your location].',
    cta_doctors_subj: 'Join as a Provider – Klinova',
    cta_doctors_body: 'Hello, I am a healthcare provider interested in joining Klinova. My name is [your name], specialty: [your specialty], location: [your location].',
    cta_clinics_subj: 'Partner with Klinova – Clinic / Hospital',
    cta_clinics_body: 'Hello, we are interested in partnering with Klinova. Facility name: [name], location: [city, country], type: [clinic / hospital].',
    cta_pharmacy_subj: 'Join the Pharmacy Network – Klinova',
    cta_pharmacy_body: 'Hello, I would like to join the Klinova pharmacy network. Pharmacy name: [name], location: [city, country].',
    cta_gov_subj: 'Request a Demo – Klinova Government / NGO',
    cta_gov_body: 'Hello, we represent [organisation name] and would like to request a demo. Country: [country], contact: [your name & phone].',
    cta_pilot_subj: 'Join the Klinova Pilot Programme',
    already_account: 'Already have an account?',
    sign_in: 'Sign in →',

    pilot_status: 'Pilot launching in Togo and Ghana',
    test_eyebrow: 'Testimonials',
    test_h: 'Trusted by our early users.',
    test1_q: 'Klinova has transformed the way we work. Consultations are better documented and patient follow-up has become simple and effective.',
    test1_name: 'Dr. Ama Koudou',
    test1_role: 'General Practitioner',
    test1_place: 'Clinique Espoir Santé, Lomé',
    test2_q: 'Patient care is much faster now. The triage module saves us valuable time every single day.',
    test2_name: 'Inf. Kokou Dzifa',
    test2_role: 'Head Nurse',
    test2_place: 'Centre Médical de Kara',
    test3_q: 'I can see my appointments, my prescriptions, and my full medical history directly on my phone. It is genuinely convenient.',
    test3_name: 'Mme Adjoa Mensah',
    test3_role: 'Patient',
    test3_place: 'Lomé',
  },

  fr: {
    eyebrow1: "Infrastructure de télémédecine gouvernementale pour l'Afrique",
    h1_p1:   'Déployez la télémédecine pour ',
    h1_accent: 'vos citoyens.',
    lede: "Desservez les zones rurales. Réduisez la surpopulation des cliniques. Réduisez les coûts. Klinova fournit aux gouvernements l'infrastructure de télémédecine pour étendre les soins primaires à l'ensemble du territoire. Les particuliers peuvent également s'abonner directement.",
    btn1: "Télécharger l'appli",
    nav_login: 'Connexion',
    nav_create: 'Créer un compte',
    btn2: 'Cliniques et partenaires',
    trust1: 'Les citoyens accèdent aux soins gratuitement',
    trust2: 'Déploiement en 48 heures dès la signature',
    trust3: 'Sur tout téléphone',

    lband_eyebrow: 'Parlez naturellement',
    lband_h: 'Quatorze langues. Une seule plateforme.',
    lband_p: "Klinova rejoint chacun dans la langue dans laquelle il pense et vit, dans quatre pays et en expansion.",

    eyebrow2: 'Comment ça marche',
    h2_1: 'De "je ne me sens pas bien" à soigné, en quelques minutes.',
    sub1: 'Quatre étapes simples, dans votre langue et sur le téléphone que vous avez déjà.',
    step1_h: 'Dites-nous comment vous allez',
    step1_p: "Décrivez vos symptômes par texte, voix ou photo dans l'une de nos quatorze langues disponibles.",
    step2_h: 'Soyez orienté vers le bon soin',
    step2_p: "Klinova analyse vos symptômes et vous indique clairement la marche à suivre.",
    step3_h: 'Consultez un médecin',
    step3_p: 'Parlez à un médecin agréé par chat, voix ou vidéo et payez avec mobile money.',
    step4_h: 'Recevez vos médicaments',
    step4_p: "Votre ordonnance est envoyée directement à la pharmacie la plus proche. À retirer ou à faire livrer.",

    eyebrow3: 'Pour les patients',
    h2_2: "Des soins conçus pour la vie telle qu'elle est ici.",
    f1_h: 'Soins dans votre langue',
    f1_p: "Parlez naturellement. Klinova comprend le français et l'anglais, ainsi que l'eʋe, le kabiyè, le twi, le fon, le dioula, le baoulé, le wolof, le bambara et le hausa.",
    f2_h: 'Payez avec mobile money',
    f2_p: 'Pas de carte requise. Payez consultations et médicaments avec le portefeuille mobile que vous utilisez déjà.',
    f3_h: 'Trouvez des soins près de vous',
    f3_p: 'Voyez les médecins et pharmacies les plus proches, vos médicaments acheminés au plus près.',
    f4_h: 'Un dossier qui vous suit',
    f4_p: 'Vos consultations, ordonnances et résultats sont chiffrés et toujours à votre portée.',
    f5_h: 'Joignable partout',
    f5_p: "Utilisez l'appli, le site ou WhatsApp, selon ce qui vous convient le mieux.",
    f6_h: 'Chaque téléphone compte',
    f6_p: "Pas de smartphone ? Accédez à Klinova par SMS ou avec l'aide d'un agent de santé communautaire.",

    eyebrow4: 'Pour les partenaires',
    h2_3: 'Grandissez avec le réseau qui atteint les patients en premier.',
    p1_k: 'Cliniques et hôpitaux',
    p1_h: 'Gérez votre établissement sur Klinova',
    p1_l1: 'Rendez-vous, dossiers et facturation au même endroit',
    p1_l2: 'Recevez des patients déjà orientés',
    p1_l3: 'Abonnement mensuel simple, sans investissement initial important',
    p2_k: 'Pharmacies',
    p2_h: 'Rejoignez le réseau de pharmacies',
    p2_l1: 'Recevez des ordonnances électroniques de proximité',
    p2_l2: 'Affichez votre stock en temps réel',
    p2_l3: 'Plus de clients, moins de stock perdu',
    p3_k: 'Médecins',
    p3_h: 'Consultez à votre rythme',
    p3_l1: 'Consultez par chat, voix ou vidéo, où que vous soyez',
    p3_l2: 'Soyez payé de façon fiable via mobile money',
    p3_l3: 'Atteignez des patients bien au-delà de votre ville',

    eyebrow5: 'Gouvernements et ONG',
    h2_4: 'Surveillance des maladies en temps réel sous licence pour votre Ministère de la Santé, avec des étapes et exigences claires pour faciliter l\'adoption et la conformité.',
    gov_p: "Les gouvernements et organisations comme l'OMS ont besoin de données en temps réel pour combattre les épidémies de paludisme, choléra et dengue. Klinova licence son tableau de bord Klinova's Invisible Grid aux Ministères de la Santé comme actif stratégique, fournissant une intelligence géolocalisée issue des consultations cliniques pour identifier les lacunes de couverture, les foyers épidémiques et les besoins en ressources. La confidentialité individuelle reste entièrement protégée, soutenant une prise de décision efficace et responsable.",
    pill1: 'Détection des épidémies',
    pill2: 'Cartes de couverture en direct',
    pill3: "Klinova's Invisible Grid",
    pill4: 'Conforme RGPD & HIPAA',
    gov_step1_n: '01', gov_step1_h: 'Demander une démonstration',   gov_step1_p: "Planifiez un aperçu en direct avec l'équipe Klinova.",
    gov_step2_n: '02', gov_step2_h: 'Signer un accord de données',  gov_step2_p: 'Nous fournissons un modèle de protocole d\'accord conforme aux directives de gouvernance des données de l\'OMS.',
    gov_step3_n: '03', gov_step3_h: 'Intégration et onboarding',    gov_step3_p: 'Connectez les systèmes de votre Ministère. La configuration typique prend 4 à 6 semaines.',
    gov_step4_n: '04', gov_step4_h: 'Lancement et suivi',           gov_step4_p: 'Votre équipe reçoit un tableau de bord en direct, une formation et un support technique continu.',

    eyebrow6: "Notre raison d'être",
    ratio: '1 : 5 000',
    impact_p: "En Afrique, on compte environ un médecin pour 5 000 personnes. Klinova comble cet écart. En construisant le réseau numérique qui connecte patients, cliniques et partenaires de livraison sur une même plateforme, nous multiplions la portée de chaque médecin disponible. Nous rendons des soins fiables accessibles à tous, partout sur le continent.",
    card_h: "Né en Afrique. Conçu pour la vie.",
    card_p: "Klinova est développé par une équipe qui connaît profondément cette région : ses langues, ses appareils et ses modes de paiement. Nous avons débuté au Togo et nous étendons à toute l'Afrique de l'Ouest.",

    h2_5: 'Allez mieux, plus vite.',
    cta_p: "Téléchargez Klinova et parlez à un médecin dès aujourd'hui. Ou devenez partenaire pour atteindre davantage de patients.",

    footer_blurb: "La Grille Invisible qui alimente la santé africaine. Lomé, Togo.",
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
    footer_privacy: 'Confidentialité et données',
    footer_cr: '© 2026 Klinova. Tous droits réservés.',

    nav_how: 'Comment ça marche',
    nav_patients: 'Patients',
    nav_partners: 'Partenaires',
    nav_gov: 'Gouvernements',
    nav_pricing: 'Tarifs',

    emergency: "En cas d'urgence vitale, n'utilisez pas cette application. Appelez le 15 (Togo), le 195 (Ghana), le 15 (Bénin) ou le 185 (Côte d'Ivoire).",
    lic_eyebrow: 'Normes médicales',
    lic_h: 'Médecins agréés, pays par pays.',
    lic_p: "Chaque médecin sur Klinova est titulaire d'un enregistrement actif auprès de l'autorité nationale d'agrément médical de son pays avant de pouvoir voir des patients sur notre plateforme.",
    lic_togo: 'Togo', lic_togo_body: 'Ordre des Médecins du Togo',
    lic_ghana: 'Ghana', lic_ghana_body: 'Medical and Dental Council of Ghana',
    lic_benin: 'Bénin', lic_benin_body: 'Ordre National des Médecins du Bénin',
    lic_civ: "Côte d'Ivoire", lic_civ_body: "Ordre National des Médecins de Côte d'Ivoire",
    advisory_h: 'Construit sur l\'expertise clinique.',
    advisory_p: "Les protocoles de triage, les processus de prescription et les normes de sécurité des patients de Klinova sont développés aux côtés de médecins praticiens et de professionnels de santé publique à travers la région. Aucun patient n'est vu sans un prestataire accrédité.",
    compliance_h: 'Vos données, protégées par la loi.',
    compliance_p: "Nous respectons le RGPD (Règlement UE 2016/679), la HIPAA (45 CFR Parts 160 et 164) et les lois nationales applicables sur les données de santé au Togo, au Ghana, au Bénin et en Côte d'Ivoire. Tous les dossiers sont chiffrés de bout en bout. Vous possédez vos données.",
    privacy_link: 'Lire notre politique complète de confidentialité et données',
    pilot_eyebrow: 'Partenaires pilotes',
    pilot_h: 'Approuvé par les premiers partenaires en Afrique de l\'Ouest.',
    pilot_note: "Klinova intègre activement des cliniques, pharmacies et hôpitaux partenaires fondateurs. Les premiers partenaires contribuent à façonner la plateforme et bénéficient d'un accompagnement prioritaire.",
    pilot_join: 'Rejoindre le programme de partenaires fondateurs',
    cta_eyebrow: 'Commencer avec Klinova',
    cta_patients: 'Démarrer une consultation',
    cta_patients_sub: 'Pour les patients',
    patient_create_account: 'Créer un compte gratuit',
    patient_login: 'Se connecter',
    patient_see_pricing: 'Voir ce qui est inclus →',
    patient_cta_sub: 'Inscrivez-vous gratuitement pour découvrir Klinova. Choisissez un plan quand vous êtes prêt.',
    cta_doctors: 'Rejoindre en tant que prestataire',
    cta_doctors_sub: 'Pour les médecins',
    cta_clinics: 'Devenir partenaire',
    cta_clinics_sub: 'Pour les cliniques et hôpitaux',
    cta_pharmacy: 'Rejoindre le réseau',
    cta_pharmacy_sub: 'Pour les pharmacies',
    cta_gov_btn: 'Demander une démonstration',
    cta_gov_sub: 'Pour les gouvernements et ONG',
    price_eyebrow: 'Accès pour chaque situation',
    price_h: 'Pour gouvernements, individus et partenaires.',
    price_individual: 'Solo',
    price_family: 'Famille',
    price_family_sub: 'Vous + 4 membres de la famille',
    price_per_month: '/ mois',
    price_included: 'Ce qui est inclus',
    price_feat1: 'Application + triage WhatsApp, 24h/24',
    price_feat2: 'Consultations vidéo & vocales',
    price_feat3: 'Ordonnances numériques',
    price_feat4: 'Dossier médical',
    price_feat5: '1 livraison de médicaments offerte / mois',
    price_feat6: '10 % de réduction en clinique partenaire',
    price_family_extra: 'Tout ce qui précède, pour vous + 4 membres',
    price_family_feat5: '3 livraisons de médicaments offertes / mois',
    price_cta: 'Commencer',
    price_partners_h: 'Pour médecins, pharmacies & partenaires',
    price_doc_label: 'Médecins',
    price_doc_tag: 'Rejoindre gratuitement',
    price_doc_desc: 'Gardez 70 % de chaque consultation. Nous vous envoyons des patients pré-triagés, sans coût marketing, sans frais initiaux.',
    price_pharm_label: 'Pharmacies',
    price_pharm_tag: '8–15 % de commission',
    price_pharm_desc: 'Commission uniquement sur les ordonnances exécutées via Klinova. Nous gérons les commandes et la livraison.',
    price_clinic_label: 'Cliniques & Hôpitaux',
    price_clinic_tag: '20–40 $ / mois',
    price_clinic_desc: 'Accès au tableau de bord + calendrier, épinglé sur notre carte. Frais de recommandation uniquement quand un patient pré-triagé se présente.',
    price_transport_label: 'Transport & Livraison',
    price_transport_tag: 'Gratuit pour les patients',
    price_transport_desc: 'Livrez les médicaments et transportez les patients inclus dans chaque Care Plan. Klinova achemine des milliers de livraisons GPS garanties vers vos chauffeurs chaque mois.',
    cta_transport_subj: 'Partenariat Transport & Livraison – Klinova',
    price_note: 'Prix affichés en devise locale. Sans frais cachés. Résiliable à tout moment.',

    modules_eyebrow: 'Tableau de bord clinique',
    modules_h: 'Une suite complète pour votre clinique.',
    modules_sub: 'Chaque module conçu pour les professionnels de santé africains fonctionne sur tous les appareils et est disponible hors ligne.',
    mod1_h: 'Consultations',      mod1_p: 'Workflow complet : motif, examen, diagnostic, traitement et suivi.',
    mod2_h: 'Patients',           mod2_p: 'Dossier médical complet avec historique et contacts d\'urgence.',
    mod3_h: 'Ordonnances',        mod3_p: 'Prescription numérique avec posologie et vue imprimable.',
    mod4_h: 'Rendez-vous',        mod4_p: 'Calendrier, disponibilité médecin, gestion des statuts.',
    mod5_h: 'Paiements',          mod5_p: 'Espèces, mobile money (Flooz, TMoney, MTN). Reçus et historique.',
    mod6_h: 'Triage infirmier',   mod6_p: 'Signes vitaux, notes de triage, file d\'attente en temps réel.',
    mod7_h: 'Rapports',           mod7_p: 'KPIs, graphiques et analyse d\'activité.',
    mod8_h: 'Administration',     mod8_p: 'Gestion des utilisateurs, rôles et paramètres.',
    cta_patients_subj: 'Démarrer une consultation – Klinova',
    cta_patients_body: 'Bonjour, je souhaite démarrer une consultation. Mon nom est [votre nom] et je vous contacte depuis [votre localisation].',
    cta_doctors_subj: 'Rejoindre en tant que prestataire – Klinova',
    cta_doctors_body: 'Bonjour, je suis un professionnel de santé souhaitant rejoindre Klinova. Mon nom est [votre nom], spécialité : [votre spécialité], localisation : [votre localisation].',
    cta_clinics_subj: 'Devenir partenaire Klinova – Clinique / Hôpital',
    cta_clinics_body: "Bonjour, nous souhaitons devenir partenaire de Klinova. Nom de l'établissement : [nom], localisation : [ville, pays], type : [clinique / hôpital].",
    cta_pharmacy_subj: 'Rejoindre le réseau de pharmacies – Klinova',
    cta_pharmacy_body: 'Bonjour, je souhaite rejoindre le réseau de pharmacies Klinova. Nom de la pharmacie : [nom], localisation : [ville, pays].',
    cta_gov_subj: 'Demander une démonstration – Klinova Gouvernement / ONG',
    cta_gov_body: "Bonjour, nous représentons [nom de l'organisation] et souhaitons demander une démonstration. Pays : [pays], contact : [votre nom & téléphone].",
    cta_pilot_subj: 'Rejoindre le programme pilote Klinova',
    already_account: 'Vous avez déjà un compte ?',
    sign_in: 'Se connecter →',

    pilot_status: 'Pilote en cours de lancement au Togo et au Ghana',
    test_eyebrow: 'Témoignages',
    test_h: 'Ils nous font confiance.',
    test1_q: 'Klinova a transformé notre façon de travailler. Les consultations sont mieux documentées et le suivi patient est devenu simple et efficace.',
    test1_name: 'Dr. Ama Koudou',
    test1_role: 'Médecin généraliste',
    test1_place: 'Clinique Espoir Santé, Lomé',
    test2_q: 'La prise en charge des patients est beaucoup plus rapide. Le module de triage nous fait gagner un temps précieux chaque jour.',
    test2_name: 'Inf. Kokou Dzifa',
    test2_role: 'Infirmier chef',
    test2_place: 'Centre Médical de Kara',
    test3_q: "Je peux voir mes rendez-vous, mes ordonnances et mon historique médical directement sur mon téléphone. C'est vraiment pratique.",
    test3_name: 'Mme Adjoa Mensah',
    test3_role: 'Patiente',
    test3_place: 'Lomé',
  },

  ee: {
    eyebrow1: 'Dɔwɔwɔ Kpɔkpɔ na Ɣetoɖoƒe Afrika',
    h1_p1:   'Ðoðowo si gbɔa ',
    h1_accent: 'wò gbɔgbɔm.',
    lede: 'Kpɔ dɔwɔla le wò fōn ŋu, xɔ wò ŋɔ sɛ, kpɔ atike si le wò ƒuƒo si — app ŋu, web ŋu, alo WhatsApp. Xe ŋkume le mobile money ŋu.',
    btn1: 'Xɔ App a',
    btn2: 'Na kliniki kple abɔbɔlawo',
    trust1: 'Mobile money wɔa nu',
    trust2: 'Ɖo ɖiɖi kple aɖaŋudɔdɔ',
    trust3: 'Wɔa nu le fōn bubuwo ŋu',
    lband_h: 'Gbɔgbɔme wuieve. Takpekpee ɖeka.',
    h2_5: 'Nàdze agbe, ɣesiaɣi.',
    cta_p: 'Xɔ Klinova app a eye nàkpɔ dɔwɔla egbea.',
    footer_cr: '© 2026 Klinova. Nuŋɔŋlɔwo katã ɖo ɖiɖi.',
    nav_how: 'Adzinu',
    nav_patients: 'Dɔwɔlawo',
    nav_partners: 'Abɔbɔlawo',
    nav_gov: 'Gɔmedzigbawo',
  },

  kbp: {
    eyebrow1: 'Kɔnɖɔʋ kɛ Afiriki Ɩlɩm',
    h1_p1:   'Ɛsɛ nakʋ kɛ ',
    h1_accent: 'wɛtʋ yɔlɩzɩɣʋ.',
    lede: 'Naɣ dɔkɩtɩ ñɔ-tɛlefooni cɔlɔ, ñɔ-sɛbɛtʋ ñɩkɩ, naɣ ɖaʋ kpam — app, web, ñɔ WhatsApp. Cɛlɩ mobile money.',
    btn1: "Kpaɣ app ŋ",
    btn2: 'Kliniki nɛ abalɩtʋ mɛnsɩ',
    trust1: 'Mobile money ñɩkɩɣ',
    trust2: 'Pɩ-kɛdɛɛ nɛ laŋhɛzɩyɛ',
    trust3: 'Tɛlefooni kɔyɔ bɛɛ wɛɛ',
    lband_h: 'Yɔlɩzɩsɩ hiu nɛ ɛsa kʋɖʋm.',
    h2_5: 'Ña-laafɩ ñɩɣ, nɛ pɩtaatɩ dɔ.',
    cta_p: 'Kpaɣ Klinova app ŋ nɛ naɣ dɔkɩtɩ sɔnɔ.',
    footer_cr: '© 2026 Klinova. Pɩ-yɔɔ tɩŋaɣ kɛdɩna.',
    nav_how: 'Pɩlɩɩna',
    nav_patients: 'Pɩ-hɔɔlʋʋ',
    nav_partners: 'Abalɩtʋ',
    nav_gov: 'Ɛjaɖɛ',
  },

  tw: {
    eyebrow1: 'Telephone Ayarehwɛ ma Ɔwɛst Afrika',
    h1_p1:   'Ayarehwɛ a ɔkasa ',
    h1_accent: 'wʼkasa mu.',
    lede: 'Hu onyansafo wo wo telephone mu, nya wo krataa, na nya nnuro kɔse — app, web, anaa WhatsApp. Tua mobile money.',
    btn1: 'Gye app no',
    btn2: 'Ma klinik ne nkabomu',
    trust1: 'Mobile money na yɛtua',
    trust2: 'Wɔhwɛ so na ɛhwɛ wo',
    trust3: 'Bɛdi adwuma wo telephone biara mu',
    lband_h: 'Kasa du baako ne baako. Ɔsorow baako.',
    h2_5: 'Wo ho bɛtɔ da, ntɛm.',
    cta_p: 'Gye Klinova app no na kasa kyerɛ onyansafo ɛnnɛ.',
    footer_cr: '© 2026 Klinova. Ahokeka nyinaa wɔ mu.',
    nav_how: 'Sɛnea ɛyɛ',
    nav_patients: 'Ayaresafo',
    nav_partners: 'Nkabomu',
    nav_gov: 'Aban',
  },

  fon: {
    eyebrow1: 'Gbeyiyi Wɛkɛ tɔn Afrika Sɛjɛ mɛ',
    h1_p1:   'Gbeyiyi e ',
    h1_accent: 'ɖo gbe nú we.',
    lede: "Kpɔ dɔkɔtɛ ɔ do tɛlifɔnu towe mɛ, sɔ sɛ́gbɛ n'ɔ, mɔ alɔgɔ e — app mɛ, web ɔ jí, alɔkpa WhatsApp. Sɔ xɔ mobile money.",
    btn1: 'Yì app ɔ xɔ',
    btn2: 'Nú klinik lɛ kpo xwédo lɛ kpo',
    trust1: 'Mobile money ɖi wɛ nɔ zun',
    trust2: 'Lɛlɛ̌ bo nyí mɛxomɛnu',
    trust3: 'Nɔ ɖo tɛlifɔnu ɖebǔ wu',
    lband_h: 'Gbè wǒ jɛ ɖokpo lɛ. Agɔntɛn ɖokpo.',
    h2_5: 'Dɔ ɖagbe, nǔjɛ wá.',
    cta_p: 'Yì Klinova app ɔ xɔ bo kpɔ dɔkɔtɛ ɔ égbé.',
    footer_cr: '© 2026 Klinova. Nǔ bǐ bló.',
    nav_how: 'Nǔ e è ɖè',
    nav_patients: 'Mɛ e gbeyiyi ɖè',
    nav_partners: 'Xwédo',
    nav_gov: 'Gɔvɛnmɛ',
  },

  dyu: {
    eyebrow1: 'Kɛnɛyabɔ Telefɔni la Afiriki Kɔrɔn',
    h1_p1:   'Kɛnɛya ka ',
    h1_accent: 'kuma i ka kan na.',
    lede: 'Ye dɔkɔtɔrɔ i ka telefɔni la, sɔrɔ i ka sɛbɛn, ye farima — app la, web, wala WhatsApp. Sara mobile money.',
    btn1: 'Sɔrɔ app nin',
    btn2: 'Kliniki ni baara bolo mɔgɔw ye',
    trust1: 'Mobile money bɛ sarali',
    trust2: 'A gɛlɛn ni ɲɛnabɔ',
    trust3: 'A bɛ se telefɔni bɛɛ la',
    lband_h: 'Kan tan ni kelen. Ɲɔgɔnna kelen.',
    h2_5: 'I ka kɛnɛ, joona.',
    cta_p: 'Sɔrɔ Klinova app ka ye dɔkɔtɔrɔ bi.',
    footer_cr: '© 2026 Klinova. Sariya bɛɛ bɔra.',
    nav_how: 'A ka kɛcogo',
    nav_patients: 'Banabagatɔ',
    nav_partners: 'Baara bolo',
    nav_gov: 'Gwɛrɛnman',
  },

  bci: {
    eyebrow1: 'Dɔktɛli Kpli Afrika Blɔliɛn',
    h1_p1:   'Tɔtɔ ',
    h1_accent: 'i kaan su.',
    lede: 'Wun dɔktɛli ɔ i fɔn su, fa i sɛnlɛ, wun dawa kɔ kpɔ — app su, web, annɔ WhatsApp. Tɔ mobile money.',
    btn1: 'Fa app ɔ',
    btn2: 'Kliniki nɛn baara kpɔ',
    trust1: 'Mobile money naan tɔ',
    trust2: 'Lile nɛn kpɔ wla',
    trust3: 'A bɛ se fɔn kwlaa su',
    lband_h: 'Kaan blu kɔ nɲɔ. Ɛgua kun kelen.',
    h2_5: 'Nian i kɛnɛ su, blɔliɛ.',
    cta_p: 'Fa Klinova app ɔ ka wun dɔktɛli bi.',
    footer_cr: '© 2026 Klinova. Drɔɩ kwlaa sie.',
    nav_how: 'A kɛ sɔ',
    nav_patients: 'Bɔbɔ',
    nav_partners: 'Baara kpɔ',
    nav_gov: 'Gwɛrɛnman',
  },

  wo: {
    eyebrow1: 'Télémédecine ci Afrig Penku',
    h1_p1:   'Bajëfam bu ',
    h1_accent: 'waxu sa làkk.',
    lede: 'Gis doteur gi ci sa téléphone bi, jël ordonnance bi, def ragal bi ci weñ — ci app, web, walla WhatsApp. Fey ak mobile money.',
    btn1: 'Jëfal app bi',
    btn2: 'Ngir klinik yi ak xarit yi',
    trust1: 'Mobile money nañu fey',
    trust2: 'Sàkk ak dëkk mi',
    trust3: 'Dox ci bët telefoon bëgg',
    lband_h: 'Fukk ak benn làkk. Ëmbar bu benn.',
    h2_5: 'Dem ci kanam, leegi.',
    cta_p: 'Jëfal Klinova app bi te gis doteur gi tey.',
    footer_cr: '© 2026 Klinova. Xam-xam yépp sàkk.',
    nav_how: 'Naka lañu def',
    nav_patients: 'Ay nit',
    nav_partners: 'Ay xarit',
    nav_gov: 'Ay dëkk',
  },

  bm: {
    eyebrow1: 'Kɛnɛyabɔ Telefɔni la Afiriki Kɔrɔn',
    h1_p1:   'Kɛnɛya ka ',
    h1_accent: 'kuma i ka kan na.',
    lede: 'Ye dɔkɔtɔrɔ i ka telefɔni la, sɔrɔ i ka sɛbɛn, ye dawa kɔni — app la, web la, wala WhatsApp. Sara mobile money.',
    btn1: 'Ta application in',
    btn2: 'Kliniki ni tɔgɔ bolo mɔgɔw ye',
    trust1: 'Mobile money bɛ sarali',
    trust2: 'A gɛlɛn ni gundo kɛlan',
    trust3: 'A bɛ se telefɔni bɛɛ la',
    lband_h: 'Kan tan ni kelen. Yɛrɛw kelen.',
    h2_5: 'I ka kɛnɛ, joona.',
    cta_p: 'Ta Klinova application in ka ye dɔkɔtɔrɔ bi.',
    footer_cr: '© 2026 Klinova. Sariya bɛɛ kɛra.',
    nav_how: 'A kɛ cogoya',
    nav_patients: 'Banabagatɔ',
    nav_partners: 'Baara bolo',
    nav_gov: 'Gwɛrɛnman',
  },

  ha: {
    eyebrow1: 'Kiwon Lafiya ta Wayar tarho don Yammacin Afirka',
    h1_p1:   'Kiwon lafiya da ke ',
    h1_accent: 'magana da yaranka.',
    lede: 'Duba likita daga wayarka, sami takardar magani, ka sami magunguna kusa — ta app, yanar gizo, ko WhatsApp. Biya da mobile money.',
    btn1: 'Sami app ɗin',
    btn2: 'Ga asibiti da abokan tarayya',
    trust1: 'Mobile money na karɓa',
    trust2: 'An ɓoye & na sirri',
    trust3: 'Yana aiki a kowane waya',
    lband_h: 'Yaruka goma sha ɗaya. Dandali guda.',
    h2_5: 'Ka warke, da wuri.',
    cta_p: 'Zazzage Klinova ka duba likita yau.',
    footer_cr: '© 2026 Klinova. Haƙƙoƙin mallaka kiyaye.',
    nav_how: 'Yaya yake',
    nav_patients: 'Marasa lafiya',
    nav_partners: 'Abokan tarayya',
    nav_gov: 'Gwamnatoci',
  },
}

/* ─── Pricing data ────────────────────────────────────────────── */
const PRICE_COUNTRIES = [
  { code: 'TG', flag: '🇹🇬', label: 'Togo',          currency: 'XOF', individual: '1 500',  family: '3 500',  usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'BJ', flag: '🇧🇯', label: 'Bénin',         currency: 'XOF', individual: '1 500',  family: '3 500',  usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'CI', flag: '🇨🇮', label: "Côte d'Ivoire", currency: 'XOF', individual: '1 500',  family: '3 500',  usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'GH', flag: '🇬🇭', label: 'Ghana',         currency: 'GHS', individual: '35',     family: '85',     usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'BF', flag: '🇧🇫', label: 'Burkina Faso',  currency: 'XOF', individual: '1 500',  family: '3 500',  usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'NG', flag: '🇳🇬', label: 'Nigeria',       currency: 'NGN', individual: '2 000',  family: '4 500',  usdIndividual: '2.50', usdFamily: '5.80' },
  { code: 'SN', flag: '🇸🇳', label: 'Sénégal',       currency: 'XOF', individual: '1 500',  family: '3 500',  usdIndividual: '2.50', usdFamily: '5.80' },
]

/* ─── Page component ────────────────────────────────────────── */
export default function Home() {
  /* Language */
  const [lang, setLang] = useState('en')
  const [priceCountry, setPriceCountry] = useState('TG')

  /* Translation helper */
  const t = (key) => T[lang]?.[key] ?? T.en[key]

  /* Current language display */
  const currentLang = LANG_LIST.find(l => l.code === lang)
  const langCode = currentLang ? currentLang.code.toUpperCase().slice(0, 3) : 'EN'

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: ${ui}; color: ${C.ink}; background: ${C.ivory}; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        button { font-family: ${ui}; }
        img { display: block; max-width: 100%; }
        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 22px; }
        .serif { font-family: ${display}; }
        .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${C.green}; }
        .btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 11px; padding: 13px 22px; font-family: ${ui}; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: transform .14s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease, color .14s ease; letter-spacing: -.01em; }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
        .btn-primary { background: ${C.green}; color: #fff; box-shadow: 0 8px 24px -8px rgba(14,107,79,.7), 0 1px 3px rgba(0,0,0,.08); }
        .btn-primary:hover { background: ${C.greenDeep}; box-shadow: 0 14px 32px -8px rgba(14,107,79,.8); }
        .btn-ghost { background: rgba(255,255,255,.7); color: ${C.ink}; border: 1.5px solid ${C.line}; backdrop-filter: blur(8px); }
        .btn-ghost:hover { border-color: ${C.green}; color: ${C.greenDeep}; background: #fff; }

        /* NAV */
        header { position: sticky; top: 0; z-index: 100; background: rgba(232,224,208,.95); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); border-bottom: 1px solid rgba(210,200,182,.7); }
        nav { display: flex; align-items: center; gap: 6px; height: 66px; padding: 0 28px; max-width: 1200px; margin: 0 auto; }
        .nav-logo { display: inline-flex; align-items: center; gap: 10px; flex: none; outline: none; text-decoration: none; }
        .nav-logo:focus-visible { outline: 2px solid ${C.green}; outline-offset: 4px; border-radius: 6px; }
        .nav-logo-name { font-family: ${display}; font-weight: 700; font-size: 20px; letter-spacing: -.02em; color: ${C.greenDeep}; }
        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
        .nav-links a { font-size: 13.5px; font-weight: 600; color: ${C.mute}; padding: 7px 12px; border-radius: 8px; transition: color .15s, background .15s; }
        .nav-links a:hover { color: ${C.ink}; background: rgba(14,107,79,.07); }
        .nav-right { display: flex; align-items: center; gap: 8px; flex: none; }
        .lang-pill { display: inline-flex; align-items: center; background: rgba(14,107,79,.08); border: 1px solid rgba(14,107,79,.15); border-radius: 999px; overflow: hidden; }
        .lp-btn { border: none; background: transparent; font-family: ${ui}; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: ${C.mute}; padding: 5px 11px; cursor: pointer; transition: background .15s, color .15s; }
        .lp-btn:hover { background: rgba(14,107,79,.10); color: ${C.ink}; }
        .lp-btn.lp-on { background: ${C.green}; color: #fff; }
        /* HERO */
        .hero { padding: 80px 0 96px; overflow: hidden; position: relative; }
        .hero::before { content:''; position:absolute; inset:0; background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(14,107,79,.07) 0%, transparent 70%); pointer-events:none; }
        .hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 60px; align-items: center; }
        h1 { font-family: ${display}; font-weight: 600; font-size: clamp(36px, 4.8vw, 58px); line-height: 1.03; letter-spacing: -.028em; margin: 18px 0 0; }
        h1 .accent { color: ${C.green}; position: relative; display: inline-block; }
        .lede { font-size: 17px; color: #41554C; margin-top: 22px; max-width: 42ch; line-height: 1.68; }
        .cta { display: flex; gap: 10px; margin-top: 30px; flex-wrap: wrap; }
        .trust { display: flex; gap: 22px; margin-top: 22px; flex-wrap: wrap; font-size: 12.5px; color: ${C.mute}; font-weight: 600; }
        .trust-item { display: flex; align-items: center; gap: 7px; }
        .trust-dot { width: 5px; height: 5px; border-radius: 50%; background: ${C.gold}; flex: none; }
        .hero-img-card { background: none; border-radius: 0; padding: 0; display: flex; justify-content: center; align-items: center; border: none; box-shadow: none; position: relative; }
        .hero-img-card::before { content:''; position:absolute; width:320px; height:320px; background: radial-gradient(circle, rgba(14,107,79,.12) 0%, transparent 70%); border-radius:50%; }
        .hero-img-card img { width: min(300px, 75vw); position: relative; z-index: 1; filter: drop-shadow(0 24px 40px rgba(10,84,64,.18)); }

        /* LANGUAGE BAND */
        .lband { background: ${C.greenDeep}; color: #EAF4EF; padding: 48px 0; }
        .lband-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
        .lband .eyebrow { color: ${C.goldSoft}; }
        .lband h2 { color: #fff; font-family: ${display}; font-weight: 600; font-size: clamp(22px, 3vw, 30px); margin-top: 8px; line-height: 1.1; }
        .lband p { color: #A9C8BC; font-size: 14.5px; max-width: 44ch; }
        .lchips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
        .lchip { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; min-width: 120px; transition: background .15s; }
        .lchip:hover { background: rgba(255,255,255,.1); }
        .lchip .nm { font-family: ${display}; font-weight: 600; font-size: 17px; color: #fff; }
        .lchip .tg { font-size: 11px; font-weight: 600; letter-spacing: .05em; color: #8FB3A6; text-transform: uppercase; }

        /* SECTIONS */
        section { padding: 80px 0; border-bottom: 1px solid ${C.line}; }
        .band-alt { background: ${C.ivory}; }
        .band-center { text-align: center; max-width: 680px; margin: 0 auto; }
        h2 { font-family: ${display}; font-weight: 600; font-size: clamp(27px, 3.4vw, 38px); line-height: 1.08; letter-spacing: -.02em; margin-top: 12px; }
        .sub { color: #41554C; font-size: 16px; margin-top: 14px; line-height: 1.65; }

        /* HOW IT WORKS */
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 48px; text-align: left; }
        .step { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 22px; padding: 26px; box-shadow: 0 2px 12px -4px rgba(0,0,0,.05); }
        .step .no { font-family: ${display}; font-weight: 600; font-size: 14px; color: #fff; background: ${C.green}; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; }
        .step h3 { font-size: 16px; margin-top: 18px; font-weight: 700; letter-spacing: -.01em; }
        .step p { font-size: 13.5px; color: ${C.mute}; margin-top: 8px; line-height: 1.6; }

        /* FEATURE CARDS */
        .feat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; text-align: left; }
        .fcard { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 22px; padding: 28px; transition: box-shadow .2s, transform .2s, border-color .2s; }
        .fcard:hover { box-shadow: 0 8px 32px -8px rgba(14,107,79,.14); transform: translateY(-2px); border-color: rgba(14,107,79,.18); }
        .fcard-icon { width: 50px; height: 50px; border-radius: 15px; background: ${C.greenSoft}; display: grid; place-items: center; color: ${C.green}; margin-bottom: 20px; flex: none; box-shadow: 0 2px 8px rgba(14,107,79,.1); }
        .fcard h3 { font-size: 16px; font-weight: 700; letter-spacing: -.015em; }
        .fcard p { font-size: 13.5px; color: ${C.mute}; margin-top: 8px; line-height: 1.65; }

        /* PARTNER CARDS */
        .split { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; text-align: left; }
        .pcard { border-radius: 20px; padding: 28px; color: #fff; background: ${C.greenDeep}; position: relative; overflow: hidden; border-top: 3px solid ${C.gold}; }
        .pcard:nth-child(2) { background: #13594A; }
        .pcard:nth-child(3) { background: #0E4C3F; }
        .pcard .k { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: ${C.goldSoft}; }
        .pcard h3 { font-family: ${display}; font-weight: 600; font-size: 21px; margin-top: 10px; }
        .pcard ul { list-style: none; margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .pcard li { font-size: 13px; opacity: .9; display: flex; gap: 8px; align-items: flex-start; line-height: 1.5; }
        .pcard li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: ${C.gold}; margin-top: 6px; flex: none; }

        /* GOVERNMENTS */
        .gov { background: radial-gradient(130% 130% at 80% -10%, #16463A, #0C2B22); color: #EAF4EF; border-radius: 28px; padding: 52px; }
        .gov h2 { color: #fff; }
        .gov .sub { color: #A9C8BC; max-width: 62ch; }
        .pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 20px; }
        .pill { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 8px 14px; font-size: 12.5px; font-weight: 600; color: #DDEFE7; }

        /* IMPACT */
        .impact { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .stat { font-family: ${display}; font-weight: 600; font-size: clamp(40px, 6vw, 64px); color: ${C.green}; line-height: 1; margin-top: 14px; }
        .impact p { color: #41554C; font-size: 16px; margin-top: 12px; line-height: 1.65; }

        /* CTA BAND */
        .cta-band { background: ${C.green}; border-radius: 28px; padding: 60px; text-align: center; color: #fff; overflow: hidden; position: relative; }
        .cta-band h2 { font-family: ${display}; font-weight: 600; font-size: clamp(28px, 3.6vw, 40px); color: #fff; }
        .cta-band p { opacity: .88; margin-top: 14px; font-size: 16.5px; }
        .cta-band .cta { display: flex; gap: 12px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
        .cta-band .btn-primary { background: #fff; color: ${C.greenDeep}; }
        .cta-band .btn-primary:hover { background: ${C.greenSoft}; }
        .cta-band .btn-ghost { color: #fff; border-color: rgba(255,255,255,.38); }
        .cta-band .btn-ghost:hover { border-color: rgba(255,255,255,.7); color: #fff; }

        /* FOOTER */
        footer { background: #0B1F1A; color: #B4CCC4; padding: 60px 0 32px; }
        .fgrid { display: grid; grid-template-columns: 1.7fr 1fr 1fr 1fr; gap: 32px; }
        footer .nav-logo-name { color: #fff; font-size: 22px; }
        footer .nav-logo img { width: 28px; height: 28px; }
        .blurb { font-size: 13px; color: #6E8E81; margin-top: 14px; max-width: 28ch; line-height: 1.65; }
        footer h4 { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #5A7A6E; margin-bottom: 16px; font-weight: 700; }
        footer ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        footer a { font-size: 13.5px; color: #B4CCC4; transition: color .15s; }
        footer a:hover { color: #fff; }
        .fbottom { border-top: 1px solid rgba(255,255,255,.07); margin-top: 44px; padding-top: 22px; display: flex; justify-content: space-between; font-size: 12.5px; color: #5A7A6E; flex-wrap: wrap; gap: 10px; }


        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        /* Testimonials */
        .tgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .tcard { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; padding:28px; display:flex; flex-direction:column; gap:16px; }
        .tstars { display:flex; gap:3px; }
        .tquote { font-size:15px; color:${C.ink}; line-height:1.7; flex:1; font-style:italic; }
        .tperson { display:flex; align-items:center; gap:12px; margin-top:4px; }
        .tavatar { width:40px; height:40px; border-radius:50%; background:${C.greenSoft}; color:${C.greenDeep}; font-weight:800; font-size:15px; display:grid; place-items:center; flex-shrink:0; }
        .tname { font-size:14px; font-weight:700; color:${C.ink}; }
        .trole { font-size:12.5px; color:${C.mute}; margin-top:2px; }
        /* Emergency notice */
        .emergency-notice { display:flex; gap:9px; align-items:flex-start; background:#FFFBF0; border:1px solid #F0C060; border-radius:10px; padding:11px 14px; font-size:12.5px; color:#7A4A00; line-height:1.55; margin-top:18px; max-width:44ch; }
        /* Licensing section */
        .lic-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:40px; }
        .lic-item { background:${C.card}; border:1px solid ${C.line}; border-radius:14px; padding:18px 20px; }
        .lic-item-link { transition: border-color .15s, box-shadow .15s; }
        .lic-item-link:hover { border-color:${C.green}; box-shadow: 0 4px 16px -6px rgba(14,107,79,.18); }
        .lic-country { font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:${C.green}; }
        .lic-body { font-size:14px; color:${C.ink}; font-weight:500; margin-top:6px; line-height:1.4; }
        /* Trust split */
        .trust-split { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:44px; }
        .trust-col { background:${C.card}; border:1px solid ${C.line}; border-radius:18px; padding:28px; }
        /* Compliance badges */
        .compliance-badges { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
        .badge { background:${C.greenSoft}; color:${C.greenDeep}; border-radius:8px; padding:4px 10px; font-size:11.5px; font-weight:700; letter-spacing:.04em; }
        /* Audience CTA grid */
        .audience-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
        .audience-card { background:${C.card}; border:1px solid ${C.line}; border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:10px; }
        .audience-card.audience-primary { background:${C.green}; border-color:${C.green}; }
        .audience-card.audience-primary h3 { color:#fff; }
        .audience-label { font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:${C.mute}; }
        .audience-card.audience-primary .audience-label { color:rgba(255,255,255,.65); }
        .audience-card h3 { font-size:15px; font-weight:700; color:${C.ink}; line-height:1.3; flex:1; }
        .audience-card .btn { font-size:13px; padding:10px 14px; }
        .audience-card.audience-primary .btn-primary { background:#fff; color:${C.greenDeep}; box-shadow:none; }
        /* Nav logo sizing */
        .nav-logo-img { height: 64px; }

        /* RESPONSIVE */
        .audience-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        @media(max-width:960px){
          .nav-links{display:none}
          .nav-logo-img{height:48px}
          .hero-grid{grid-template-columns:1fr;gap:36px}
          .hero-img-card{order:-1}
          .steps{grid-template-columns:1fr 1fr}
          .feat{grid-template-columns:1fr 1fr}
          .gov{padding:36px}
          .impact{grid-template-columns:1fr;gap:22px}
          .fgrid{grid-template-columns:1fr 1fr}
          .audience-grid{grid-template-columns:repeat(2,1fr)}
          .audience-3col{grid-template-columns:1fr}
          .lic-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:780px){
          .split{grid-template-columns:1fr}
          .cta-band,.gov{padding:32px}
          .lband-head{flex-direction:column;align-items:flex-start}
          .trust-split{grid-template-columns:1fr}
          .tgrid{grid-template-columns:1fr}
        }
        @media(max-width:540px){
          nav{padding:0 14px;height:58px}
          .nav-logo-img{height:36px}
          .nav-cta{display:none!important}
          .wrap{padding:0 16px}
          .hero{padding:40px 0 52px}
          .lede{font-size:15px}
          .cta{gap:8px}
          .cta .btn{padding:11px 16px;font-size:13px}
          .steps,.feat{grid-template-columns:1fr}
          .fbottom{flex-direction:column}
          .fgrid{grid-template-columns:1fr}
          .lchip{flex:1;min-width:calc(50% - 5px)}
          .nav-login{font-size:12px!important;padding:7px 12px!important}
.cta-band{padding:22px 18px}
          .gov{padding:24px 18px}
          .audience-grid,.audience-3col{grid-template-columns:1fr}
          .lic-grid{grid-template-columns:1fr 1fr}
          .trust-col{padding:20px}
          footer{padding:44px 0 24px}
        }
      `}</style>

      {/* HEADER */}
      <header>
        <nav>
          <a className="nav-logo" href="/">
            <img src="/klinova-logo-full.png" alt="Klinova" className="nav-logo-img" style={{ width: 'auto', mixBlendMode: 'multiply' }} />
          </a>

          <div className="nav-links">
            <a href="#how">{t('nav_how')}</a>
            <a href="/governments">{lang === 'fr' ? 'Pour les gouvernements' : 'For Governments'}</a>
            <a href="/patients">{lang === 'fr' ? 'Pour les individus' : 'For Individuals'}</a>
            <a href="/partner">{lang === 'fr' ? 'Pour les partenaires' : 'For Partners'}</a>
            <a href="mailto:contact@klinova.co">Contact</a>
          </div>

          <div className="nav-right">
            <a href="/login" className="nav-login"
              style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, textDecoration: 'none', padding: '9px 16px', borderRadius: 8, border: `1.5px solid ${C.line}`, background: '#fff', whiteSpace: 'nowrap' }}>
              {t('nav_login')}
            </a>
            <a href="/login?mode=signup&role=patient" className="btn btn-primary nav-cta" style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('nav_create')}
            </a>
            <div className="lang-pill" role="group" aria-label="Language">
              <button
                className={lang === 'en' ? 'lp-btn lp-on' : 'lp-btn'}
                onClick={() => setLang('en')}
              >EN</button>
              <button
                className={lang === 'fr' ? 'lp-btn lp-on' : 'lp-btn'}
                onClick={() => setLang('fr')}
              >FR</button>
            </div>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero" style={{ borderBottom: `1px solid ${C.line}` }}>
          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow">{t('eyebrow1')}</div>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 10, marginBottom: 0 }}>{t('card_h')}</p>
              <h1>
                <span className="serif">
                  {t('h1_p1')}<span className="accent">{t('h1_accent')}</span>
                </span>
              </h1>
              <p className="lede">{t('lede')}</p>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#EBF5F0', border:'1px solid #B2D8C8', borderRadius:999, padding:'5px 12px', fontSize:12, fontWeight:700, color:C.greenDeep, letterSpacing:'.03em' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:C.green, display:'inline-block', animation:'pulse 2s ease-in-out infinite' }} />
                  {t('pilot_status')}
                </span>
              </div>
              <div className="cta">
                <a href="/governments" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  {lang === 'fr' ? 'Programmes gouvernementaux' : 'Government programs'}
                </a>
                <a href="/login?mode=signup&role=patient" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>
                  {lang === 'fr' ? 'Particuliers : commencer' : 'Individuals: get started'}
                </a>
              </div>
              <div className="trust">
                <span className="trust-item"><span className="trust-dot" />{t('trust1')}</span>
                <span className="trust-item"><span className="trust-dot" />{t('trust2')}</span>
                <span className="trust-item"><span className="trust-dot" />{t('trust3')}</span>
              </div>
              <div className="emergency-notice">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:2}}><path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10h.01"/></svg>
                <span>{t('emergency')}</span>
              </div>
            </div>
            <div className="hero-img-card">
              <img src="/klinova-logo-full.png" alt="Klinova" />
            </div>
          </div>
        </section>

        {/* LANGUAGE BAND */}
        <div className="lband">
          <div className="wrap">
            <div className="lband-head">
              <div>
                <div className="eyebrow">{t('lband_eyebrow')}</div>
                <h2>{t('lband_h')}</h2>
              </div>
              <p>{t('lband_p')}</p>
            </div>
            <div className="lchips">
              {LANG_LIST.map((l) => (
                <div className="lchip" key={l.code}>
                  <span className="nm">{l.name}</span>
                  <span className="tg">{l.region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how" className="band-alt">
          <div className="wrap band-center">
            <div className="eyebrow">{t('eyebrow2')}</div>
            <h2>{t('h2_1')}</h2>
            <p className="sub">{t('sub1')}</p>
          </div>
          <div className="wrap">
            <div className="steps">
              <div className="step"><div className="no">1</div><h3>{t('step1_h')}</h3><p>{t('step1_p')}</p></div>
              <div className="step"><div className="no">2</div><h3>{t('step2_h')}</h3><p>{t('step2_p')}</p></div>
              <div className="step"><div className="no">3</div><h3>{t('step3_h')}</h3><p>{t('step3_p')}</p></div>
              <div className="step"><div className="no">4</div><h3>{t('step4_h')}</h3><p>{t('step4_p')}</p></div>
            </div>
          </div>
        </section>

        {/* AUDIENCE OVERVIEW */}
        <section id="audiences">
          <div className="wrap">
            <div className="band-center" style={{ marginBottom: 44 }}>
              <div className="eyebrow">{lang === 'fr' ? 'Pour qui' : 'Who it\'s for'}</div>
              <h2 style={{ fontFamily: display }}>{lang === 'fr' ? 'Une plateforme pour tous.' : 'One platform. Every role.'}</h2>
              <p className="sub">{lang === 'fr' ? 'Patients, professionnels de santé ou gouvernements — Klinova a été conçu pour vous.' : 'Patients, healthcare providers, and governments — each with their own experience on Klinova.'}</p>
            </div>
            <div className="audience-3col">
              {/* Governments — PRIMARY */}
              <div style={{ background: C.greenDeep, borderRadius: 24, padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 340 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,154,43,.18)', display: 'grid', placeItems: 'center', color: C.gold }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold }}>{lang === 'fr' ? 'Pour les gouvernements et ONG' : 'For governments and NGOs'}</div>
                <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.2 }}>{lang === 'fr' ? 'Soins primaires pour chaque village rural.' : 'Primary care for every rural village.'}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.65, margin: 0, flex: 1 }}>{lang === 'fr' ? "Klinova est l'infrastructure de télémédecine qui permet aux gouvernements d'étendre les soins primaires à chaque communauté rurale, sans construire de nouvelles cliniques." : 'Klinova is the telemedicine backbone letting governments extend quality primary care to every remote community, without building new clinics. Citizens access care at no cost.'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="/governments" style={{ display: 'inline-block', background: C.gold, color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{lang === 'fr' ? 'Voir le programme →' : 'View the program →'}</a>
                  <a href="mailto:contact@klinova.co?subject=Government Partnership" style={{ display: 'inline-block', background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)', fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.18)', whiteSpace: 'nowrap' }}>{lang === 'fr' ? 'Nous contacter' : 'Contact us'}</a>
                </div>
              </div>
              {/* Individuals */}
              <div style={{ background: C.green, borderRadius: 24, padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 340 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>{lang === 'fr' ? 'Pour les individus' : 'For individuals'}</div>
                <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.2 }}>{lang === 'fr' ? 'Soins de qualite, sur votre telephone.' : 'Quality healthcare, on any phone.'}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.65, margin: 0, flex: 1 }}>{lang === 'fr' ? 'Consultez un medecin agree par chat, voix ou video. Ordonnances numeriques, livraison de medicaments, dossier chiffre. A partir de 1 500 XOF/mois.' : 'See a licensed doctor by chat, voice, or video. Digital prescriptions, medication delivery, encrypted records. From 1,500 XOF/month or free via a government program if eligible.'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="/patients" style={{ display: 'inline-block', background: '#fff', color: C.greenDeep, fontWeight: 700, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{lang === 'fr' ? 'En savoir plus →' : 'Learn more →'}</a>
                  <a href="/login?mode=signup&role=patient" style={{ display: 'inline-block', background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.25)', whiteSpace: 'nowrap' }}>{lang === 'fr' ? 'Commencer' : 'Get started'}</a>
                </div>
              </div>
              {/* Partners */}
              <div style={{ background: C.sand, border: `1.5px solid ${C.line}`, borderRadius: 24, padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 340 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(14,107,79,.1)', display: 'grid', placeItems: 'center', color: C.green }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.mute }}>{lang === 'fr' ? 'Pour les partenaires' : 'For partners'}</div>
                <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, lineHeight: 1.2 }}>{lang === 'fr' ? "Rejoignez le reseau de sante de l'Afrique." : "Join Africa's healthcare grid."}</h3>
                <p style={{ fontSize: 14, color: C.mute, lineHeight: 1.65, margin: 0, flex: 1 }}>{lang === 'fr' ? 'Cliniques, pharmacies, medecins et transporteurs — connectez-vous au reseau Klinova et recevez des patients references.' : 'Clinics, pharmacies, doctors, employers, and delivery providers join the Klinova network and receive verified patient referrals.'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="/partner" style={{ display: 'inline-block', background: C.green, color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{lang === 'fr' ? 'Devenir partenaire →' : 'Become a partner →'}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & LICENSING */}
        <section id="trust" className="band-alt">
          <div className="wrap">
            <div className="band-center" style={{ maxWidth: 600 }}>
              <div className="eyebrow">{t('lic_eyebrow')}</div>
              <h2>{t('lic_h')}</h2>
              <p className="sub">{t('lic_p')}</p>
            </div>
            <div className="lic-grid">
              {[
                ['lic_togo',  'lic_togo_body',  'https://onmt.tg'],
                ['lic_ghana', 'lic_ghana_body', 'https://moh.gov.gh/ghana-medical-and-dental-council/'],
                ['lic_benin', 'lic_benin_body', 'https://ordremedecinsbenin.bj'],
                ['lic_civ',   'lic_civ_body',   'https://ordremedecins.ci'],
              ].map(([k, b, href]) => (
                <a href={href} target="_blank" rel="noopener noreferrer" key={k}
                  style={{ textDecoration: 'none', display: 'block' }}
                  className="lic-item lic-item-link">
                  <div className="lic-country">{t(k)}</div>
                  <div className="lic-body">{t(b)}</div>
                  <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: C.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {lang === 'fr' ? 'Voir l\'autorité officielle' : 'View official authority'} ↗
                  </div>
                </a>
              ))}
            </div>
            <div className="trust-split">
              <div className="trust-col">
                <h3 style={{ fontFamily: display, fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{t('advisory_h')}</h3>
                <p style={{ fontSize: 14.5, color: C.mute, lineHeight: 1.7 }}>{t('advisory_p')}</p>
              </div>
              <div className="trust-col">
                <h3 style={{ fontFamily: display, fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{t('compliance_h')}</h3>
                <p style={{ fontSize: 14.5, color: C.mute, lineHeight: 1.7 }}>{t('compliance_p')}</p>
                <a href="mailto:privacy@klinova.co" style={{ fontSize: 13, color: C.green, fontWeight: 600, display: 'block', marginTop: 12 }}>{t('privacy_link')}</a>
                <div className="compliance-badges">
                  <span className="badge">GDPR</span>
                  <span className="badge">HIPAA</span>
                  <span className="badge">EU 2016/679</span>
                  <span className="badge">45 CFR 160/164</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILOT PARTNERS */}
        <section style={{ background: C.ink, borderBottom: 'none', padding: '52px 0' }}>
          <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow" style={{ color: C.goldSoft }}>{t('pilot_eyebrow')}</div>
              <h2 style={{ fontFamily: display, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 600, color: '#fff', marginTop: 8, lineHeight: 1.15 }}>{t('pilot_h')}</h2>
              <p style={{ color: '#8FB3A6', fontSize: 14.5, marginTop: 10, maxWidth: 48 + 'ch', lineHeight: 1.65 }}>{t('pilot_note')}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
              <a href="/get-started/clinics" className="btn" style={{ background: C.gold, color: '#fff', whiteSpace: 'nowrap' }}>{t('pilot_join')}</a>
              <a href="/login" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', textDecoration: 'none', paddingLeft: 4 }}>
                {t('already_account')} <span style={{ color: 'rgba(255,255,255,.9)', fontWeight: 600 }}>{t('sign_in')}</span>
              </a>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="band-alt">
          <div className="wrap impact">
            <div>
              <div className="eyebrow">{t('eyebrow6')}</div>
              <div className="stat">{t('ratio')}</div>
              <p>{t('impact_p')}</p>
            </div>
            <div style={{ background: C.green, borderRadius: 20, padding: 32 }}>
              <h3 className="serif" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-.02em', color: '#fff', lineHeight: 1.15 }}>{t('card_h')}</h3>
              <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>{t('card_p')}</p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="band-alt">
          <div className="wrap">
            <div className="band-center" style={{ marginBottom: 44 }}>
              <div className="eyebrow">{t('test_eyebrow')}</div>
              <h2>{t('test_h')}</h2>
            </div>
            <div className="tgrid">
              {[
                { q:'test1_q', name:'test1_name', role:'test1_role', place:'test1_place' },
                { q:'test2_q', name:'test2_name', role:'test2_role', place:'test2_place' },
                { q:'test3_q', name:'test3_name', role:'test3_role', place:'test3_place' },
              ].map((item, i) => (
                <div className="tcard" key={i}>
                  <div className="tstars">{[1,2,3,4,5].map(s => <IconStar key={s} filled />)}</div>
                  <p className="tquote">{t(item.q)}</p>
                  <div className="tperson">
                    <div className="tavatar">{t(item.name).split(' ').slice(-1)[0][0]}</div>
                    <div>
                      <div className="tname">{t(item.name)}</div>
                      <div className="trole">{t(item.role)} &middot; {t(item.place)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        {(() => {
          const pc = PRICE_COUNTRIES.find(c => c.code === priceCountry) ?? PRICE_COUNTRIES[0]
          const features = ['price_feat1','price_feat2','price_feat3','price_feat4','price_feat5','price_feat6']
          return (
            <section id="pricing" className="band-alt">
              <div className="wrap">
                <div className="band-center" style={{ marginBottom: 36 }}>
                  <div className="eyebrow">{t('price_eyebrow')}</div>
                  <h2>{t('price_h')}</h2>
                </div>

                {/* Country tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
                  {PRICE_COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => setPriceCountry(c.code)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                        border: `1.5px solid ${priceCountry === c.code ? C.green : C.line}`,
                        background: priceCountry === c.code ? C.green : '#fff',
                        color: priceCountry === c.code ? '#fff' : C.mute,
                        cursor: 'pointer', transition: 'all .15s',
                      }}>
                      {c.flag} {c.label}
                    </button>
                  ))}
                </div>

                {/* Government tier — PRIMARY, shown first */}
                <div style={{ marginBottom: 40, background: C.greenDeep, borderRadius: 20, padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', border: `2px solid ${C.gold}` }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 8 }}>
                      {lang === 'fr' ? 'Gouvernements, ONG & assureurs' : 'Governments, NGOs & insurers'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: display, marginBottom: 8, lineHeight: 1.2 }}>
                      {lang === 'fr' ? 'Accès gratuit pour vos citoyens via les programmes nationaux' : 'Free access for your citizens via national health programs'}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 0 }}>
                      {(lang === 'fr'
                        ? ['Modèle capité personnalisé selon le volume de déploiement', 'Nous gérons la télémédecine, le routage des ordonnances et la livraison', 'Tableau de bord gouvernemental en temps réel et rapports', 'Intégration FHIR R4 avec les systèmes du ministère']
                        : ['Custom capitated model based on deployment size', 'We handle telemedicine, prescription routing, and last-mile delivery', 'Real-time government dashboard and reporting', 'FHIR R4 integration with ministry systems']
                      ).map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: 'rgba(255,255,255,.78)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, flexShrink: 0, marginTop: 7 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                    <a href="/governments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.gold, color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                      {lang === 'fr' ? 'Voir le programme →' : 'View the program →'}
                    </a>
                    <a href="mailto:contact@klinova.co?subject=Government Partnership" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', textDecoration: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', border: '1.5px solid rgba(255,255,255,.15)' }}>
                      {lang === 'fr' ? 'Contacter notre equipe' : 'Contact our team'}
                    </a>
                  </div>
                </div>

                {/* Individual plans — secondary */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.mute, marginBottom: 16, textAlign: 'center' }}>
                    {lang === 'fr' ? 'Pour les individus qui souscrivent directement' : 'For individuals who subscribe directly'}
                  </div>
                </div>

                {/* Plan cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, maxWidth: 640, margin: '0 auto 48px' }}>
                  {/* Individual */}
                  <div style={{ background: C.greenDeep, borderRadius: 20, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{t('price_individual')}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-.02em' }}>{pc.individual}</span>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>{pc.currency} {t('price_per_month')}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>{t('price_included')}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {features.map(k => (
                          <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'rgba(255,255,255,.85)' }}>
                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, color: '#fff' }}>✓</span>
                            {t(k)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a href="/login?mode=signup&role=patient"
                      style={{ marginTop: 'auto', display: 'block', textAlign: 'center', background: '#fff', color: C.greenDeep, borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                      {t('price_cta')}
                    </a>
                  </div>

                  {/* Family */}
                  <div style={{ background: '#fff', border: `1.5px solid ${C.line}`, borderRadius: 20, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.mute, marginBottom: 6 }}>{t('price_family')} <span style={{ background: C.greenSoft, color: C.green, borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>{t('price_family_sub')}</span></div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: '-.02em' }}>{pc.family}</span>
                        <span style={{ fontSize: 14, color: C.mute }}>{pc.currency} {t('price_per_month')}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.mute, marginBottom: 10 }}>{t('price_included')}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.ink }}>
                          <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, color: C.green }}>✓</span>
                          {t('price_family_extra')}
                        </li>
                        {features.map(k => (
                          <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.ink }}>
                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, color: C.green }}>✓</span>
                            {k === 'price_feat5' ? t('price_family_feat5') : t(k)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a href="/login?mode=signup&role=patient"
                      style={{ marginTop: 'auto', display: 'block', textAlign: 'center', background: C.greenDeep, color: '#fff', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                      {t('price_cta')}
                    </a>
                  </div>
                </div>

                {/* Partner pricing */}
                <div style={{ borderTop: `1.5px solid ${C.line}`, paddingTop: 36 }}>
                  <h3 style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 20 }}>{t('price_partners_h')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                    {[
                      { label: 'price_doc_label',        tag: 'price_doc_tag',        desc: 'price_doc_desc',        href: '/get-started/doctors'   },
                      { label: 'price_pharm_label',      tag: 'price_pharm_tag',      desc: 'price_pharm_desc',      href: '/get-started/pharmacy'  },
                      { label: 'price_clinic_label',     tag: 'price_clinic_tag',     desc: 'price_clinic_desc',     href: '/get-started/clinics'   },
                      { label: 'price_transport_label',  tag: 'price_transport_tag',  desc: 'price_transport_desc',  href: `mailto:contact@klinova.co?subject=${encodeURIComponent('Transport & Delivery Partner – Klinova')}` },
                    ].map(({ label, tag, desc, href }) => (
                      <div key={label} style={{ background: '#fff', border: `1.5px solid ${C.line}`, borderRadius: 16, padding: '22px 22px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{t(label)}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: C.greenSoft, color: C.green, borderRadius: 6, padding: '3px 8px' }}>{t(tag)}</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.mute, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{t(desc)}</p>
                        <a href={href} style={{ fontSize: 13, fontWeight: 700, color: C.greenDeep, textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                          {t('price_cta')} →
                        </a>
                        <a href="/login" style={{ fontSize: 12, color: C.mute, textDecoration: 'none' }}>
                          {t('already_account')} <span style={{ color: C.green, fontWeight: 600 }}>{t('sign_in')}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 28 }}>{t('price_note')}</p>
              </div>
            </section>
          )
        })()}

      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div>
              <a className="nav-logo" href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <img src="/klinova-logo-full.png" alt="Klinova" style={{ height: 88, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </a>
              <p className="blurb">{t('footer_blurb')}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 12 }}>{t('card_h')}</p>
            </div>
            <div>
              <h4>{t('footer_product')}</h4>
              <ul>
                <li><a href="#how">{t('footer_how')}</a></li>
                <li><a href="/patients">{t('footer_patients')}</a></li>
<li><a href="/download">{t('btn1')}</a></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_partners')}</h4>
              <ul>
                <li><a href="/partner">{t('footer_clinics')}</a></li>
                <li><a href="/partner">{t('footer_pharmacies')}</a></li>
                <li><a href="/partner">{t('footer_doctors')}</a></li>
                <li><a href="/governments">{t('footer_governments')}</a></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_company')}</h4>
              <ul>
                <li><a href="/">{t('footer_about')}</a></li>
                <li><a href="mailto:contact@klinova.co">{t('footer_contact')}</a></li>
                <li><a href="/privacy">{t('footer_privacy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="fbottom">
            <span>{t('footer_cr')}</span>
            <span>Powered by Klinova</span>
          </div>
        </div>
      </footer>

    </>
  )
}

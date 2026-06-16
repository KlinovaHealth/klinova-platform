'use client'

import { useState, useEffect, useRef } from 'react'

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  ink:       '#15302A',
  green:     '#0E6B4F',
  greenDeep: '#0A5440',
  greenSoft: '#E3EFE8',
  ivory:     '#F5EFE3',
  sand:      '#EDE4D2',
  gold:      '#C4852A',
  goldSoft:  '#F4E2BC',
  coral:     '#CF5A3C',
  mute:      '#6E7F76',
  line:      '#E7DECC',
  card:      '#FFFFFF',
}

const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

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
  <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? '#C4852A' : 'none'} stroke="#C4852A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.83.69 3.99L8 10.35l-3.59 1.89.69-3.99L2.2 5.68l4-.58L8 1.5z"/>
  </svg>
)
const IconA11y = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="1.75"/>
    <path d="M3.5 8.5h15"/>
    <path d="M11 8.5v4.5l-3 5.5M11 13l3 5.5"/>
  </svg>
)
const IconAlignLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M1 3h14M1 7h9M1 11h12M1 13h7"/>
  </svg>
)
const IconAlignCenter = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M1 3h14M3.5 7h9M2 11h12M4 13h8"/>
  </svg>
)
const IconAlignRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M1 3h14M6 7h9M3 11h12M8 13h7"/>
  </svg>
)

/* ─── Translations ──────────────────────────────────────────── */
const T = {
  en: {
    eyebrow1: 'Telemedicine for West Africa',
    h1_p1:   'Healthcare that speaks ',
    h1_accent: 'your language.',
    lede: "See a trusted doctor on your phone, get your prescription, and find nearby medicine through the app, the web, or WhatsApp. Pay with mobile money across Togo, Ghana, Benin, and Côte d'Ivoire.",
    btn1: 'Get the app',
    btn2: 'For clinics and partners',
    trust1: 'Pay with mobile money',
    trust2: 'Encrypted and private',
    trust3: 'Works on any phone',

    lband_eyebrow: 'Speak naturally',
    lband_h: 'Eleven languages. One platform.',
    lband_p: 'Klinova connects with people in the language they think and live in, across four countries and growing.',

    eyebrow2: 'How it works',
    h2_1: 'Go from feeling unwell to cared for in minutes.',
    sub1: 'Four simple steps, in the language you speak and on the phone you already have.',
    step1_h: 'Tell us how you feel',
    step1_p: 'Describe your symptoms by text, voice, or photo in any of our eleven supported languages.',
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

    eyebrow5: 'Governments and NGOs',
    h2_4: 'See the health of a population as it happens.',
    gov_p: 'Klinova transforms everyday care into anonymized, location-based data: live dashboards for disease tracking, coverage gaps, and resource allocation. Individual records stay private, while decision-makers see the full picture. All data collection and processing complies with GDPR, HIPAA, and applicable international health data regulations.',
    pill1: 'Disease surveillance',
    pill2: 'Coverage maps',
    pill3: 'Resource planning',
    pill4: 'Anonymized and secure',

    eyebrow6: 'Why we exist',
    ratio: '1 : 5,000',
    impact_p: 'Across the region, there is roughly one doctor for every 5,000 people, far below the global standard of one per 1,000. Klinova helps close that gap by making every available doctor reachable by anyone, wherever they are.',
    card_h: 'Born in Africa. Built for Life.',
    card_p: 'Klinova is built by a team that knows this region deeply: its languages, its devices, and how people pay. We started in Togo and are growing across West Africa.',

    h2_5: 'Feel better, sooner.',
    cta_p: 'Download Klinova and speak with a doctor today. Or partner with us to reach more patients.',

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
    footer_privacy: 'Privacy and data',
    footer_cr: '© 2026 Klinova. All rights reserved.',

    nav_how: 'How it works',
    nav_patients: 'Patients',
    nav_partners: 'Partners',
    nav_gov: 'Governments',

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
    cta_doctors: 'Join as a provider',
    cta_doctors_sub: 'For doctors',
    cta_clinics: 'Partner with Klinova',
    cta_clinics_sub: 'For clinics and hospitals',
    cta_pharmacy: 'Join the pharmacy network',
    cta_pharmacy_sub: 'For pharmacies',
    cta_gov_btn: 'Request a demo',
    cta_gov_sub: 'For governments and NGOs',

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
    eyebrow1: "Télémédecine pour l'Afrique de l'Ouest",
    h1_p1:   'Une santé qui parle ',
    h1_accent: 'votre langue.',
    lede: "Consultez un médecin de confiance depuis votre téléphone, recevez votre ordonnance et trouvez vos médicaments à proximité par appli, web ou WhatsApp. Payez avec mobile money au Togo, au Ghana, au Bénin et en Côte d'Ivoire.",
    btn1: "Télécharger l'appli",
    btn2: 'Cliniques et partenaires',
    trust1: 'Payez avec mobile money',
    trust2: 'Chiffré et confidentiel',
    trust3: 'Sur tout téléphone',

    lband_eyebrow: 'Parlez naturellement',
    lband_h: 'Onze langues. Une seule plateforme.',
    lband_p: "Klinova rejoint chacun dans la langue dans laquelle il pense et vit, dans quatre pays et en expansion.",

    eyebrow2: 'Comment ça marche',
    h2_1: 'De "je ne me sens pas bien" à soigné, en quelques minutes.',
    sub1: 'Quatre étapes simples, dans votre langue et sur le téléphone que vous avez déjà.',
    step1_h: 'Dites-nous comment vous allez',
    step1_p: "Décrivez vos symptômes par texte, voix ou photo dans l'une de nos onze langues disponibles.",
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
    h2_4: "Suivre la santé d'une population en temps réel.",
    gov_p: "Klinova transforme les soins quotidiens en données anonymisées et géolocalisées : tableaux de bord en direct pour le suivi des maladies, les zones sous-couvertes et l'allocation des ressources. Les dossiers individuels restent privés, tandis que les décideurs disposent de la vue d'ensemble. La collecte et le traitement des données sont conformes au RGPD, à la HIPAA et aux réglementations internationales applicables en matière de données de santé.",
    pill1: 'Surveillance des maladies',
    pill2: 'Cartes de couverture',
    pill3: 'Planification des ressources',
    pill4: 'Anonymisé et sécurisé',

    eyebrow6: "Notre raison d'être",
    ratio: '1 : 5 000',
    impact_p: "Dans la région, on compte environ un médecin pour 5 000 personnes, bien en dessous de la norme mondiale d'un pour 1 000. Klinova comble cet écart en rendant chaque médecin disponible accessible à tous, partout.",
    card_h: "Né en Afrique. Conçu pour la vie.",
    card_p: "Klinova est développé par une équipe qui connaît profondément cette région : ses langues, ses appareils et ses modes de paiement. Nous avons débuté au Togo et nous étendons à toute l'Afrique de l'Ouest.",

    h2_5: 'Allez mieux, plus vite.',
    cta_p: "Téléchargez Klinova et parlez à un médecin dès aujourd'hui. Ou devenez partenaire pour atteindre davantage de patients.",

    footer_blurb: "Télémédecine et santé numérique pour l'Afrique de l'Ouest. Lomé, Togo.",
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
    cta_doctors: 'Rejoindre en tant que prestataire',
    cta_doctors_sub: 'Pour les médecins',
    cta_clinics: 'Devenir partenaire',
    cta_clinics_sub: 'Pour les cliniques et hôpitaux',
    cta_pharmacy: 'Rejoindre le réseau',
    cta_pharmacy_sub: 'Pour les pharmacies',
    cta_gov_btn: 'Demander une démonstration',
    cta_gov_sub: 'Pour les gouvernements et ONG',

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

/* ─── Page component ────────────────────────────────────────── */
export default function Home() {
  /* Language */
  const [lang, setLang] = useState('en')

  /* Accessibility panel */
  const [a11yOpen,      setA11yOpen]      = useState(false)
  const [fontSize,      setFontSize]      = useState(100)
  const [lineHeight,    setLineHeight]    = useState(160)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [boldText,      setBoldText]      = useState(false)
  const [readableFont,  setReadableFont]  = useState(false)
  const [textAlign,     setTextAlign]     = useState('left')
  const [darkMode,      setDarkMode]      = useState(false)
  const [monochrome,    setMonochrome]    = useState(false)
  const [bigCursor,     setBigCursor]     = useState(false)

  const cursorStyleRef = useRef(null)

  /* Translation helper */
  const t = (key) => T[lang]?.[key] ?? T.en[key]

  /* Effects */
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + '%'
  }, [fontSize])

  useEffect(() => {
    document.body.style.lineHeight = lineHeight / 100
  }, [lineHeight])

  useEffect(() => {
    document.body.style.letterSpacing = letterSpacing + 'px'
  }, [letterSpacing])

  useEffect(() => {
    document.body.style.fontWeight = boldText ? '700' : ''
  }, [boldText])

  useEffect(() => {
    document.body.style.fontFamily = readableFont
      ? 'Arial, Helvetica, sans-serif'
      : ''
  }, [readableFont])

  useEffect(() => {
    document.body.style.textAlign = textAlign
  }, [textAlign])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-dark', '')
    } else {
      document.documentElement.removeAttribute('data-dark')
    }
  }, [darkMode])

  useEffect(() => {
    document.body.style.filter = monochrome ? 'grayscale(1)' : ''
  }, [monochrome])

  useEffect(() => {
    if (bigCursor) {
      const s = document.createElement('style')
      s.id = '__klinova_cursor'
      s.textContent = '* { cursor: zoom-in !important; }'
      document.head.appendChild(s)
      cursorStyleRef.current = s
    } else {
      const existing = document.getElementById('__klinova_cursor')
      if (existing) existing.remove()
    }
  }, [bigCursor])

  /* Current language display */
  const currentLang = LANG_LIST.find(l => l.code === lang)
  const langCode = currentLang ? currentLang.code.toUpperCase().slice(0, 3) : 'EN'

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
        .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${C.green}; }
        .btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 10px; padding: 13px 22px; font-family: ${ui}; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease, color .15s ease; }
        .btn:hover { transform: translateY(-1px); }
        .btn-primary { background: ${C.green}; color: #fff; box-shadow: 0 8px 20px -8px rgba(14,107,79,.75); }
        .btn-primary:hover { background: ${C.greenDeep}; box-shadow: 0 12px 28px -8px rgba(14,107,79,.85); }
        .btn-ghost { background: transparent; color: ${C.ink}; border: 1.5px solid ${C.line}; }
        .btn-ghost:hover { border-color: ${C.green}; color: ${C.greenDeep}; }

        /* NAV */
        header { position: sticky; top: 0; z-index: 100; background: rgba(245,239,227,.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid rgba(231,222,204,.7); }
        nav { display: flex; align-items: center; gap: 6px; height: 68px; padding: 0 28px; max-width: 1200px; margin: 0 auto; }
        .nav-logo { display: inline-flex; align-items: center; gap: 10px; flex: none; outline: none; }
        .nav-logo:focus-visible { outline: 2px solid ${C.green}; outline-offset: 4px; border-radius: 6px; }
        .nav-logo img { width: 32px; height: 32px; object-fit: contain; }
        .nav-logo-name { font-family: ${display}; font-weight: 700; font-size: 21px; letter-spacing: -.01em; color: ${C.greenDeep}; }
        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
        .nav-links a { font-size: 13.5px; font-weight: 600; color: ${C.mute}; padding: 7px 12px; border-radius: 8px; transition: color .15s, background .15s; }
        .nav-links a:hover { color: ${C.ink}; background: rgba(14,107,79,.07); }
        .nav-right { display: flex; align-items: center; gap: 8px; flex: none; }
        .lang-pill { display: inline-flex; align-items: center; background: rgba(14,107,79,.08); border: 1px solid rgba(14,107,79,.15); border-radius: 999px; overflow: hidden; }
        .lp-btn { border: none; background: transparent; font-family: ${ui}; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: ${C.mute}; padding: 5px 11px; cursor: pointer; transition: background .15s, color .15s; }
        .lp-btn:hover { background: rgba(14,107,79,.10); color: ${C.ink}; }
        .lp-btn.lp-on { background: ${C.green}; color: #fff; }
        .a11y-trigger { width: 38px; height: 38px; border-radius: 10px; background: ${C.green}; color: #fff; border: none; cursor: pointer; display: grid; place-items: center; transition: background .15s, transform .15s; flex: none; }
        .a11y-trigger:hover { background: ${C.greenDeep}; transform: translateY(-1px); }

        /* HERO */
        .hero { padding: 72px 0 80px; overflow: hidden; }
        .hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 56px; align-items: center; }
        h1 { font-family: ${display}; font-weight: 600; font-size: clamp(34px, 4.8vw, 56px); line-height: 1.04; letter-spacing: -.025em; margin: 16px 0 0; }
        h1 .accent { color: ${C.green}; }
        .lede { font-size: 17px; color: #41554C; margin-top: 20px; max-width: 40ch; line-height: 1.65; }
        .cta { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; }
        .trust { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; font-size: 12.5px; color: ${C.mute}; font-weight: 600; }
        .trust-item { display: flex; align-items: center; gap: 7px; }
        .trust-dot { width: 5px; height: 5px; border-radius: 50%; background: ${C.gold}; flex: none; }
        .hero-img-card { background: none; border-radius: 0; padding: 0; display: flex; justify-content: center; align-items: center; border: none; box-shadow: none; }
        .hero-img-card img { width: min(280px, 75vw); }

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
        .band-alt { background: linear-gradient(180deg, #fff 0%, #FAFAF7 100%); }
        .band-center { text-align: center; max-width: 680px; margin: 0 auto; }
        h2 { font-family: ${display}; font-weight: 600; font-size: clamp(27px, 3.4vw, 38px); line-height: 1.08; letter-spacing: -.02em; margin-top: 12px; }
        .sub { color: #41554C; font-size: 16px; margin-top: 14px; line-height: 1.65; }

        /* HOW IT WORKS */
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 48px; text-align: left; }
        .step { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px; }
        .step .no { font-family: ${display}; font-weight: 600; font-size: 14px; color: #fff; background: ${C.green}; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; }
        .step h3 { font-size: 16px; margin-top: 18px; font-weight: 700; letter-spacing: -.01em; }
        .step p { font-size: 13.5px; color: ${C.mute}; margin-top: 8px; line-height: 1.6; }

        /* FEATURE CARDS */
        .feat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; text-align: left; }
        .fcard { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 26px; }
        .fcard-icon { width: 48px; height: 48px; border-radius: 14px; background: ${C.greenSoft}; display: grid; place-items: center; color: ${C.green}; margin-bottom: 18px; flex: none; }
        .fcard h3 { font-size: 16px; font-weight: 700; letter-spacing: -.01em; }
        .fcard p { font-size: 13.5px; color: ${C.mute}; margin-top: 8px; line-height: 1.6; }

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
        .cta-band .btn-primary:hover { background: #F0FAF5; }
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

        /* ACCESSIBILITY PANEL */
        .a11y-fab { position: fixed; bottom: 24px; right: 24px; z-index: 200; width: 52px; height: 52px; border-radius: 50%; background: ${C.green}; color: #fff; border: none; cursor: pointer; display: grid; place-items: center; box-shadow: 0 6px 24px -6px rgba(14,107,79,.6); transition: background .15s, transform .15s, box-shadow .15s; }
        .a11y-fab:hover { background: ${C.greenDeep}; transform: translateY(-2px); box-shadow: 0 10px 32px -6px rgba(14,107,79,.7); }
        .a11y-panel { position: fixed; bottom: 88px; right: 24px; z-index: 199; width: 340px; max-height: 80vh; overflow-y: auto; background: #fff; border-radius: 20px; box-shadow: 0 24px 64px -12px rgba(0,0,0,.2), 0 4px 16px -4px rgba(0,0,0,.1); border: 1px solid ${C.line}; }
        .a11y-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid ${C.line}; position: sticky; top: 0; background: #fff; z-index: 1; }
        .a11y-header h3 { font-size: 15px; font-weight: 700; color: ${C.ink}; letter-spacing: -.01em; }
        .a11y-close { width: 30px; height: 30px; border-radius: 8px; background: #F3F4F2; border: none; cursor: pointer; display: grid; place-items: center; font-size: 16px; color: ${C.mute}; transition: background .15s; }
        .a11y-close:hover { background: ${C.greenSoft}; color: ${C.green}; }
        .a11y-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 20px; }
        .a11y-section-label { font-size: 10.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: ${C.mute}; margin-bottom: 10px; }
        .a11y-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 8px; }
        .a11y-row label { font-size: 13px; font-weight: 600; color: ${C.ink}; }
        .a11y-row:first-of-type { margin-top: 0; }
        .a11y-slider-wrap { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
        .a11y-slider-wrap label { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; color: ${C.ink}; }
        .a11y-slider-wrap label span { color: ${C.green}; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: ${C.line}; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${C.green}; cursor: pointer; box-shadow: 0 2px 6px rgba(14,107,79,.35); }
        .toggle-btns { display: flex; border: 1.5px solid ${C.line}; border-radius: 8px; overflow: hidden; }
        .toggle-btns button { flex: 1; padding: 7px 0; font-size: 12.5px; font-weight: 700; border: none; background: transparent; cursor: pointer; color: ${C.mute}; transition: background .15s, color .15s; }
        .toggle-btns button.active { background: ${C.green}; color: #fff; }
        .align-btns { display: flex; gap: 6px; }
        .align-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid ${C.line}; background: #fff; cursor: pointer; display: grid; place-items: center; color: ${C.mute}; transition: border-color .15s, background .15s, color .15s; }
        .align-btn.active { border-color: ${C.green}; background: ${C.greenSoft}; color: ${C.green}; }
        /* Toggle switch */
        .toggle-switch { position: relative; width: 40px; height: 22px; flex: none; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .toggle-track { position: absolute; inset: 0; background: #D1D9D4; border-radius: 11px; cursor: pointer; transition: background .2s; }
        .toggle-track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); transition: transform .2s; }
        .toggle-switch input:checked + .toggle-track { background: ${C.green}; }
        .toggle-switch input:checked + .toggle-track::after { transform: translateX(18px); }

        /* DARK MODE */
        [data-dark] body { background: #0F1B17 !important; color: #D8EDE6 !important; }
        [data-dark] header { background: rgba(13,25,20,.92) !important; border-color: #1E3329 !important; }
        [data-dark] .fcard, [data-dark] .step { background: #172822 !important; border-color: #1E3329 !important; color: #D8EDE6 !important; }
        [data-dark] .fcard p, [data-dark] .step p { color: #7FA898 !important; }
        [data-dark] .band-alt { background: #111E1A !important; }

        /* RESPONSIVE */
        @media(max-width:960px){
          .hero-grid{grid-template-columns:1fr;gap:36px}
          .hero-img-card{order:-1}
          .steps{grid-template-columns:1fr 1fr}
          .feat{grid-template-columns:1fr 1fr}
          .gov{padding:36px}
          .impact{grid-template-columns:1fr;gap:22px}
          .fgrid{grid-template-columns:1fr 1fr}
          .nav-links{display:none}
        }
        @media(max-width:780px){
          .split{grid-template-columns:1fr}
          .cta-band,.gov{padding:32px}
          .lband-head{flex-direction:column;align-items:flex-start}
        }
        @media(max-width:540px){
          .steps,.feat{grid-template-columns:1fr}
          .fbottom{flex-direction:column}
          .fgrid{grid-template-columns:1fr}
          .lchip{flex:1;min-width:calc(50% - 5px)}
          .a11y-panel{right:12px;left:12px;width:auto;bottom:80px}
          .a11y-fab{bottom:16px;right:16px}
          .cta-band{padding:28px}
          .audience-grid{grid-template-columns:1fr}
          .lic-grid{grid-template-columns:1fr 1fr}
          .trust-split{grid-template-columns:1fr}
        }
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
        @media(max-width:780px){ .tgrid{grid-template-columns:1fr} }
        /* Emergency notice */
        .emergency-notice { display:flex; gap:9px; align-items:flex-start; background:#FFFBF0; border:1px solid #F0C060; border-radius:10px; padding:11px 14px; font-size:12.5px; color:#7A4A00; line-height:1.55; margin-top:18px; max-width:44ch; }
        /* Licensing section */
        .lic-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:40px; }
        .lic-item { background:${C.card}; border:1px solid ${C.line}; border-radius:14px; padding:18px 20px; }
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
        @media(max-width:960px){ .audience-grid{grid-template-columns:repeat(2,1fr)} .lic-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:780px){ .trust-split{grid-template-columns:1fr} }
      `}</style>

      {/* HEADER */}
      <header>
        <nav>
          <a className="nav-logo" href="#top">
            <img src="/klinova-mark.png" alt="Klinova" />
            <span className="nav-logo-name">Klinova</span>
          </a>

          <div className="nav-links">
            <a href="#how">{t('nav_how')}</a>
            <a href="#patients">{t('nav_patients')}</a>
            <a href="#partners">{t('nav_partners')}</a>
            <a href="#gov">{t('nav_gov')}</a>
          </div>

          <div className="nav-right">
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
            <button
              className="a11y-trigger"
              onClick={() => setA11yOpen(v => !v)}
              aria-label="Accessibility settings"
            >
              <IconA11y />
            </button>
            <button className="btn btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
              {t('btn1')}
            </button>
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
                <button className="btn btn-primary">{t('btn1')}</button>
                <button className="btn btn-ghost">{t('btn2')}</button>
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

        {/* FOR PATIENTS */}
        <section id="patients">
          <div className="wrap band-center">
            <div className="eyebrow">{t('eyebrow3')}</div>
            <h2>{t('h2_2')}</h2>
          </div>
          <div className="wrap">
            <div className="feat">
              <div className="fcard">
                <div className="fcard-icon"><IconGlobe /></div>
                <h3>{t('f1_h')}</h3><p>{t('f1_p')}</p>
              </div>
              <div className="fcard">
                <div className="fcard-icon"><IconWallet /></div>
                <h3>{t('f2_h')}</h3><p>{t('f2_p')}</p>
              </div>
              <div className="fcard">
                <div className="fcard-icon"><IconMapPin /></div>
                <h3>{t('f3_h')}</h3><p>{t('f3_p')}</p>
              </div>
              <div className="fcard">
                <div className="fcard-icon"><IconFile /></div>
                <h3>{t('f4_h')}</h3><p>{t('f4_p')}</p>
              </div>
              <div className="fcard">
                <div className="fcard-icon"><IconMessage /></div>
                <h3>{t('f5_h')}</h3><p>{t('f5_p')}</p>
              </div>
              <div className="fcard">
                <div className="fcard-icon"><IconPhone /></div>
                <h3>{t('f6_h')}</h3><p>{t('f6_p')}</p>
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
              {[['lic_togo','lic_togo_body'],['lic_ghana','lic_ghana_body'],['lic_benin','lic_benin_body'],['lic_civ','lic_civ_body']].map(([k,b]) => (
                <div className="lic-item" key={k}>
                  <div className="lic-country">{t(k)}</div>
                  <div className="lic-body">{t(b)}</div>
                </div>
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
            <button className="btn" style={{ background: C.gold, color: '#fff', whiteSpace: 'nowrap', flexShrink: 0 }}>{t('pilot_join')}</button>
          </div>
        </section>

        {/* FOR PARTNERS */}
        <section id="partners" className="band-alt">
          <div className="wrap band-center">
            <div className="eyebrow">{t('eyebrow4')}</div>
            <h2>{t('h2_3')}</h2>
          </div>
          <div className="wrap">
            <div className="split">
              <div className="pcard">
                <div className="k">{t('p1_k')}</div>
                <h3>{t('p1_h')}</h3>
                <ul><li>{t('p1_l1')}</li><li>{t('p1_l2')}</li><li>{t('p1_l3')}</li></ul>
              </div>
              <div className="pcard">
                <div className="k">{t('p2_k')}</div>
                <h3>{t('p2_h')}</h3>
                <ul><li>{t('p2_l1')}</li><li>{t('p2_l2')}</li><li>{t('p2_l3')}</li></ul>
              </div>
              <div className="pcard">
                <div className="k">{t('p3_k')}</div>
                <h3>{t('p3_h')}</h3>
                <ul><li>{t('p3_l1')}</li><li>{t('p3_l2')}</li><li>{t('p3_l3')}</li></ul>
              </div>
            </div>
          </div>
        </section>

        {/* GOVERNMENTS */}
        <section id="gov">
          <div className="wrap">
            <div className="gov">
              <div className="eyebrow" style={{ color: C.goldSoft }}>{t('eyebrow5')}</div>
              <h2>{t('h2_4')}</h2>
              <p className="sub">{t('gov_p')}</p>
              <div className="pills">
                <span className="pill">{t('pill1')}</span>
                <span className="pill">{t('pill2')}</span>
                <span className="pill">{t('pill3')}</span>
                <span className="pill">{t('pill4')}</span>
              </div>
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

        {/* AUDIENCE CTAs */}
        <section style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="band-center" style={{ marginBottom: 44 }}>
              <div className="eyebrow">{t('cta_eyebrow')}</div>
              <h2>{t('h2_5')}</h2>
              <p className="sub">{t('cta_p')}</p>
            </div>
            <div className="audience-grid">
              <div className="audience-card audience-primary">
                <div className="audience-label">{t('cta_patients_sub')}</div>
                <h3>{t('cta_patients')}</h3>
                <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>{t('cta_patients')}</button>
              </div>
              <div className="audience-card">
                <div className="audience-label">{t('cta_doctors_sub')}</div>
                <h3>{t('cta_doctors')}</h3>
                <button className="btn btn-ghost" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>{t('cta_doctors')}</button>
              </div>
              <div className="audience-card">
                <div className="audience-label">{t('cta_clinics_sub')}</div>
                <h3>{t('cta_clinics')}</h3>
                <button className="btn btn-ghost" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>{t('cta_clinics')}</button>
              </div>
              <div className="audience-card">
                <div className="audience-label">{t('cta_pharmacy_sub')}</div>
                <h3>{t('cta_pharmacy')}</h3>
                <button className="btn btn-ghost" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>{t('cta_pharmacy')}</button>
              </div>
              <div className="audience-card">
                <div className="audience-label">{t('cta_gov_sub')}</div>
                <h3>{t('cta_gov_btn')}</h3>
                <button className="btn btn-ghost" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>{t('cta_gov_btn')}</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div>
              <a className="nav-logo" href="#top">
                <img src="/klinova-mark.png" alt="Klinova" />
                <span className="nav-logo-name">Klinova</span>
              </a>
              <p className="blurb">{t('footer_blurb')}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 12 }}>{t('card_h')}</p>
            </div>
            <div>
              <h4>{t('footer_product')}</h4>
              <ul>
                <li><a href="#how">{t('footer_how')}</a></li>
                <li><a href="#patients">{t('footer_patients')}</a></li>
                <li><a href="#top">{t('btn1')}</a></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_partners')}</h4>
              <ul>
                <li><a href="#partners">{t('footer_clinics')}</a></li>
                <li><a href="#partners">{t('footer_pharmacies')}</a></li>
                <li><a href="#partners">{t('footer_doctors')}</a></li>
                <li><a href="#gov">{t('footer_governments')}</a></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_company')}</h4>
              <ul>
                <li><a href="#top">{t('footer_about')}</a></li>
                <li><a href="mailto:contact@klinova.co">{t('footer_contact')}</a></li>
                <li><a href="#top">{t('footer_privacy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="fbottom">
            <span>{t('footer_cr')}</span>
            <span>Powered by Klinova</span>
          </div>
        </div>
      </footer>

      {/* ACCESSIBILITY FAB */}
      <button
        className="a11y-fab"
        onClick={() => setA11yOpen(v => !v)}
        aria-label="Accessibility settings"
        aria-expanded={a11yOpen}
      >
        <IconA11y />
      </button>

      {/* ACCESSIBILITY PANEL */}
      {a11yOpen && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility settings">
          <div className="a11y-header">
            <h3>Accessibility</h3>
            <button className="a11y-close" onClick={() => setA11yOpen(false)} aria-label="Close">
              &#x2715;
            </button>
          </div>

          <div className="a11y-body">



            {/* TEXT */}
            <div>
              <div className="a11y-section-label">Text</div>

              <div className="a11y-slider-wrap">
                <label>
                  Font Size
                  <span>{fontSize}%</span>
                </label>
                <input
                  type="range"
                  min="85"
                  max="135"
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                />
              </div>

              <div className="a11y-slider-wrap" style={{ marginTop: 12 }}>
                <label>
                  Line Height
                  <span>{lineHeight}</span>
                </label>
                <input
                  type="range"
                  min="130"
                  max="200"
                  value={lineHeight}
                  onChange={e => setLineHeight(Number(e.target.value))}
                />
              </div>

              <div className="a11y-slider-wrap" style={{ marginTop: 12 }}>
                <label>
                  Letter Spacing
                  <span>{letterSpacing}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={letterSpacing}
                  onChange={e => setLetterSpacing(Number(e.target.value))}
                />
              </div>

              <div className="a11y-row" style={{ marginTop: 14 }}>
                <label>Font Weight</label>
                <div className="toggle-btns">
                  <button
                    className={!boldText ? 'active' : ''}
                    onClick={() => setBoldText(false)}
                  >Normal</button>
                  <button
                    className={boldText ? 'active' : ''}
                    onClick={() => setBoldText(true)}
                  >Bold</button>
                </div>
              </div>

              <div className="a11y-row" style={{ marginTop: 12 }}>
                <label>Readable Font</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={readableFont}
                    onChange={e => setReadableFont(e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              <div className="a11y-row" style={{ marginTop: 12 }}>
                <label>Text Align</label>
                <div className="align-btns">
                  <button
                    className={`align-btn${textAlign === 'left' ? ' active' : ''}`}
                    onClick={() => setTextAlign('left')}
                    aria-label="Align left"
                  ><IconAlignLeft /></button>
                  <button
                    className={`align-btn${textAlign === 'center' ? ' active' : ''}`}
                    onClick={() => setTextAlign('center')}
                    aria-label="Align center"
                  ><IconAlignCenter /></button>
                  <button
                    className={`align-btn${textAlign === 'right' ? ' active' : ''}`}
                    onClick={() => setTextAlign('right')}
                    aria-label="Align right"
                  ><IconAlignRight /></button>
                </div>
              </div>
            </div>

            {/* DISPLAY */}
            <div>
              <div className="a11y-section-label">Display</div>

              <div className="a11y-row">
                <label>Dark Mode</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={e => setDarkMode(e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              <div className="a11y-row" style={{ marginTop: 12 }}>
                <label>Monochrome</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={monochrome}
                    onChange={e => setMonochrome(e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>

            {/* CURSOR */}
            <div>
              <div className="a11y-section-label">Cursor</div>

              <div className="a11y-row">
                <label>Big Cursor</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={bigCursor}
                    onChange={e => setBigCursor(e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

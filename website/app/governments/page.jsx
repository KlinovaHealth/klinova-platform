'use client'
import { useState, useEffect } from 'react'

const C = {
  ink:'#15302A', green:'#0E6B4F', greenDeep:'#0A5440', greenSoft:'#E3EFE8',
  ivory:'#F5EFE3', sand:'#EDE4D2', gold:'#D99A2B', goldSoft:'#F4E2BC',
  mute:'#6E7F76', line:'#E7DECC', card:'#FFFFFF',
}
const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

function PhoneIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="17" r=".4" fill="currentColor" stroke="none"/></svg>
}
function UserIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function ReferralIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11"/></svg>
}
function ChartIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-5M11 16V8M15 16v-3M19 16V5"/></svg>
}
function HeartIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}
function PackageIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
}
function SignalIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01M7 20v-4M12 20V8M17 20V4M22 20v-2"/></svg>
}
function DocumentIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
}
function GlobeIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
}
function MapPinIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-4.5-6-7.5-6-10a6 6 0 0 1 12 0c0 2.5-2 5.5-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
}
function BellIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
}
function UploadIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8M12 3v12"/></svg>
}
function LockIco({ s=20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}

const T = {
  en: {
    nav_ind:'For Individuals', nav_par:'For Partners', nav_gov:'For Governments', nav_contact:'Contact',
    nav_login:'Log in', nav_cta:'Contact our team',
    badge:'Government & NGO partnerships',
    h1:'One doctor. Every', h1_accent:'1 in 5,000 villages.',
    lede:'Serve rural areas. Reduce clinic overcrowding. Save costs. Klinova is the telemedicine backbone that lets governments extend quality primary care to every community without building a new clinic in each one. Individuals can also subscribe directly.',
    cta1:'Request a briefing', cta2:'Download overview',
    sl1:'Doctor-to-patient ratio in rural West Africa',
    sl2:'Of preventable deaths occur outside major cities',
    sl3:'Languages supported. Patients receive care in their own language.',
    sl4:'Average time from contract signing to first village going live',
    rural_ey:'The rural village model', rural_h:'Healthcare coverage where there are no roads to build clinics.',
    rural_sub:"Klinova does not replace the healthcare system; it extends it. We connect the one doctor in the district center to the 5,000 patients spread across remote villages via WhatsApp, SMS, or the Klinova app.",
    r1h:'Any phone, any village', r1p:'Patients use WhatsApp, SMS, or the Klinova app to reach a licensed doctor. No clinic visit required.',
    r2h:'One doctor, many villages', r2p:'A single doctor deployed by Klinova can handle consultations for hundreds of villages per month through structured triage.',
    r3h:'Escalation when needed', r3p:'When a patient requires in-person care, Klinova coordinates referral to the nearest government health center.',
    r4h:'Real-time data for your ministry', r4p:'Your ministry of health receives live, anonymized data covering symptoms, geography, and volume, giving you what you need to plan resources.',
    map_title:'Village coverage map', map_note:'Illustrative. Actual coverage varies by contract.',
    offer_ey:'What you get', offer_h:'A complete telemedicine program, ready to deploy.',
    offer_sub:'Klinova provides everything a ministry of health needs to launch a national telemedicine program, available white-labeled under your brand.',
    o1h:'Primary care telemedicine', o1p:'Licensed doctors serving your citizens by app, WhatsApp, or SMS. Consultations documented, prescriptions issued digitally.',
    o2h:'Medication delivery network', o2p:'Prescriptions route automatically to the nearest partner pharmacy. Last-mile delivery via our network of local riders.',
    o3h:'Disease surveillance', o3p:"Anonymized, real-time symptom data by region. Outbreak detection. Exportable to your ministry's dashboards via API.",
    o4h:'National patient registry', o4p:'Every patient seen is logged with a full consultation history, encrypted and GDPR-compliant. Portable between providers.',
    o5h:'Multilingual, every region', o5p:'Klinova operates in 14 languages. Rural patients are served in Ewe, Kabiye, Twi, Hausa, Fon, and Dioula, not only French.',
    o6h:'Works on any phone', o6p:'Smartphones, feature phones, SMS. Community health workers can triage on behalf of patients without smartphones.',
    surv_ey:'Disease surveillance', surv_h:'See outbreaks before they become crises.',
    s1h:'Geographic symptom mapping', s1p:'Every triage generates a location-tagged symptom report. Cluster detection runs automatically against WHO outbreak thresholds.',
    s2h:'Real-time outbreak alerts', s2p:'Your ministry epidemiology team receives an instant alert when a symptom cluster exceeds threshold, before it reaches the hospital.',
    s3h:'API export to your systems', s3p:'Data exports in FHIR R4 format, compatible with WHO DHIS2, OpenMRS, or any ministry health information system.',
    s4h:'Privacy by design', s4p:'All exported data is anonymized and aggregated. No patient PII leaves Klinova without explicit patient consent.',
    surv_map_title:'Active symptom signals', surv_note:'Live data, anonymized and aggregated',
    comp_ey:'Compliance & data sovereignty', comp_h:'Built to meet government procurement standards.',
    c1h:'Data sovereignty', c1p:'Patient data for each country is stored within its jurisdiction or in the designated regional zone agreed in the contract. Data is never transferred across borders without explicit bilateral agreement.',
    c2h:'Security standards', c2p:'AES-256 field-level encryption for all PHI. TLS 1.3 in transit. Row-level security. Audit logs on every data access. HIPAA-aligned. Penetration tested.',
    c3h:'Medical licensing', c3p:'All doctors on the Klinova platform hold valid registration with the national medical licensing authority in their country. Unlicensed practitioners are not permitted to see patients.',
    c4h:'Procurement & contracting', c4p:'Klinova supports open tender processes and is available under government framework agreements. Pilot programs can be structured as 90-day proof-of-concept contracts.',
    proc_ey:'How it works', proc_h:'From first conversation to village coverage.',
    proc_sub:'We move as fast as government procurement allows, and we know how to navigate it.',
    p1h:'Initial briefing', p1p:'30-minute call with our government partnerships team. We learn your priorities, geography, and constraints.',
    p2h:'Proposal & pilot scope', p2p:'We submit a tailored proposal including pilot district, timeline, and cost per patient covered.',
    p3h:'Pilot deployment', p3p:'90-day proof of concept covering a target district. First villages go live within 48 hours of contract signing.',
    p4h:'National rollout', p4p:'Based on pilot results, scale to full national coverage under a multi-year program agreement.',
    cta_ey:'Start the conversation', cta_h:'Ready to bring telemedicine to your citizens?',
    cta_p:'Our government partnerships team is available for briefings, site visits, and proposal discussions. We work with ministries of health, national health insurance funds, and multilateral development partners.',
    cta_b1:'Request a briefing', cta_b2:'Request our deck',
    cta_email:'contact@klinova.co · We respond within one business day.',
    ft_blurb:'The Invisible Grid powering African healthcare. Lomé, Togo.', ft_tag:'Born in Africa. Built for Life.',
    ft_product:'Product', ft_partners:'Partners', ft_company:'Company', ft_copy:'© 2026 Klinova. All rights reserved.',
  },
  fr: {
    nav_ind:'Pour les individus', nav_par:'Pour les partenaires', nav_gov:'Pour les gouvernements', nav_contact:'Contact',
    nav_login:'Connexion', nav_cta:'Contacter notre équipe',
    badge:'Partenariats gouvernementaux & ONG',
    h1:'Un médecin. Chaque', h1_accent:'village sur 5 000.',
    lede:"Desservir les zones rurales. Réduire l'engorgement des cliniques. Réduire les coûts. Klinova est l'infrastructure de télémédecine qui permet aux gouvernements d'étendre les soins primaires à chaque communauté sans construire de nouvelles cliniques. Les particuliers peuvent aussi s'abonner directement.",
    cta1:'Demander un briefing', cta2:'Télécharger la présentation',
    sl1:'Ratio médecin/patient en Afrique de l\'Ouest rurale',
    sl2:'Des décès évitables surviennent hors des grandes villes',
    sl3:'Langues prises en charge. Les patients reçoivent des soins dans leur langue.',
    sl4:'Délai moyen entre la signature du contrat et le lancement du premier village',
    rural_ey:'Le modèle village rural', rural_h:'Couverture sanitaire là où il n\'y a pas de routes pour construire des cliniques.',
    rural_sub:"Klinova ne remplace pas le système de santé, il l'étend. Nous connectons le seul médecin du centre de district aux 5 000 patients dispersés dans les villages éloignés via WhatsApp, SMS ou l'application Klinova.",
    r1h:'Tout téléphone, tout village', r1p:"Les patients utilisent WhatsApp, SMS ou l'application Klinova pour contacter un médecin agréé. Pas de visite en clinique requise.",
    r2h:'Un médecin, de nombreux villages', r2p:'Un seul médecin déployé par Klinova peut gérer des consultations pour des centaines de villages par mois grâce au triage structuré.',
    r3h:'Escalade si nécessaire', r3p:'Lorsqu\'un patient nécessite des soins en personne, Klinova coordonne l\'orientation vers le centre de santé gouvernemental le plus proche.',
    r4h:'Données en temps réel pour votre ministère', r4p:'Votre ministère de la santé reçoit des données anonymisées en direct couvrant les symptômes, la géographie et le volume.',
    map_title:'Carte de couverture villageoise', map_note:'Illustratif. La couverture réelle varie selon le contrat.',
    offer_ey:'Ce que vous obtenez', offer_h:'Un programme complet de télémédecine, prêt à déployer.',
    offer_sub:"Klinova fournit tout ce dont un ministère de la santé a besoin pour lancer un programme national de télémédecine, disponible en marque blanche sous votre propre marque.",
    o1h:'Télémédecine de soins primaires', o1p:'Médecins agréés au service de vos citoyens par application, WhatsApp ou SMS. Consultations documentées, ordonnances émises numériquement.',
    o2h:'Réseau de livraison de médicaments', o2p:'Les ordonnances sont acheminées automatiquement vers la pharmacie partenaire la plus proche. Livraison du dernier kilomètre via notre réseau de livreurs locaux.',
    o3h:'Surveillance des maladies', o3p:"Données anonymisées en temps réel sur les symptômes par région. Détection des épidémies. Exportable vers les tableaux de bord de votre ministère via API.",
    o4h:'Registre national des patients', o4p:'Chaque patient vu est enregistré avec un historique de consultation complet, chiffré et conforme au RGPD. Portable entre prestataires.',
    o5h:'Multilingue, chaque région', o5p:"Klinova opère en 14 langues. Les patients ruraux sont servis en Ewe, Kabiye, Twi, Haoussa, Fon et Dioula, pas seulement en français.",
    o6h:'Fonctionne sur tout téléphone', o6p:'Smartphones, téléphones basiques, SMS. Les agents de santé communautaires peuvent effectuer le triage au nom des patients sans smartphones.',
    surv_ey:'Surveillance des maladies', surv_h:'Détecter les épidémies avant qu\'elles ne deviennent des crises.',
    s1h:'Cartographie géographique des symptômes', s1p:"Chaque triage génère un rapport de symptômes géolocalisé. La détection de clusters s'exécute automatiquement par rapport aux seuils d'épidémie de l'OMS.",
    s2h:'Alertes épidémiques en temps réel', s2p:"Votre équipe d'épidémiologie ministérielle reçoit une alerte instantanée lorsqu'un cluster de symptômes dépasse le seuil, avant qu'il n'atteigne l'hôpital.",
    s3h:'Export API vers vos systèmes', s3p:'Exports de données au format FHIR R4, compatibles avec WHO DHIS2, OpenMRS ou tout système d\'information sanitaire ministériel.',
    s4h:'Confidentialité dès la conception', s4p:'Toutes les données exportées sont anonymisées et agrégées. Aucune information personnelle de patient ne quitte Klinova sans consentement explicite.',
    surv_map_title:'Signaux de symptômes actifs', surv_note:'Données en direct, anonymisées et agrégées',
    comp_ey:'Conformité & souveraineté des données', comp_h:'Conçu pour répondre aux normes des marchés publics gouvernementaux.',
    c1h:'Souveraineté des données', c1p:'Les données des patients pour chaque pays sont stockées dans sa juridiction ou dans la zone régionale désignée convenue dans le contrat.',
    c2h:'Normes de sécurité', c2p:'Chiffrement au niveau des champs AES-256 pour toutes les PHI. TLS 1.3 en transit. Sécurité au niveau des lignes. Journaux d\'audit sur chaque accès aux données.',
    c3h:'Licences médicales', c3p:'Tous les médecins de la plateforme Klinova détiennent une inscription valide auprès de l\'autorité nationale d\'octroi de licences médicales de leur pays.',
    c4h:'Marchés publics & contrats', c4p:'Klinova prend en charge les processus d\'appels d\'offres ouverts et est disponible dans le cadre d\'accords-cadres gouvernementaux. Les programmes pilotes peuvent être structurés comme des contrats de preuve de concept de 90 jours.',
    proc_ey:'Comment ça marche', proc_h:'De la première conversation à la couverture villageoise.',
    proc_sub:"Nous avançons aussi vite que les marchés publics gouvernementaux le permettent, et nous savons comment les gérer.",
    p1h:'Briefing initial', p1p:'Appel de 30 minutes avec notre équipe partenariats gouvernementaux. Nous apprenons vos priorités, géographie et contraintes.',
    p2h:'Proposition & périmètre pilote', p2p:'Nous soumettons une proposition sur mesure incluant le district pilote, le calendrier et le coût par patient couvert.',
    p3h:'Déploiement pilote', p3p:'Preuve de concept de 90 jours couvrant un district cible. Les premiers villages sont mis en ligne dans les 48 heures suivant la signature du contrat.',
    p4h:'Déploiement national', p4p:'Sur la base des résultats du pilote, extension à la couverture nationale complète dans le cadre d\'un accord de programme pluriannuel.',
    cta_ey:'Démarrer la conversation', cta_h:'Prêt à apporter la télémédecine à vos citoyens ?',
    cta_p:"Notre équipe partenariats gouvernementaux est disponible pour des briefings, des visites de site et des discussions de propositions. Nous travaillons avec les ministères de la santé, les fonds nationaux d'assurance maladie et les partenaires de développement multilatéraux.",
    cta_b1:'Demander un briefing', cta_b2:'Demander notre présentation',
    cta_email:'contact@klinova.co · Nous répondons dans un délai d\'un jour ouvré.',
    ft_blurb:'La grille invisible qui alimente la santé africaine. Lomé, Togo.', ft_tag:'Né en Afrique. Construit pour la Vie.',
    ft_product:'Produit', ft_partners:'Partenaires', ft_company:'Entreprise', ft_copy:'© 2026 Klinova. Tous droits réservés.',
  }
}

export default function GovernmentsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const t = k => T[lang]?.[k] ?? T.en[k]
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])
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
        header{position:sticky;top:0;z-index:100;background:rgba(232,224,208,.95);backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid rgba(210,200,182,.7)}
        nav{display:flex;align-items:center;justify-content:space-between;gap:6px;height:66px;padding:0 28px;max-width:1200px;margin:0 auto}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1;justify-content:center}
        .nav-links a{font-size:13.5px;font-weight:600;color:${C.mute};padding:7px 12px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover,.nav-links a.active{color:${C.ink};background:rgba(14,107,79,.07)}
        .nav-links a.active{color:${C.greenDeep}}
        .nav-right{display:flex;align-items:center;gap:8px;flex:none}
        .lang-pill{display:inline-flex;align-items:center;background:rgba(14,107,79,.08);border:1px solid rgba(14,107,79,.15);border-radius:999px;overflow:hidden}
        .lp-btn{border:none;background:transparent;font-family:${ui};font-size:12px;font-weight:700;letter-spacing:.06em;color:${C.mute};padding:5px 11px;cursor:pointer;transition:background .15s,color .15s}
        .lp-btn:hover{background:rgba(14,107,79,.10);color:${C.ink}}
        .lp-btn.lp-on{background:${C.green};color:#fff}
        .hamburger{display:flex;background:none;border:none;cursor:pointer;color:${C.ink};padding:6px;border-radius:8px;line-height:0}
        .hamburger:hover{background:rgba(14,107,79,.08)}
        .mob-drawer{display:block;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:300}
        .mob-nav{position:fixed;top:0;left:0;width:100vw;height:100vh;max-width:none;margin:0;background:${C.greenDeep};display:flex;flex-direction:column;overflow-y:auto;-webkit-overflow-scrolling:touch;z-index:301}
        .mob-close{position:absolute;top:20px;right:24px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.6);padding:8px;border-radius:8px;line-height:0}
        .mob-close:hover{background:rgba(255,255,255,.1);color:#fff}
        .mob-links{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 10vw}
        .mob-links a{font-family:${display};font-size:clamp(28px,4vw,52px);font-weight:600;color:rgba(255,255,255,.82);text-decoration:none;padding:18px 0;border-bottom:1px solid rgba(255,255,255,.1);transition:color .15s,padding-left .18s;display:block}
        .mob-links a:first-child{border-top:1px solid rgba(255,255,255,.1)}
        .mob-links a:hover{color:#fff;padding-left:12px}
        .mob-foot{padding:28px 10vw;border-top:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
        .mob-foot-lang{display:flex;gap:8px}
        .mob-foot-lang button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:8px;color:rgba(255,255,255,.65);font-family:${ui};font-size:13px;font-weight:700;padding:7px 20px;cursor:pointer;transition:background .15s,color .15s}
        .mob-foot-lang button.active{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.35)}
        .mob-foot-actions{display:flex;align-items:center;gap:20px}
        .mob-foot-actions a{font-size:15px;font-weight:600;text-decoration:none}
        .mob-foot-login{color:rgba(255,255,255,.6)}
        .mob-foot-cta{color:${C.gold}}
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
        .village-dot{width:8px;height:8px;border-radius:50%;flex:none}
        .village-dot.active{background:#6ED8A8}
        .village-dot.pending{background:${C.gold}}
        .village-label{font-size:13px;color:rgba(255,255,255,.65);flex:1}
        .village-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}
        .village-status.active{background:rgba(14,107,79,.3);color:#6ED8A8}
        .village-status.pending{background:rgba(217,154,43,.2);color:${C.gold}}
        /* WHAT WE OFFER */
        .offer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
        .offer-card{background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px 22px;display:flex;flex-direction:column;gap:12px}
        .offer-icon{width:40px;height:40px;border-radius:12px;background:${C.greenSoft};color:${C.greenDeep};display:grid;place-items:center;flex:none}
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
        .surv-feat-icon{width:40px;height:40px;border-radius:12px;background:${C.greenSoft};color:${C.greenDeep};display:grid;place-items:center;flex:none}
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
        @media(max-width:1024px){
          .stats-grid{grid-template-columns:1fr 1fr}
          .offer-grid{grid-template-columns:1fr 1fr}
          .rural-layout{grid-template-columns:1fr}
          .surv-layout{grid-template-columns:1fr}
          .process{grid-template-columns:1fr 1fr}
          .process::before{display:none}
          .footer-grid{grid-template-columns:1fr 1fr 1fr}
        }
        @media(max-width:768px){
          section{padding:56px 0}
          .stats-band{padding:32px 0}
          .stats-grid,.offer-grid,.compliance,.process,.rural-layout,.surv-layout{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          nav{padding:0 14px;height:58px;justify-content:space-between}
          .nav-links{display:none}
          .contact-cta{padding:36px 20px}
          .process::before{display:none}
          .stat-num{font-size:36px}
        }
        @media(max-width:480px){
          section{padding:40px 0}
          .wrap{padding:0 16px}
          .footer-grid{grid-template-columns:1fr}
          h1{font-size:30px}
          h2{font-size:22px}
          .hero{padding:48px 0 60px}
          .contact-cta{padding:28px 16px}
          .stat-num{font-size:30px}
          .footer-col{display:none}
          .footer-grid > div:first-child{display:block}
          .stats-band{padding:24px 0}
          .lede{font-size:16px;max-width:none}
        }
      `}</style>

      <header>
        <nav>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height:32, width:'auto', mixBlendMode:'multiply' }} />
          </a>
          <div className="nav-links">
            <a href="/patients">{t('nav_ind')}</a>
            <a href="/partner">{t('nav_par')}</a>
            <a href="/governments" className="active">{t('nav_gov')}</a>
            <a href="mailto:contact@klinova.co">{t('nav_contact')}</a>
          </div>
          <div className="nav-right">
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
              }
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="mob-drawer" onClick={() => setMenuOpen(false)}>
          <nav className="mob-nav" onClick={e => e.stopPropagation()}>
            <button className="mob-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="mob-links">
              <a href="/patients" onClick={() => setMenuOpen(false)}>{t('nav_ind')}</a>
              <a href="/partner" onClick={() => setMenuOpen(false)}>{t('nav_par')}</a>
              <a href="/governments" onClick={() => setMenuOpen(false)}>{t('nav_gov')}</a>
            </div>
            <div className="mob-foot">
              <div className="mob-foot-lang">
                <button className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button>
                <button className={lang==='fr'?'active':''} onClick={()=>setLang('fr')}>FR</button>
              </div>
              <div className="mob-foot-actions">
                <a href="/login" className="mob-foot-login" onClick={() => setMenuOpen(false)}>{t('nav_login')}</a>
                <a href="mailto:contact@klinova.co?subject=Government Partnership" className="mob-foot-cta" onClick={() => setMenuOpen(false)}>{t('nav_cta')} →</a>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge">{t('badge')}</div>
          <h1>{t('h1')}<br/><span className="accent">{t('h1_accent')}</span></h1>
          <p className="lede">{t('lede')}</p>
          <div className="cta">
            <a href="#contact" className="btn btn-primary">{t('cta1')}</a>
            <a href="mailto:contact@klinova.co" className="btn" style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,.2)', textDecoration:'none' }}>{t('cta2')}</a>
          </div>
        </div>
      </section>

      {/* CRISIS STATS */}
      <div className="stats-band">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-block">
              <div><span className="stat-num">1</span><span className="stat-unit">:</span><span className="stat-num">5,000</span></div>
              <div className="stat-label">{t('sl1')}</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">72</span><span className="stat-unit">%</span></div>
              <div className="stat-label">{t('sl2')}</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">14</span></div>
              <div className="stat-label">{t('sl3')}</div>
            </div>
            <div className="stat-block">
              <div><span className="stat-num">48</span><span className="stat-unit">h</span></div>
              <div className="stat-label">{t('sl4')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* RURAL VILLAGE MODEL */}
      <section>
        <div className="wrap">
          <div className="eyebrow">{t('rural_ey')}</div>
          <h2>{t('rural_h')}</h2>
          <div className="rural-layout">
            <div>
              <p className="sub">{t('rural_sub')}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:28 }}>
                {[
                  { ico:<PhoneIco/>, h:t('r1h'), body:t('r1p') },
                  { ico:<UserIco/>, h:t('r2h'), body:t('r2p') },
                  { ico:<ReferralIco/>, h:t('r3h'), body:t('r3p') },
                  { ico:<ChartIco/>, h:t('r4h'), body:t('r4p') },
                ].map(f => (
                  <div key={f.h} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:C.greenSoft, color:C.greenDeep, display:'grid', placeItems:'center', flexShrink:0 }}>{f.ico}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, fontFamily:ui, marginBottom:4 }}>{f.h}</div>
                      <div style={{ fontSize:14, color:C.mute, lineHeight:1.6 }}>{f.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rural-graphic">
              <div className="rural-graphic-title">{t('map_title')}</div>
              {[
                { label:'Kpove District · 12 villages', status:'active', txt:'Live' },
                { label:'Bassar Region · 8 villages', status:'active', txt:'Live' },
                { label:'Centrale Region · 5 villages', status:'pending', txt:'Onboarding' },
                { label:'Savanes Region · 18 villages', status:'pending', txt:'Planned Q4' },
                { label:'Maritime Region · 22 villages', status:'active', txt:'Live' },
              ].map(v => (
                <div className="village-row" key={v.label}>
                  <div className={`village-dot ${v.status}`}/>
                  <div className="village-label">{v.label}</div>
                  <div className={`village-status ${v.status}`}>{v.txt}</div>
                </div>
              ))}
              <div style={{ marginTop:16, background:'rgba(255,255,255,.06)', borderRadius:12, padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,.5)', textAlign:'center' }}>{t('map_note')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT KLINOVA OFFERS GOVERNMENTS */}
      <section>
        <div className="wrap">
          <div className="eyebrow">{t('offer_ey')}</div>
          <h2>{t('offer_h')}</h2>
          <p className="sub">{t('offer_sub')}</p>
          <div className="offer-grid">
            {[
              { ico:<HeartIco/>, h:t('o1h'), p:t('o1p') },
              { ico:<PackageIco/>, h:t('o2h'), p:t('o2p') },
              { ico:<SignalIco/>, h:t('o3h'), p:t('o3p') },
              { ico:<DocumentIco/>, h:t('o4h'), p:t('o4p') },
              { ico:<GlobeIco/>, h:t('o5h'), p:t('o5p') },
              { ico:<PhoneIco/>, h:t('o6h'), p:t('o6p') },
            ].map(o => (
              <div className="offer-card" key={o.h}>
                <div className="offer-icon">{o.ico}</div>
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
          <div className="eyebrow">{t('surv_ey')}</div>
          <h2>{t('surv_h')}</h2>
          <div className="surv-layout">
            <div className="surv-features">
              {[
                { ico:<MapPinIco/>, h:t('s1h'), p:t('s1p') },
                { ico:<BellIco/>, h:t('s2h'), p:t('s2p') },
                { ico:<UploadIco/>, h:t('s3h'), p:t('s3p') },
                { ico:<LockIco/>, h:t('s4h'), p:t('s4p') },
              ].map(f => (
                <div className="surv-feat" key={f.h}>
                  <div className="surv-feat-icon">{f.ico}</div>
                  <div>
                    <h4>{f.h}</h4>
                    <p>{f.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="surv-map">
              <div className="surv-map-title">{t('surv_map_title')}</div>
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
              <div style={{ marginTop:14, fontSize:11, color:'rgba(255,255,255,.35)', textAlign:'center' }}>{t('surv_note')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section>
        <div className="wrap">
          <div className="eyebrow">{t('comp_ey')}</div>
          <h2>{t('comp_h')}</h2>
          <div className="compliance">
            <div className="comp-card">
              <h3>{t('c1h')}</h3>
              <p>{t('c1p')}</p>
              <div className="comp-tags">
                <span className="comp-tag">In-country storage</span>
                <span className="comp-tag">No cross-border transfer</span>
                <span className="comp-tag">GDPR compliant</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>{t('c2h')}</h3>
              <p>{t('c2p')}</p>
              <div className="comp-tags">
                <span className="comp-tag">AES-256-GCM</span>
                <span className="comp-tag">TLS 1.3</span>
                <span className="comp-tag">HIPAA</span>
                <span className="comp-tag">Audit logging</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>{t('c3h')}</h3>
              <p>{t('c3p')}</p>
              <div className="comp-tags">
                <span className="comp-tag">Licensed providers only</span>
                <span className="comp-tag">Country-by-country verification</span>
              </div>
            </div>
            <div className="comp-card">
              <h3>{t('c4h')}</h3>
              <p>{t('c4p')}</p>
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
          <div className="eyebrow">{t('proc_ey')}</div>
          <h2>{t('proc_h')}</h2>
          <p className="sub">{t('proc_sub')}</p>
          <div className="process">
            <div className="pstep"><div className="pstep-dot">1</div><h4>{t('p1h')}</h4><p>{t('p1p')}</p></div>
            <div className="pstep"><div className="pstep-dot">2</div><h4>{t('p2h')}</h4><p>{t('p2p')}</p></div>
            <div className="pstep"><div className="pstep-dot">3</div><h4>{t('p3h')}</h4><p>{t('p3p')}</p></div>
            <div className="pstep"><div className="pstep-dot">4</div><h4>{t('p4h')}</h4><p>{t('p4p')}</p></div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section id="contact" style={{ borderBottom:'none' }}>
        <div className="wrap">
          <div className="contact-cta">
            <div className="eyebrow">{t('cta_ey')}</div>
            <h2>{t('cta_h')}</h2>
            <p>{t('cta_p')}</p>
            <div className="contact-options">
              <a href="mailto:contact@klinova.co?subject=Government Partnership - Briefing Request" className="btn btn-primary">{t('cta_b1')}</a>
              <a href="mailto:contact@klinova.co?subject=Government Partnership - Overview Deck" className="btn btn-ghost">{t('cta_b2')}</a>
            </div>
            <div style={{ marginTop:20, fontSize:13, color:C.mute }}>{t('cta_email')}</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-logo-name">KLINOVA</div>
              <div className="footer-blurb">{t('ft_blurb')}</div>
              <div className="footer-tagline">{t('ft_tag')}</div>
            </div>
            <div>
              <div className="footer-col-title">{t('ft_product')}</div>
              <div className="footer-col">
                <a href="/patients">{lang==='fr'?'Pour les patients':'For patients'}</a>
                <a href="/partner">{lang==='fr'?'Pour les partenaires':'For partners'}</a>
                <a href="/governments">{lang==='fr'?'Pour les gouvernements':'For governments'}</a>
                <a href="/#pricing">{lang==='fr'?'Tarifs':'Pricing'}</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">{t('ft_partners')}</div>
              <div className="footer-col">
                <a href="/partner#clinics">{lang==='fr'?'Cliniques':'Clinics'}</a>
                <a href="/partner#pharmacies">Pharmacies</a>
                <a href="/partner#doctors">{lang==='fr'?'Médecins':'Doctors'}</a>
                <a href="/governments">{lang==='fr'?'Gouvernements':'Governments'}</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">{t('ft_company')}</div>
              <div className="footer-col">
                <a href="mailto:contact@klinova.co">Contact</a>
                <a href="/privacy">{lang==='fr'?'Confidentialité et données':'Privacy and data'}</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{t('ft_copy')}</span>
            <span>Powered by Klinova</span>
          </div>
        </div>
      </footer>
    </>
  )
}

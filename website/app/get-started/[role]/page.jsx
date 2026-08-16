'use client'
import { useState } from 'react'

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
}

/* Role hero colors — all within or derived from the brand palette */
const ROLE_COLORS = {
  patients:   C.greenDeep,  // #0A5440
  doctors:    C.ink,        // #15302A
  clinics:    C.green,      // #0E6B4F
  pharmacy:   '#1A4D3A',    // deep teal-green — on-brand, distinct from clinics
  government: '#0A3020',    // very dark forest green
}

const T = {
  en: {
    contact: 'Questions?',
    already: 'Already have an account?',
    signin_link: 'Sign in →',

    patients: {
      eyebrow: 'FOR PATIENTS',
      title: 'Start your consultation',
      subtitle: 'Choose how you\'d like to access Klinova. No waiting room, no travel.',
      info_title: 'Simple, affordable plans',
      info: [
        { label: 'Solo plan', value: '1,500 XOF / month' },
        { label: 'Family plan', value: '3,500 XOF / month', note: 'You + 4 family members' },
      ],
      features: [
        'Video & voice consultations',
        'Digital prescriptions',
        'Health records, always accessible',
        '1 free medication delivery / month',
        '10% off partner clinics',
        'Works on any phone',
      ],
      cards: [
        { icon: '📱', title: 'Download the app', desc: 'Get the Klinova app on Android or iOS. Book a doctor, manage your health, find nearby clinics.', cta: 'Get the app', href: '/download', primary: true },
        { icon: '🌐', title: 'Create a web account', desc: 'Sign up directly in your browser, no app download needed. Access your records, book a doctor, and manage your health on any device.', cta: 'Create account', href: '/login?mode=signup&role=patient', primary: false },
        { icon: '🔑', title: 'Already have an account?', desc: 'Sign in to see your health records, past consultations, and prescriptions.', cta: 'Sign in', href: '/login', primary: false },
        { icon: '💬', title: 'WhatsApp triage', desc: 'Start a consultation via WhatsApp in your language. No smartphone required.', cta: 'Coming soon', href: null, primary: false, soon: true },
      ],
    },

    doctors: {
      eyebrow: 'FOR DOCTORS',
      title: 'Join as a healthcare provider',
      subtitle: 'See patients on your schedule, consult from anywhere, and get paid reliably through mobile money.',
      info_title: 'What you get',
      info: [
        { label: 'Joining fee', value: 'Free' },
        { label: 'Payment', value: 'Mobile money (Flooz, TMoney, MTN)' },
        { label: 'PayPal', value: 'Coming soon', soon: true },
      ],
      features: [
        'Set your own availability',
        'Consult by chat, voice, or video',
        'Issue digital prescriptions',
        'Reach patients across West Africa',
        'Patient queue managed for you',
        'Only licensed doctors\' credentials are verified',
      ],
      cards: [
        { icon: '🩺', title: 'Create your provider account', desc: 'Register with your credentials and specialty. Get access to your patient queue, prescriptions, and referrals all in one place.', cta: 'Create account', href: '/login?mode=signup&role=doctor', primary: true },
        { icon: '🔑', title: 'Already registered?', desc: 'Sign in to your doctor dashboard to manage consultations, issue prescriptions, and view your schedule.', cta: 'Sign in', href: '/login', primary: false },
        { icon: '📍', title: 'Listed automatically', desc: 'Your profile appears in the Klinova provider directory the moment your account is active — patients find you by city, country, and specialty.', cta: 'View directory', href: '/find', primary: false },
      ],
    },

    clinics: {
      eyebrow: 'FOR CLINICS & HOSPITALS',
      title: 'Partner with Klinova',
      subtitle: 'List your facility, receive referrals, and access anonymised health intelligence for your region.',
      info_title: 'What\'s included',
      info: [
        { label: 'Referrals', value: 'Digital, automatic' },
        { label: 'Subscription', value: 'Contact us for pricing' },
      ],
      features: [
        'Full clinic management suite',
        'Appointments, records & billing in one place',
        'Receive referrals from triaged Klinova patients',
        'Digital prescription integration',
        'Listed on the Klinova patient map',
        'Works on any phone or browser',
      ],
      cards: [
        { icon: '🏥', title: 'Create a clinic account', desc: 'Register your facility on Klinova. Manage your team, receive digital referrals, and serve patients sent by Klinova doctors.', cta: 'Create account', href: '/login?mode=signup&role=frontdesk', primary: true },
        { icon: '🔑', title: 'Already registered?', desc: 'Sign in to manage your clinic\'s queue, view referrals, and access patient records.', cta: 'Sign in', href: '/login', primary: false },
        { icon: '📍', title: 'Listed automatically', desc: 'Your facility appears in the Klinova provider directory the moment your account is created — searchable by patients nearby, by city, region, and country.', cta: 'Create account', href: '/login?mode=signup&role=frontdesk', primary: false },
      ],
    },

    pharmacy: {
      eyebrow: 'FOR PHARMACIES',
      title: 'Join the pharmacy network',
      subtitle: 'Receive electronic prescriptions, show your real-time stock, and grow your foot traffic with zero upfront cost.',
      info_title: 'Why join',
      info: [
        { label: 'Joining fee', value: 'Free' },
        { label: 'Prescriptions', value: 'Sent digitally, automatically' },
      ],
      features: [
        'Receive electronic prescriptions from nearby patients',
        'Show real-time stock to people who need it',
        'More foot traffic, less wasted inventory',
        'Works on any phone or browser',
        'Fulfilled orders reported back automatically',
        'No large upfront cost',
      ],
      cards: [
        { icon: '💊', title: 'Create your pharmacy account', desc: 'Register your pharmacy on Klinova. Receive digital prescriptions, fulfill orders, and report back, all in one system.', cta: 'Create account', href: '/login?mode=signup&role=pharmacist', primary: true },
        { icon: '🔑', title: 'Already registered?', desc: 'Sign in to view incoming prescriptions and manage your pharmacy\'s fulfillment queue.', cta: 'Sign in', href: '/login', primary: false },
        { icon: '📍', title: 'Listed automatically', desc: 'Your pharmacy appears in the Klinova provider directory the moment your account is created — patients nearby can find you by city, region, and country.', cta: 'View directory', href: '/find', primary: false },
      ],
    },

    government: {
      eyebrow: 'FOR GOVERNMENTS & NGOs',
      title: 'Access health intelligence',
      subtitle: 'See real-time, anonymized health data for your region, disease trends, triage data, and outbreak alerts.',
      info_title: 'What you get access to',
      info: [
        { label: 'Data', value: 'Anonymized & aggregate only' },
        { label: 'Pricing', value: 'Licensed per region, contact us.' },
      ],
      features: [
        'Real-time disease trend maps',
        'Outbreak alerts: malaria, cholera, and dengue',
        'Triage volume & urgency breakdowns',
        'WHO-compatible data standards',
        'Individual privacy fully protected',
        'Ministry of Health integration support',
      ],
      cards: [
        { icon: '🏛️', title: 'Create a government account', desc: 'Register your organization to access the government dashboard, aggregate trends, urgency breakdowns, and WHO outbreak data.', cta: 'Create account', href: '/login?mode=signup&role=government', primary: true },
        { icon: '🔑', title: 'Already have access?', desc: 'Sign in to your government dashboard to view live health intelligence for your region.', cta: 'Sign in', href: '/login', primary: false },
        { icon: '📋', title: 'Request a demo first', desc: 'Want to see the platform before committing? We\'ll walk you through the dashboard and data governance model.', cta: 'Request demo', href: `mailto:contact@klinova.co?subject=${encodeURIComponent('Government Demo Request – Klinova')}&body=${encodeURIComponent('Hello, we represent [organisation name] and would like to request a demo.\n\nCountry: \nOrganisation: \nContact name & phone: ')}`, primary: false },
      ],
    },
  },

  fr: {
    contact: 'Des questions ?',
    already: 'Vous avez déjà un compte ?',
    signin_link: 'Se connecter →',

    patients: {
      eyebrow: 'POUR LES PATIENTS',
      title: 'Démarrez votre consultation',
      subtitle: 'Choisissez comment vous souhaitez accéder à Klinova. Pas de salle d\'attente, pas de déplacement.',
      info_title: 'Des forfaits simples et abordables',
      info: [
        { label: 'Forfait Solo', value: '1 500 XOF / mois' },
        { label: 'Forfait Famille', value: '3 500 XOF / mois', note: 'Vous + 4 membres de la famille' },
      ],
      features: [
        'Consultations vidéo et vocales',
        'Ordonnances numériques',
        'Dossiers de santé, toujours accessibles',
        '1 livraison de médicaments gratuite / mois',
        '10% de réduction dans les cliniques partenaires',
        'Fonctionne sur tout type de téléphone',
      ],
      cards: [
        { icon: '📱', title: 'Télécharger l\'application', desc: 'Obtenez l\'application Klinova sur Android ou iOS. Consultez un médecin, gérez votre santé, trouvez les cliniques proches.', cta: 'Obtenir l\'app', href: '/download', primary: true },
        { icon: '🌐', title: 'Créer un compte web', desc: 'Inscrivez-vous directement depuis votre navigateur, sans téléchargement. Accédez à vos dossiers, consultez un médecin et gérez votre santé sur n\'importe quel appareil.', cta: 'Créer un compte', href: '/login?mode=signup&role=patient', primary: false },
        { icon: '🔑', title: 'Déjà un compte ?', desc: 'Connectez-vous pour voir vos dossiers médicaux, consultations passées et ordonnances.', cta: 'Se connecter', href: '/login', primary: false },
        { icon: '💬', title: 'Triage WhatsApp', desc: 'Démarrez une consultation via WhatsApp dans votre langue. Aucun smartphone requis.', cta: 'Bientôt disponible', href: null, primary: false, soon: true },
      ],
    },

    doctors: {
      eyebrow: 'POUR LES MÉDECINS',
      title: 'Rejoindre en tant que prestataire',
      subtitle: 'Consultez selon votre emploi du temps, depuis n\'importe où, et soyez payé de manière fiable par mobile money.',
      info_title: 'Ce que vous obtenez',
      info: [
        { label: 'Frais d\'adhésion', value: 'Gratuit' },
        { label: 'Paiement', value: 'Mobile money (Flooz, TMoney, MTN)' },
        { label: 'PayPal', value: 'Bientôt disponible', soon: true },
      ],
      features: [
        'Définissez vos propres disponibilités',
        'Consultez par chat, voix ou vidéo',
        'Émettez des ordonnances numériques',
        'Atteignez des patients en Afrique de l\'Ouest',
        'File de patients gérée pour vous',
        'Seuls les diplômes des médecins agréés sont vérifiés',
      ],
      cards: [
        { icon: '🩺', title: 'Créer votre compte prestataire', desc: 'Inscrivez-vous avec vos diplômes et spécialité. Accédez à votre file de patients, ordonnances et références en un seul endroit.', cta: 'Créer un compte', href: '/login?mode=signup&role=doctor', primary: true },
        { icon: '🔑', title: 'Déjà inscrit ?', desc: 'Connectez-vous à votre tableau de bord médecin pour gérer vos consultations, rédiger des ordonnances et consulter votre planning.', cta: 'Se connecter', href: '/login', primary: false },
        { icon: '📍', title: 'Référencé automatiquement', desc: 'Votre profil apparaît dans l\'annuaire Klinova dès l\'activation de votre compte — les patients vous trouvent par ville, pays et spécialité.', cta: 'Voir l\'annuaire', href: '/find', primary: false },
      ],
    },

    clinics: {
      eyebrow: 'POUR LES CLINIQUES ET HÔPITAUX',
      title: 'Partenariat avec Klinova',
      subtitle: 'Référencez votre établissement, recevez des références et accédez aux données de santé anonymisées de votre région.',
      info_title: 'Ce qui est inclus',
      info: [
        { label: 'Références', value: 'Numériques, automatiques' },
        { label: 'Abonnement', value: 'Contactez-nous pour les tarifs' },
      ],
      features: [
        'Suite complète de gestion de clinique',
        'Rendez-vous, dossiers et facturation en un seul endroit',
        'Recevez des références de patients triés par Klinova',
        'Intégration des ordonnances numériques',
        'Référencé sur la carte Klinova pour les patients',
        'Fonctionne sur tout téléphone ou navigateur',
      ],
      cards: [
        { icon: '🏥', title: 'Créer un compte clinique', desc: 'Enregistrez votre établissement sur Klinova. Gérez votre équipe, recevez des références numériques et accueillez les patients envoyés par les médecins Klinova.', cta: 'Créer un compte', href: '/login?mode=signup&role=frontdesk', primary: true },
        { icon: '🔑', title: 'Déjà inscrit ?', desc: 'Connectez-vous pour gérer la file d\'attente de votre clinique, voir les références et accéder aux dossiers patients.', cta: 'Se connecter', href: '/login', primary: false },
        { icon: '📍', title: 'Référencé automatiquement', desc: 'Votre établissement apparaît dans l\'annuaire Klinova dès la création de votre compte — trouvable par les patients proches, par ville, région et pays.', cta: 'Créer un compte', href: '/login?mode=signup&role=frontdesk', primary: false },
      ],
    },

    pharmacy: {
      eyebrow: 'POUR LES PHARMACIES',
      title: 'Rejoindre le réseau de pharmacies',
      subtitle: 'Recevez des ordonnances électroniques, affichez votre stock en temps réel et augmentez votre trafic sans frais d\'adhésion.',
      info_title: 'Pourquoi nous rejoindre',
      info: [
        { label: 'Frais d\'adhésion', value: 'Gratuit' },
        { label: 'Ordonnances', value: 'Envoyées numériquement, automatiquement' },
      ],
      features: [
        'Recevez des ordonnances électroniques des patients proches',
        'Affichez votre stock en temps réel aux personnes qui en ont besoin',
        'Plus de trafic, moins de gaspillage',
        'Fonctionne sur tout téléphone ou navigateur',
        'Commandes traitées et remontées automatiquement',
        'Aucun coût initial important',
      ],
      cards: [
        { icon: '💊', title: 'Créer votre compte pharmacie', desc: 'Enregistrez votre pharmacie sur Klinova. Recevez des ordonnances numériques, traitez les commandes et communiquez les résultats, tout en un seul système.', cta: 'Créer un compte', href: '/login?mode=signup&role=pharmacist', primary: true },
        { icon: '🔑', title: 'Déjà inscrit ?', desc: 'Connectez-vous pour consulter les ordonnances entrantes et gérer la file de traitement de votre pharmacie.', cta: 'Se connecter', href: '/login', primary: false },
        { icon: '📍', title: 'Référencé automatiquement', desc: 'Votre pharmacie apparaît dans l\'annuaire Klinova dès la création de votre compte — les patients proches vous trouvent par ville, région et pays.', cta: 'Voir l\'annuaire', href: '/find', primary: false },
      ],
    },

    government: {
      eyebrow: 'POUR LES GOUVERNEMENTS ET ONG',
      title: 'Accéder aux données de santé',
      subtitle: 'Consultez les données de santé anonymisées en temps réel pour votre région, tendances des maladies, données de triage et alertes épidémiques.',
      info_title: 'Ce à quoi vous accédez',
      info: [
        { label: 'Données', value: 'Anonymisées et agrégées uniquement' },
        { label: 'Tarif', value: 'Licence par région, contactez-nous.' },
      ],
      features: [
        'Cartes de tendances épidémiques en temps réel',
        'Alertes épidémiques : paludisme, choléra et dengue',
        'Volume de triage et niveaux d\'urgence',
        'Normes de données compatibles OMS',
        'Vie privée individuelle entièrement protégée',
        'Support d\'intégration pour les ministères de la santé',
      ],
      cards: [
        { icon: '🏛️', title: 'Créer un compte gouvernement', desc: 'Enregistrez votre organisation pour accéder au tableau de bord gouvernemental, tendances agrégées, niveaux d\'urgence et données OMS.', cta: 'Créer un compte', href: '/login?mode=signup&role=government', primary: true },
        { icon: '🔑', title: 'Déjà un accès ?', desc: 'Connectez-vous à votre tableau de bord gouvernemental pour consulter les données de santé en direct pour votre région.', cta: 'Se connecter', href: '/login', primary: false },
        { icon: '📋', title: 'Demander une démonstration', desc: 'Vous souhaitez voir la plateforme avant de vous engager ? Nous vous présenterons le tableau de bord et le modèle de gouvernance des données.', cta: 'Demander une démo', href: `mailto:contact@klinova.co?subject=${encodeURIComponent('Demande de démo gouvernement – Klinova')}&body=${encodeURIComponent('Bonjour, nous représentons [nom de l\'organisation] et souhaitons une démonstration.\n\nPays : \nOrganisation : \nContact : ')}`, primary: false },
      ],
    },
  },
}

export default function GetStartedPage({ params }) {
  const [lang, setLang] = useState('en')
  const t    = T[lang]
  const role = params.role

  if (!t[role]) {
    return (
      <main style={{ background: C.ivory, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: C.mute }}>Page not found.</p>
          <a href="/" style={{ color: C.green }}>Go home →</a>
        </div>
      </main>
    )
  }

  const content = t[role]
  const color   = ROLE_COLORS[role] || C.greenDeep

  return (
    <main style={{ background: C.ivory, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.greenDeep, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/klinova-logo-green.jpg" alt="Klinova" height={44} style={{ display: 'block' }} />
        </a>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.12)', borderRadius: 8, padding: 3 }}>
          {['en', 'fr'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 700, fontSize: 12, letterSpacing: '.05em',
                background: lang === l ? '#fff' : 'transparent',
                color: lang === l ? C.greenDeep : 'rgba(255,255,255,.7)',
                transition: 'all .15s',
              }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero band */}
      <div style={{ background: color, padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            {content.eyebrow}
          </p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, color: '#fff', lineHeight: 1.2, margin: '0 0 14px' }}>
            {content.title}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Info / pricing band */}
      <div style={{ background: C.sand, borderBottom: `1px solid ${C.line}`, padding: '28px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            {content.info_title}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {content.info.map((item, i) => (
              <div key={i} style={{ background: item.soon ? C.sand : '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 16px', minWidth: 160, opacity: item.soon ? 0.75 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.label}</span>
                  {item.soon && <span style={{ fontSize: 9, fontWeight: 700, background: C.goldSoft, color: C.amber, padding: '1px 6px', borderRadius: 999, letterSpacing: '.04em', textTransform: 'uppercase' }}>Soon</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.soon ? C.mute : C.ink }}>{item.value}</div>
                {item.note && <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{item.note}</div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
            {content.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.ink }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.green, flexShrink: 0, fontWeight: 700 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {content.cards.map((card, i) => (
            <div key={i} style={{
              background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16,
              padding: '24px 28px', opacity: card.soon ? 0.55 : 1,
              borderLeft: card.primary ? `4px solid ${C.greenDeep}` : `1px solid ${C.line}`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: '0 0 6px' }}>{card.title}</h2>
              <p style={{ fontSize: 13.5, color: C.mute, lineHeight: 1.6, margin: '0 0 18px' }}>{card.desc}</p>
              {card.href ? (
                <a href={card.href}
                  style={{
                    display: 'inline-block', padding: '10px 22px', borderRadius: 9,
                    fontWeight: 600, fontSize: 13.5, textDecoration: 'none',
                    background: card.primary ? C.greenDeep : 'transparent',
                    color: card.primary ? '#fff' : C.greenDeep,
                    border: card.primary ? 'none' : `1.5px solid ${C.greenDeep}`,
                  }}>
                  {card.cta}
                </a>
              ) : (
                <span style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 9, fontWeight: 600, fontSize: 13.5, background: C.sand, color: C.mute }}>
                  {card.cta}
                </span>
              )}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 36, fontSize: 13, color: C.mute }}>
          {t.contact} <a href="mailto:contact@klinova.co" style={{ color: C.green, fontWeight: 600 }}>contact@klinova.co</a>
        </p>
      </div>

    </main>
  )
}

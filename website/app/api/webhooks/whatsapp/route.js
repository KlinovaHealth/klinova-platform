import { createAdminClient } from '@/lib/supabase-server'

const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? 'klinova_verify'
const WA_TOKEN        = process.env.WHATSAPP_ACCESS_TOKEN
const WA_PHONE_ID     = process.env.WHATSAPP_PHONE_NUMBER_ID
const OPENAI_KEY      = process.env.OPENAI_API_KEY
const LELAPA_KEY      = process.env.LELAPA_API_KEY
const KHAYA_KEY       = process.env.KHAYA_API_KEY
const KHAYA_BASE      = 'https://translation.ghananlp.org/v1'
const KHAYA_LANG      = { ewe:'ee', twi:'tw', akan:'tw', dagbani:'dag', dagaare:'dga', hausa:'ha', yoruba:'yo', ga:'gaa' }

// ── In-memory session state (persists across warm function invocations) ────────
// { phone → { state, lang, langConfirmed, intent, name, country, flag, returning, menuSent } }
const sessions = new Map()

// ── Multilingual bot messages ──────────────────────────────────────────────────
const MSG = {
  en: {
    lang_prompt: `Welcome to Klinova 👋\n\nPlease choose your language:\n\n1️⃣ Français\n2️⃣ English\n3️⃣ Eʋegbe (Ewe)\n4️⃣ Twi\n5️⃣ Hausa\n6️⃣ Yorùbá\n7️⃣ Pidgin\n\nReply with 1, 2, 3, 4, 5, 6 or 7.`,
    welcome:     n => `Hi ${n} 👋 Welcome to Klinova!\n\nHow can we help you today?\n\n1️⃣ Start a consultation\n2️⃣ Find a clinic near me\n3️⃣ Find a pharmacy near me\n4️⃣ Speak to a doctor\n\nReply with a number, or just describe how you feel.`,
    returning:   n => `Welcome back ${n} 👋\n\n1️⃣ New consultation\n2️⃣ Find a clinic\n3️⃣ Find a pharmacy\n4️⃣ Talk to a doctor\n\nOr just tell us how you feel.`,
    symptom_go:    'Got it. Please describe your symptoms — voice note or text, any language. 🎙️',
    doctor_soon:   '👨‍⚕️ A Klinova doctor will review your case shortly. First, please describe your symptoms.',
    ask_location:  'Please share your 📍 location pin so we can find the nearest option for you.',
    loc_received:  '📍 Location received! Finding options near you…',
    unknown:       "Sorry, I didn't understand. Reply 1, 2, 3, or 4 — or describe your symptoms.",
    no_facility:   'We couldn\'t find a nearby facility in our system. A Klinova team member will contact you shortly.',
    clinic_header: '🏥 Nearest clinics:',
    pharma_header: '💊 Nearest pharmacies:',
  },
  fr: {
    welcome:     n => `Bonjour ${n} 👋 Bienvenue sur Klinova !\n\nComment pouvons-nous vous aider ?\n\n1️⃣ Démarrer une consultation\n2️⃣ Trouver une clinique\n3️⃣ Trouver une pharmacie\n4️⃣ Parler à un médecin\n\nRépondez par un chiffre ou décrivez comment vous vous sentez.`,
    returning:   n => `Bonjour ${n} 👋\n\n1️⃣ Nouvelle consultation\n2️⃣ Trouver une clinique\n3️⃣ Trouver une pharmacie\n4️⃣ Parler à un médecin\n\nOu dites-nous comment vous vous sentez.`,
    symptom_go:    'Compris. Décrivez vos symptômes — message vocal ou texte, dans la langue de votre choix. 🎙️',
    doctor_soon:   '👨‍⚕️ Un médecin Klinova examinera votre dossier bientôt. Décrivez d\'abord vos symptômes.',
    ask_location:  'Partagez votre 📍 localisation pour trouver l\'option la plus proche.',
    loc_received:  '📍 Localisation reçue ! Nous cherchons les options proches de vous…',
    unknown:       "Désolé, je n'ai pas compris. Répondez 1, 2, 3 ou 4 — ou décrivez vos symptômes.",
    no_facility:   'Aucun établissement trouvé à proximité. Un membre de l\'équipe Klinova vous contactera bientôt.',
    clinic_header: '🏥 Cliniques les plus proches :',
    pharma_header: '💊 Pharmacies les plus proches :',
  },
  ee: {
    welcome:     n => `Woezo ${n} 👋 Míe woezo Klinova !\n\nAleke míadze ŋu na wò ?\n\n1️⃣ Dze consultation ɖe ŋu\n2️⃣ Kpɔ clinic si le wò te\n3️⃣ Kpɔ pharmacy si le wò te\n4️⃣ Ƒo gbe kple dɔkpla\n\nNaŋlɔ nɔme, alo gblɔ nèxɔse ɖe.`,
    returning:   n => `Woezo megbe ${n} 👋\n\n1️⃣ Consultation yeyea\n2️⃣ Kpɔ clinic\n3️⃣ Kpɔ pharmacy\n4️⃣ Ƒo gbe kple dɔkpla\n\nAlo gblɔ nèxɔse ɖe.`,
    symptom_go:    'Nyo ! Gblɔ nèxɔse ɖe — nu gblɔgblɔ, alo naŋlɔ. 🎙️',
    doctor_soon:   '👨‍⚕️ Klinova dɔkpla aƒo gbe kple wò enumake. Gblɔ nèxɔse ɖe nuŋɔŋlɔ sɔ.',
    ask_location:  'Taflatse ŋlɔ wò xɔxɔme 📍 eye míagakpɔ teƒe si le wò te.',
    loc_received:  '📍 Mawɔ wò xɔxɔme ! Míele teƒe siwo le wò te kpɔm…',
    unknown:       'Mawo gɔme o. Taflatse ŋlɔ 1, 2, 3, alo 4 — alo gblɔ nèxɔse ɖe.',
    no_facility:   'Míekpɔ teƒe aɖeke le wò te o. Klinova ŋɔ dɔwɔla aƒo gbe kple wò.',
    clinic_header: '🏥 Clinics siwo le wò te:',
    pharma_header: '💊 Pharmacies siwo le wò te:',
  },
  tw: {
    welcome:     n => `Akwaaba ${n} 👋 Klinova mu aye wo yie!\n\nDeen nti yɛbɛboa wo?\n\n1️⃣ Hyɛ nhwɛso ase\n2️⃣ Hunu klinik bi a ɛbɛn wo\n3️⃣ Hunu adwuma yɛbea bi a ɛbɛn wo\n4️⃣ Kasa kyerɛ dɔkota\n\nBua no na nɔma, anaasɛ kyerɛ wo yareɛ.`,
    returning:   n => `Akwaaba san ba ${n} 👋\n\n1️⃣ Nhwɛso foforo\n2️⃣ Hunu klinik\n3️⃣ Hunu adwuma yɛbea\n4️⃣ Kasa kyerɛ dɔkota\n\nAnaasɛ kyerɛ wo yareɛ.`,
    symptom_go:    'Aane. Kyerɛ wo yareɛ — ɔdↄnkↄmmɔ anaasɛ nsɛm, kasa biara mu. 🎙️',
    doctor_soon:   '👨‍⚕️ Klinova dɔkota bɛhwɛ wo asɛm ntɛmntɛm. Ansa na wo kyerɛ wo yareɛ.',
    ask_location:  'Fa wo 📍 beaeɛ brɛ yɛn na yɛmfa nhunu adwuma yɛbea a ɛbɛn wo.',
    loc_received:  '📍 Yɛadwen wo beaeɛ! Yɛrehwehwɛ adwuma yɛbea a ɛbɛn wo…',
    unknown:       'Kafra, mente aseɛ. Bua 1, 2, 3, anaasɛ 4 — anaasɛ kyerɛ wo yareɛ.',
    no_facility:   'Yɛantumi ahunu adwuma yɛbea biara wo wo ho. Klinova ɔwɔfo bɛkasa wo ho ntɛmntɛm.',
    clinic_header: '🏥 Klinik a ɛbɛn wo:',
    pharma_header: '💊 Adwuma yɛbea a ɛbɛn wo:',
  },
  ha: {
    welcome:     n => `Sannu ${n} 👋 Barka da zuwa Klinova!\n\nYaya zamu taimake ka?\n\n1️⃣ Fara shawarwari\n2️⃣ Nemo asibiti kusa da kai\n3️⃣ Nemo kantin magani kusa da kai\n4️⃣ Yi magana da likita\n\nBa da amsa da lamba, ko bayyana yadda kake ji.`,
    returning:   n => `Sannu da dawo ${n} 👋\n\n1️⃣ Sabuwar shawarwari\n2️⃣ Nemo asibiti\n3️⃣ Nemo kantin magani\n4️⃣ Magana da likita\n\nKo faɗa mana yadda kake ji.`,
    symptom_go:    'To. Bayyana alamun rashin lafiyarka — saƙo ko murya, kowane harshe. 🎙️',
    doctor_soon:   '👨‍⚕️ Likitan Klinova zai duba lamarka nan ba da jimawa ba. Da farko, bayyana alamunka.',
    ask_location:  'Don Allah raba 📍 wurin ka domin mu sami mafi kusa maka.',
    loc_received:  '📍 An karɓi wuri! Ana nemo zaɓuɓɓuka kusa da kai…',
    unknown:       'Yi hakuri, ban fahimci ba. Ba da amsa 1, 2, 3, ko 4 — ko bayyana alamunka.',
    no_facility:   'Ba mu sami wurin lafiya kusa da kai ba. Ɗan ƙungiyar Klinova zai tuntuɓe ka nan ba da jimawa ba.',
    clinic_header: '🏥 Asibiti mafi kusa:',
    pharma_header: '💊 Kantin magani mafi kusa:',
  },
  yo: {
    welcome:     n => `E kaabọ ${n} 👋 A kí yín sí Klinova!\n\nBáwo ni a ṣe lè ràn yín lọ́wọ́?\n\n1️⃣ Bẹ̀rẹ̀ ìgbìmọ̀\n2️⃣ Wá ilé-ìwòsàn tó sún mọ́ yín\n3️⃣ Wá ilé egbòogi tó sún mọ́ yín\n4️⃣ Bá dókítà sọ̀rọ̀\n\nDáhùn pẹ̀lú nọ́mbà, tàbí ṣàpèjúwe bí o ṣe ń lára.`,
    returning:   n => `E padà bọ̀ wá ${n} 👋\n\n1️⃣ Ìgbìmọ̀ tuntun\n2️⃣ Wá ilé-ìwòsàn\n3️⃣ Wá ilé egbòogi\n4️⃣ Bá dókítà sọ̀rọ̀\n\nTàbí sọ fún wa bí o ṣe ń lára.`,
    symptom_go:    'O dára. Ṣàpèjúwe àìsàn rẹ — ìfiránṣẹ́ ohùn tàbí ọ̀rọ̀, èdè èyíkéyìí. 🎙️',
    doctor_soon:   '👨‍⚕️ Dókítà Klinova yóò ṣàyẹ̀wò ọ̀ràn rẹ láìpẹ́. Àkọ́kọ́, ṣàpèjúwe àìsàn rẹ.',
    ask_location:  'Jọ̀wọ́ pín 📍 ipò rẹ kí a lè rí àṣàyàn tó sún mọ́ yín.',
    loc_received:  '📍 Ipò tí a ti gba! A ń wá àwọn àṣàyàn tó sún mọ́ yín…',
    unknown:       'Má bínú, mi ò gbọ́. Dáhùn 1, 2, 3, tàbí 4 — tàbí ṣàpèjúwe àìsàn rẹ.',
    no_facility:   'A kò rí ilé-ìwòsàn tó sún mọ́ yín. Ọmọ ẹgbẹ́ Klinova yóò kan sí yín láìpẹ́.',
    clinic_header: '🏥 Ilé-ìwòsàn tó sún mọ́ yín:',
    pharma_header: '💊 Ilé egbòogi tó sún mọ́ yín:',
    emergency:     '🚨 THIS IS AN EMERGENCY. Call emergency services immediately!\n\nNípa ìpèníjà: Pè ìgbèríko ilé-ìwòsàn tí ó sún mọ́ yín tàbí wà síbẹ̀ báyìí. A ti ránṣẹ́ sí dókítà Klinova.',
  },
  pid: {
    welcome:     n => `How e dey ${n} 👋 Welcome to Klinova!\n\nHow we go help you today?\n\n1️⃣ Start consultation\n2️⃣ Find clinic near you\n3️⃣ Find pharmacy near you\n4️⃣ Talk to doctor\n\nReply with number, or tell us how you dey feel.`,
    returning:   n => `Welcome back ${n} 👋\n\n1️⃣ New consultation\n2️⃣ Find clinic\n3️⃣ Find pharmacy\n4️⃣ Talk to doctor\n\nOr just tell us how your body dey.`,
    symptom_go:    'Okay. Tell us wetin dey do you — voice note or text, any language. 🎙️',
    doctor_soon:   '👨‍⚕️ Klinova doctor go look your case soon. First, tell us wetin dey do you.',
    ask_location:  'Abeg share your 📍 location so we go find wetin dey near you.',
    loc_received:  '📍 We don get your location! We dey find options near you…',
    unknown:       'Sorry, I no understand. Reply 1, 2, 3 or 4 — or describe how your body dey.',
    no_facility:   'We no find any place near you for our system. Klinova person go call you soon.',
    clinic_header: '🏥 Clinics wey dey near you:',
    pharma_header: '💊 Pharmacies wey dey near you:',
    emergency:     '🚨 THIS NA EMERGENCY! Call ambulance or go nearest hospital NOW!\n\nWe don already tell Klinova doctor about you. No waste time.',
  },
}

// ── Emergency messages (inline with each language above, fallback here) ─────
const EMERGENCY = {
  en:  '🚨 THIS IS AN EMERGENCY. Go to the nearest hospital immediately or call an ambulance!\n\nA Klinova doctor has been alerted. Do NOT wait.',
  fr:  '🚨 URGENCE MÉDICALE. Rendez-vous immédiatement aux urgences ou appelez une ambulance !\n\nUn médecin Klinova a été alerté. N\'attendez PAS.',
  ee:  '🚨 KPƆKPLE NYUITƆ. Yi kpɔ hospital si le wò te enumake, alo ylɔ ambulance!\n\nKlinova dɔkpla aƒo gbe kple wò. Mede o.',
  tw:  '🚨 BƐHIA WO NTƐMNTƐM. Kɔ hospital a ɛbɛn wo ntɛm, anaasɛ frɛ ambulance!\n\nKlinova dɔkota ahu wo asɛm. Ntwɛn nkɔ.',
  ha:  '🚨 GAGGAWA! Tafi asibiti mafi kusa nan da nan ko kira ambulance!\n\nLikitan Klinova an sanar da shi. Kada ka jira.',
  yo:  '🚨 ÌPÈ NÍJÀ! Lọ sí ilé-ìwòsàn tó sún mọ́ yín lẹ́sẹ̀kẹsẹ̀ tàbí pè ambulance!\n\nDókítà Klinova ti mọ̀ nípa rẹ. Má dúró.',
  pid: '🚨 THIS NA EMERGENCY! Go nearest hospital NOW or call ambulance!\n\nKlinova doctor don know about you. No wait.',
}

function m(lang, key, arg) {
  const l = MSG[lang] ?? MSG.en
  const val = l[key] ?? MSG.en[key]
  return typeof val === 'function' ? val(arg) : val
}

// ── Country detection from phone prefix ───────────────────────────────────────
const PHONE_COUNTRY = {
  '228': { country: 'Togo',          lang: 'fr', flag: '🇹🇬' },
  '233': { country: 'Ghana',         lang: 'en', flag: '🇬🇭' },
  '229': { country: 'Benin',         lang: 'fr', flag: '🇧🇯' },
  '225': { country: "Côte d'Ivoire", lang: 'fr', flag: '🇨🇮' },
  '226': { country: 'Burkina Faso',  lang: 'fr', flag: '🇧🇫' },
  '234': { country: 'Nigeria',       lang: 'en', flag: '🇳🇬' },
  '221': { country: 'Senegal',       lang: 'fr', flag: '🇸🇳' },
  '223': { country: 'Mali',          lang: 'fr', flag: '🇲🇱' },
  '224': { country: 'Guinea',        lang: 'fr', flag: '🇬🇳' },
  '232': { country: 'Sierra Leone',  lang: 'en', flag: '🇸🇱' },
  '231': { country: 'Liberia',       lang: 'en', flag: '🇱🇷' },
  '237': { country: 'Cameroon',      lang: 'fr', flag: '🇨🇲' },
  '220': { country: 'Gambia',        lang: 'en', flag: '🇬🇲' },
  '245': { country: 'Guinea-Bissau', lang: 'fr', flag: '🇬🇼' },
  '227': { country: 'Niger',         lang: 'fr', flag: '🇳🇪' },
  '236': { country: 'Central Africa',lang: 'fr', flag: '🇨🇫' },
}

function getCountryInfo(phone = '') {
  // WhatsApp sends phone without +, e.g. "22890123456"
  for (const prefix of ['237','236','234','233','232','231','229','228','227','226','225','224','223','222','221','220','245']) {
    if (phone.startsWith(prefix)) return { ...PHONE_COUNTRY[prefix], prefix }
  }
  return { country: 'Unknown', lang: 'fr', flag: '🌍', prefix: null }
}

// ── Simple language detection from text (fallback) ────────────────────────────
function detectLang(text = '') {
  const t = text.toLowerCase()
  const frWords = ['bonjour','salut','je ','suis','aide','médecin','moi','une','des','du ','mal','merci','mon ','ma ','les ']
  const eeWords = ['medi','mele','mawɔ','woezo','ŋutɔ','taflatse','agbɔ','ɖe ','eye ','nèxɔ','kpɔ ']
  const twWords  = ['akwaaba','medaase','mepaakyɛw','yɛ','ɛkɔ','bɛn','hwɛ','nkɔ','yareɛ','dɔkota']
  const haWords  = ['sannu','yaya','lafiya','asibiti','magani','likita','nemo','taimake','gobe','insha']
  const yoWords  = ['kaabọ','ẹ jẹ́','dókítà','àìsàn','ìwòsàn','egbòogi','jọ̀wọ́','bí','tàbí','ṣe']
  const pidWords = ['wetin','dey','na im','abeg','oga','ehen','no be','don already','wey dey','e don']
  const frScore  = frWords.filter(w => t.includes(w)).length
  const eeScore  = eeWords.filter(w => t.includes(w)).length
  const twScore  = twWords.filter(w => t.includes(w)).length
  const haScore  = haWords.filter(w => t.includes(w)).length
  const yoScore  = yoWords.filter(w => t.includes(w)).length
  const pidScore = pidWords.filter(w => t.includes(w)).length
  const max = Math.max(frScore, eeScore, twScore, haScore, yoScore, pidScore)
  if (max < 2) return null
  if (eeScore  === max) return 'ee'
  if (twScore  === max) return 'tw'
  if (haScore  === max) return 'ha'
  if (yoScore  === max) return 'yo'
  if (pidScore === max) return 'pid'
  if (frScore  === max) return 'fr'
  return null
}

// ── Haversine distance (km) ───────────────────────────────────────────────────
function km(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function nearestFacilities(lat, lng, type, limit = 3) {
  try {
    const res  = await fetch('https://klinova.co/api/facilities')
    const data = await res.json()
    const list = type === 'pharmacy' ? data.pharmacy : [...(data.clinic ?? []), ...(data.hospital ?? [])]
    return list
      .filter(f => f.location?.x && f.location?.y)
      .map(f => ({ ...f, dist: km(lat, lng, f.location.y, f.location.x) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit)
  } catch { return [] }
}

// ─── GET: WhatsApp webhook verification ───────────────────────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) return new Response(challenge, { status: 200 })
  return new Response('Forbidden', { status: 403 })
}

// ─── POST: Incoming WhatsApp messages ─────────────────────────────────────────
export async function POST(req) {
  const body     = await req.json()
  const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages
  const contacts = body?.entry?.[0]?.changes?.[0]?.value?.contacts

  if (!messages?.length) return new Response('ok', { status: 200 })

  const msg     = messages[0]
  const phone   = msg.from
  const msgType = msg.type
  const name    = contacts?.[0]?.profile?.name ?? phone

  if (msgType === 'location') {
    await handleLocation({ phone, lat: msg.location.latitude, lng: msg.location.longitude })
    return new Response('ok', { status: 200 })
  }

  if (msgType === 'audio') {
    await handleVoiceNote({ phone, mediaId: msg.audio.id, name })
    return new Response('ok', { status: 200 })
  }

  if (msgType === 'text') {
    await handleText({ phone, text: msg.text.body, name })
    return new Response('ok', { status: 200 })
  }

  return new Response('ok', { status: 200 })
}

// ─── Text message handler ─────────────────────────────────────────────────────
async function handleText({ phone, text, name }) {
  const supabase = createAdminClient()
  let session = sessions.get(phone) ?? {}
  const trimmed = text.trim()

  // Country + language from phone prefix (most reliable signal)
  if (!session.country) {
    const info = getCountryInfo(phone)
    session.country = info.country
    session.flag    = info.flag
    session.lang    = session.lang ?? info.lang
  }

  // ── Language selection step (new users only) ──────────────────────────────
  if (!session.langConfirmed) {
    // Check if returning user first
    if (session.returning === undefined) {
      const { count } = await supabase
        .from('whatsapp_triage')
        .select('*', { count: 'exact', head: true })
        .eq('wa_phone', phone)
      session.returning = (count ?? 0) > 0
    }

    if (!session.returning) {
      if (!session.langPromptSent) {
        // Send language picker on first contact
        session.langPromptSent = true
        sessions.set(phone, session)
        await sendWhatsAppMessage(phone, MSG.en.lang_prompt)
        return
      }
      // Handle their language choice (1=FR, 2=EN, 3=EWE)
      const langMap = { '1': 'fr', '2': 'en', '3': 'ee', '4': 'tw', '5': 'ha', '6': 'yo', '7': 'pid' }
      if (langMap[trimmed]) {
        session.lang          = langMap[trimmed]
        session.langConfirmed = true
        session.menuSent      = true
        sessions.set(phone, session)
        await sendWhatsAppMessage(phone, m(session.lang, 'welcome', name))
        return
      }
      // Invalid reply — re-send picker
      sessions.set(phone, session)
      await sendWhatsAppMessage(phone, MSG.en.lang_prompt)
      return
    }

    // Returning user — skip language picker, use stored lang
    session.langConfirmed = true
  }

  const lang = session.lang

  // Menu reply (1–4)
  if (['1','2','3','4'].includes(trimmed)) {
    await handleMenuChoice({ phone, choice: trimmed, session, lang, name, supabase })
    sessions.set(phone, { ...session, lang })
    return
  }

  // Check if returning user already saw the menu
  if (!session.menuSent) {
    session.menuSent = true
    sessions.set(phone, session)
    await sendWhatsAppMessage(phone, m(lang, session.returning ? 'returning' : 'welcome', name))
    return
  }

  // Returning user or already past menu — treat as symptom description
  session.state = 'awaiting_symptom_audio'
  sessions.set(phone, session)
  await sendWhatsAppMessage(phone, m(lang, 'symptom_go'))
  await analyseAndStore({ phone, name, text, lang, supabase })
}

// ─── Menu choice handler ──────────────────────────────────────────────────────
async function handleMenuChoice({ phone, choice, session, lang, name, supabase }) {
  if (choice === '1') {
    // Consultation — ask them to describe symptoms
    session.state  = 'consulting'
    session.intent = 'consultation'
    await sendWhatsAppMessage(phone, m(lang, 'symptom_go'))
  } else if (choice === '2') {
    // Find clinic — ask for location
    session.state  = 'awaiting_location'
    session.intent = 'clinic'
    await sendWhatsAppMessage(phone, m(lang, 'ask_location'))
  } else if (choice === '3') {
    // Find pharmacy — ask for location
    session.state  = 'awaiting_location'
    session.intent = 'pharmacy'
    await sendWhatsAppMessage(phone, m(lang, 'ask_location'))
  } else if (choice === '4') {
    // Talk to doctor — collect symptoms first
    session.state  = 'consulting'
    session.intent = 'doctor'
    await sendWhatsAppMessage(phone, m(lang, 'doctor_soon'))
    await sendWhatsAppMessage(phone, m(lang, 'symptom_go'))
  }
  sessions.set(phone, session)
}

// ─── Location received ────────────────────────────────────────────────────────
async function handleLocation({ phone, lat, lng }) {
  const supabase = createAdminClient()
  const session  = sessions.get(phone) ?? {}
  const lang     = session.lang ?? 'fr'
  const intent   = session.intent

  // Update most recent triage record
  await supabase
    .from('whatsapp_triage')
    .update({ location_lat: lat, location_lng: lng, status: 'location_received' })
    .eq('wa_phone', phone)
    .in('status', ['awaiting_location', 'emergency'])
    .order('created_at', { ascending: false })
    .limit(1)

  await sendWhatsAppMessage(phone, m(lang, 'loc_received'))

  // Emergency: always show nearest hospitals + doctor contact
  if (intent === 'emergency' || session.state === 'emergency') {
    const hospitals = await nearestFacilities(lat, lng, 'clinic', 3)
    if (hospitals.length) {
      const HOSP = { en: '🏥 Nearest hospitals — go NOW:', fr: '🏥 Hôpitaux les plus proches — allez-y MAINTENANT :', ee: '🏥 Hospitawo si le wò te — Yi enumake:', tw: '🏥 Hospital a ɛbɛn wo — Kɔ ntɛm!', ha: '🏥 Asibiti mafi kusa — Tafi yanzu!', yo: '🏥 Ilé-ìwòsàn tó sún mọ́ yín — Lọ láìpẹ́!', pid: '🏥 Hospital near you — Go now!' }
      const header = HOSP[lang] ?? HOSP.en
      const list   = hospitals.map((f, i) => `${i+1}. ${f.name ?? 'Hospital'} — ${f.dist.toFixed(1)} km`).join('\n')
      await sendWhatsAppMessage(phone, `${header}\n\n${list}`)
    } else {
      await sendWhatsAppMessage(phone, m(lang, 'no_facility'))
    }
    // Also alert the doctor queue in-app
    await supabase.from('whatsapp_triage')
      .update({ location_lat: lat, location_lng: lng, status: 'emergency_located' })
      .eq('wa_phone', phone).eq('status', 'location_received')
    session.state = 'done'
    sessions.set(phone, session)
    return
  }

  // Consultation: find nearest clinic
  if (intent === 'consultation') {
    const clinics = await nearestFacilities(lat, lng, 'clinic', 3)
    if (clinics.length) {
      const list = clinics.map((f, i) => `${i+1}. ${f.name ?? 'Clinic'} — ${f.dist.toFixed(1)} km`).join('\n')
      await sendWhatsAppMessage(phone, `${m(lang, 'clinic_header')}\n\n${list}`)
    }
    session.state = 'done'
    sessions.set(phone, session)
    return
  }

  // Explicit clinic / pharmacy search
  if (intent === 'clinic' || intent === 'pharmacy') {
    const type     = intent === 'pharmacy' ? 'pharmacy' : 'clinic'
    const header   = m(lang, intent === 'pharmacy' ? 'pharma_header' : 'clinic_header')
    const facilities = await nearestFacilities(lat, lng, type)
    if (!facilities.length) {
      await sendWhatsAppMessage(phone, m(lang, 'no_facility'))
    } else {
      const list = facilities.map((f, i) =>
        `${i+1}. ${f.name ?? (type === 'pharmacy' ? 'Pharmacy' : 'Clinic')} — ${f.dist.toFixed(1)} km`
      ).join('\n')
      await sendWhatsAppMessage(phone, `${header}\n\n${list}`)
    }
    session.state = 'done'
    sessions.set(phone, session)
  }
}

// ─── Voice note pipeline ──────────────────────────────────────────────────────
async function handleVoiceNote({ phone, mediaId, name }) {
  const supabase = createAdminClient()
  const session  = sessions.get(phone) ?? {}

  // Set country from phone prefix if not already known
  if (!session.country) {
    const info      = getCountryInfo(phone)
    session.country = info.country
    session.flag    = info.flag
    session.lang    = session.lang ?? info.lang
  }
  const lang = session.lang

  // If new user with no session, detect language after transcription
  if (!session.menuSent && !session.returning) {
    const { count } = await supabase
      .from('whatsapp_triage')
      .select('*', { count: 'exact', head: true })
      .eq('wa_phone', phone)
    session.returning = (count ?? 0) > 0

    if (!session.returning) {
      // First contact via voice — welcome them after transcribing
      session.menuSent = true
    }
  }

  try {
    const audioBuffer = await downloadWhatsAppMedia(mediaId)

    // Transcribe — Khaya → Lelapa → Whisper
    let transcription = '', khayaDetectedLang = null
    if (KHAYA_KEY) {
      try { const r = await transcribeWithKhaya(audioBuffer); transcription = r.text; khayaDetectedLang = r.lang } catch {}
    }
    if (!transcription && LELAPA_KEY) transcription = await transcribeWithLelapa(audioBuffer)
    if (!transcription)               transcription = await transcribeWithWhisper(audioBuffer)

    // Translate with Khaya if language detected
    let khayaTranslation = null
    if (KHAYA_KEY && khayaDetectedLang) {
      khayaTranslation = await translateWithKhaya(transcription, khayaDetectedLang)
      if (khayaDetectedLang) session.lang = khayaDetectedLang.toLowerCase().slice(0, 2) === 'ee' ? 'ee' : lang
    }

    sessions.set(phone, session)
    await analyseAndStore({ phone, name, text: transcription, preTranslation: khayaTranslation, supabase, lang: session.lang ?? lang })

  } catch (err) {
    console.error('WhatsApp voice error:', err)
    await sendWhatsAppMessage(phone, m(lang, 'unknown'))
  }
}

// ─── Analyse text/transcription and store triage entry ───────────────────────
async function analyseAndStore({ phone, name, text, preTranslation = null, lang, supabase }) {
  const session  = sessions.get(phone) ?? {}
  const analysis = await analyzeWithGPT(text, preTranslation)
  const isEmergency = analysis.urgency === 'emergency'

  await supabase
    .from('whatsapp_triage')
    .insert({
      wa_phone:      phone,
      patient_name:  name,
      transcription: text,
      translation:   preTranslation ?? analysis.translation,
      intent:        analysis.intent,
      urgency:       analysis.urgency,
      language:      analysis.language,
      summary:       analysis.summary,
      country:       session.country ?? null,
      status:        isEmergency ? 'emergency' : 'awaiting_location',
    })

  if (isEmergency) {
    // Send emergency alert in patient's language immediately
    const emergencyMsg = EMERGENCY[lang] ?? EMERGENCY.en
    await sendWhatsAppMessage(phone, emergencyMsg)
    // Also send location request — first responders or family may need it
    const locMsg = analysis.locationRequest ?? m(lang, 'ask_location')
    await sendWhatsAppMessage(phone, locMsg)
    sessions.set(phone, { ...session, state: 'emergency', intent: 'emergency', returning: true })
    return
  }

  // Non-emergency: ask for location to find nearest clinic
  const replyText = analysis.locationRequest ?? m(lang, 'ask_location')
  await sendWhatsAppMessage(phone, replyText)
  sessions.set(phone, { ...session, state: 'awaiting_location', intent: 'consultation', returning: true })
}

// ─── Khaya AI ASR ─────────────────────────────────────────────────────────────
async function transcribeWithKhaya(audioBuffer) {
  const form = new FormData()
  form.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice.ogg')
  const res = await fetch(`${KHAYA_BASE}/asr/transcribe`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KHAYA_KEY },
    body: form,
  })
  if (!res.ok) throw new Error(`Khaya ASR ${res.status}`)
  const json = await res.json()
  return { text: json.text ?? json.transcription ?? json.result ?? '', lang: json.language ?? json.lang ?? null }
}

// ─── Khaya AI translation ─────────────────────────────────────────────────────
async function translateWithKhaya(text, detectedLang) {
  const code = KHAYA_LANG[detectedLang?.toLowerCase()]
  if (!code) return null
  const res = await fetch(`${KHAYA_BASE}/translate`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KHAYA_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ in: text, lang: `${code}-en` }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.out ?? json.translation ?? null
}

// ─── Lelapa AI transcription ──────────────────────────────────────────────────
async function transcribeWithLelapa(audioBuffer) {
  const LELAPA_URL = process.env.LELAPA_TRANSCRIBE_URL ?? 'https://platform-backend.lelapa.ai/api/v1/transcribe/process'
  const form = new FormData()
  form.append('audio_file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice.ogg')
  const res = await fetch(LELAPA_URL, { method: 'POST', headers: { 'X-CLIENT-TOKEN': LELAPA_KEY }, body: form })
  const json = await res.json()
  return json.text ?? json.transcription ?? json.result ?? ''
}

// ─── OpenAI Whisper transcription (fallback) ──────────────────────────────────
async function transcribeWithWhisper(audioBuffer) {
  const form = new FormData()
  form.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice.ogg')
  form.append('model', 'whisper-1')
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: form,
  })
  const json = await res.json()
  return json.text ?? ''
}

// ─── GPT-4o analysis ──────────────────────────────────────────────────────────
async function analyzeWithGPT(transcription, khayaTranslation = null) {
  const userContent = khayaTranslation
    ? `Transcription:\n"${transcription}"\n\nKhaya AI translation (West African language model):\n"${khayaTranslation}"\n\nUse Khaya translation as the "translation" field.`
    : `Transcription:\n"${transcription}"`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical triage assistant for Klinova, a West African healthcare platform.
Return a JSON object with:
- "language": detected language (Ewe, Twi, Kabye, French, English, etc.)
- "translation": English translation
- "intent": medical need in 3-5 words
- "urgency": "low" | "medium" | "high" | "emergency"
- "summary": 1-2 sentences for the doctor
- "locationRequest": message in patient's language asking them to share their WhatsApp location pin to find the nearest clinic
Only return valid JSON, no markdown.`,
        },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    }),
  })
  const json = await res.json()
  try { return JSON.parse(json.choices[0].message.content) }
  catch { return { language: 'Unknown', translation: transcription, intent: 'Medical concern', urgency: 'medium', summary: transcription, locationRequest: m('en', 'ask_location') } }
}

// ─── WhatsApp send message ────────────────────────────────────────────────────
async function sendWhatsAppMessage(to, text) {
  if (!WA_TOKEN || !WA_PHONE_ID) return
  await fetch(`https://graph.facebook.com/v25.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  })
}

// ─── Download WhatsApp media ──────────────────────────────────────────────────
async function downloadWhatsAppMedia(mediaId) {
  const urlRes  = await fetch(`https://graph.facebook.com/v25.0/${mediaId}`, { headers: { Authorization: `Bearer ${WA_TOKEN}` } })
  const { url } = await urlRes.json()
  const fileRes = await fetch(url, { headers: { Authorization: `Bearer ${WA_TOKEN}` } })
  return Buffer.from(await fileRes.arrayBuffer())
}

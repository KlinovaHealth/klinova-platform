const BASE     = 'https://graph.facebook.com/v19.0'
const TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// Strip non-digits and leading + so the number is in WhatsApp's expected format
export function normalizePhone(raw = '') {
  return raw.replace(/\D/g, '').replace(/^0+/, '')
}

export async function sendText(to, body) {
  if (!TOKEN || !PHONE_ID || !to) return
  const phone = normalizePhone(to)
  if (!phone) return
  await fetch(`${BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body, preview_url: false },
    }),
  })
}

// ── Outbound message templates ────────────────────────────────────────────────

export function buildWelcome(name, lang = 'fr') {
  if (lang === 'fr') {
    return `Bonjour ${name} 👋\n\nBienvenue sur *Klinova* — votre plateforme de santé en ligne.\n\nVous pouvez maintenant :\n• Démarrer une consultation\n• Trouver une clinique ou une pharmacie\n• Parler à un médecin\n\nConnectez-vous sur klinova.co ou répondez directement ici pour commencer.`
  }
  return `Hi ${name} 👋\n\nWelcome to *Klinova* — your telemedicine platform.\n\nYou can now:\n• Start a consultation\n• Find a clinic or pharmacy\n• Talk to a doctor\n\nLog in at klinova.co or reply here to get started.`
}

export function buildAppointmentConfirmed(patientName, doctorName, date, time, reason, lang = 'fr') {
  if (lang === 'fr') {
    return `✅ *Rendez-vous confirmé*\n\n*Patient :* ${patientName}\n*Médecin :* ${doctorName}\n*Date :* ${date}\n*Heure :* ${time}\n*Motif :* ${reason}\n\nSi vous devez annuler ou modifier ce rendez-vous, veuillez nous contacter.`
  }
  return `✅ *Appointment confirmed*\n\n*Patient:* ${patientName}\n*Doctor:* ${doctorName}\n*Date:* ${date}\n*Time:* ${time}\n*Reason:* ${reason}\n\nTo cancel or reschedule, please contact us.`
}

export function buildConsultationReady(patientName, lang = 'fr') {
  if (lang === 'fr') {
    return `👨‍⚕️ *Un médecin Klinova est prêt*\n\nBonjour ${patientName},\n\nUn médecin a pris en charge votre dossier et est prêt à vous consulter.\n\nConnectez-vous sur *klinova.co/dashboard* pour démarrer la consultation.\n\nNe tardez pas — le médecin vous attend.`
  }
  return `👨‍⚕️ *A Klinova doctor is ready*\n\nHi ${patientName},\n\nA doctor has picked up your case and is ready to see you.\n\nLog in at *klinova.co/dashboard* to start your consultation.\n\nDon't wait — your doctor is standing by.`
}

import { sendGated } from '@/lib/whatsapp-gateway'
import { buildWelcome, buildAppointmentConfirmed, buildConsultationReady } from '@/lib/whatsapp'

// Safe-pattern messages: notify only, route clinical detail to the secure Klinova app
const SAFE_MESSAGES = {
  appointment_confirmed: {
    en: (p) => [
      `Klinova: Your appointment has been confirmed for ${p.date} at ${p.time}.`,
      `If you have questions, log in at klinova.co`,
      `⚠️ If this is an emergency, contact local emergency services or go to the nearest hospital immediately.`,
    ].join('\n'),
    fr: (p) => [
      `Klinova : Votre rendez-vous est confirmé pour le ${p.date} à ${p.time}.`,
      `Pour toute question, connectez-vous sur klinova.co`,
      `⚠️ En cas d'urgence, appelez les secours locaux ou rendez-vous immédiatement à l'hôpital le plus proche.`,
    ].join('\n'),
  },
  consultation_active: {
    en: (p) => [
      `Klinova: A clinician is ready for your consultation.`,
      `Please open the secure Klinova platform to continue: klinova.co`,
      `⚠️ If this is an emergency, contact local emergency services immediately. Do not wait for Klinova.`,
    ].join('\n'),
    fr: (p) => [
      `Klinova : Un médecin est prêt pour votre consultation.`,
      `Ouvrez la plateforme sécurisée Klinova pour continuer : klinova.co`,
      `⚠️ Si c'est une urgence, appelez les secours locaux immédiatement. N'attendez pas Klinova.`,
    ].join('\n'),
  },
  prescription_ready: {
    en: (p) => [
      `Klinova: Your clinician has updated your care plan.`,
      `Please log in to view your prescription details: klinova.co`,
      `⚠️ If this is an emergency, contact local emergency services or go to your nearest hospital.`,
    ].join('\n'),
    fr: (p) => [
      `Klinova : Votre médecin a mis à jour votre plan de soins.`,
      `Connectez-vous pour voir les détails de votre ordonnance : klinova.co`,
      `⚠️ En cas d'urgence, appelez les secours locaux ou rendez-vous à l'hôpital le plus proche.`,
    ].join('\n'),
  },
  appointment_reminder: {
    en: (p) => [
      `Klinova reminder: You have an appointment on ${p.date} at ${p.time}.`,
      `Log in at klinova.co to manage your appointment.`,
      `⚠️ For emergencies, contact local emergency services immediately.`,
    ].join('\n'),
    fr: (p) => [
      `Rappel Klinova : Vous avez un rendez-vous le ${p.date} à ${p.time}.`,
      `Connectez-vous sur klinova.co pour gérer votre rendez-vous.`,
      `⚠️ Pour les urgences, appelez les secours locaux immédiatement.`,
    ].join('\n'),
  },
  welcome: {
    en: (p) => buildWelcome(p.name ?? 'there', 'en'),
    fr: (p) => buildWelcome(p.name ?? '', 'fr'),
  },
}

export async function POST(request) {
  try {
    const { to, type, payload = {}, patientId } = await request.json()
    if (!to || !type) return Response.json({ ok: false, error: 'Missing to or type' }, { status: 400 })

    const lang = payload.lang ?? 'fr'
    const builder = SAFE_MESSAGES[type]?.[lang] ?? SAFE_MESSAGES[type]?.['en']

    if (!builder) {
      return Response.json({ ok: false, error: `Unknown or unsafe message type: ${type}` }, { status: 400 })
    }

    const text = builder(payload)

    const result = await sendGated({
      to,
      type,
      text,
      patientId: patientId ?? null,
      country: payload.country ?? null,
      lang,
    })

    return Response.json(result)
  } catch (err) {
    return Response.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

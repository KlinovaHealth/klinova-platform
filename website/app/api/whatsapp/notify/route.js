import { sendText, buildWelcome, buildAppointmentConfirmed, buildConsultationReady } from '@/lib/whatsapp'

export async function POST(request) {
  try {
    const { to, type, payload = {} } = await request.json()
    if (!to || !type) return Response.json({ ok: false }, { status: 400 })

    let text = ''
    const lang = payload.lang ?? 'fr'

    switch (type) {
      case 'welcome':
        text = buildWelcome(payload.name ?? 'there', lang)
        break
      case 'appointment_confirmed':
        text = buildAppointmentConfirmed(
          payload.patientName ?? '',
          payload.doctorName  ?? 'Klinova',
          payload.date        ?? '',
          payload.time        ?? '',
          payload.reason      ?? '',
          lang
        )
        break
      case 'consultation_active':
        text = buildConsultationReady(payload.name ?? 'there', lang)
        break
      default:
        return Response.json({ ok: false, error: 'Unknown type' }, { status: 400 })
    }

    await sendText(to, text)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}

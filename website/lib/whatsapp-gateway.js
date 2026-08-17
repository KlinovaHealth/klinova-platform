// WhatsApp message gateway: consent check + content filter + audit.
// All outbound WhatsApp messages must go through sendGated(), not sendText() directly.

import { sendText } from '@/lib/whatsapp'
import { detectEmergency, buildEmergencyMessage } from '@/lib/emergency'
import { createServiceClient } from '@/lib/supabase-server'

// Content that must NEVER be sent via WhatsApp
const BLOCKED_CONTENT_PATTERNS = [
  /\bdiagnos(is|ed|e)\b/i,
  /\bprescri(ption|bed|be)\b.*\b(mg|ml|dose|tablet|capsule)\b/i,
  /\blab result/i,
  /\btest result/i,
  /\bHIV\b/i,
  /\bherpes\b/i,
  /\bsyphilis\b/i,
  /\bsexual(ly transmitted|ly acquired)\b/i,
  /\bmental health (diagnosis|condition|disorder)\b/i,
  /\bdepression\b.*\bdiagnos/i,
  /\bschizophrenia\b/i,
  /\bsuicid(al|e attempt)\b/i,
  /\bdrug (addiction|abuse|use disorder)\b/i,
  /\babortion\b/i,
  /\bdomestic (violence|abuse)\b/i,
]

function containsBlockedContent(text) {
  return BLOCKED_CONTENT_PATTERNS.some(re => re.test(text))
}

// Allowed outbound message types — maps to consent requirement
const TYPE_CONSENT_MAP = {
  welcome:               'whatsapp_comms',
  appointment_confirmed: 'whatsapp_comms',
  appointment_reminder:  'whatsapp_comms',
  consultation_active:   'whatsapp_comms',
  prescription_ready:    'whatsapp_comms',
  general_notification:  'whatsapp_comms',
  // emergency is always allowed (no consent required)
  emergency:             null,
}

export async function sendGated({
  to,           // phone number
  type,         // one of TYPE_CONSENT_MAP keys
  text,         // pre-built message text
  patientId,    // uuid — for consent check
  country,      // country code for emergency numbers
  lang = 'en',
  skipConsentCheck = false,
}) {
  const supabase = createServiceClient()

  // 1. Emergency detection — always send regardless of consent
  const { isEmergency } = detectEmergency(text)
  if (isEmergency) {
    const emergencyMsg = buildEmergencyMessage(country, lang)
    await sendText(to, emergencyMsg)
    await logOutbound(supabase, { to, type: 'emergency_intercept', patientId, lang, flagged: true })
    return { ok: true, intercepted: true, reason: 'emergency' }
  }

  // 2. Block sensitive content
  if (containsBlockedContent(text)) {
    await logOutbound(supabase, { to, type, patientId, lang, flagged: true, blocked: true })
    return { ok: false, error: 'blocked_content', intercepted: true }
  }

  // 3. Consent check
  const consentType = TYPE_CONSENT_MAP[type]
  if (consentType && patientId && !skipConsentCheck) {
    const { data: hasConsent } = await supabase.rpc('has_active_consent', {
      p_patient_id: patientId,
      p_type: consentType,
    })
    if (!hasConsent) {
      await logOutbound(supabase, { to, type, patientId, lang, flagged: false, blocked: true, reason: 'no_consent' })
      return { ok: false, error: 'no_consent' }
    }
  }

  // 4. Send
  await sendText(to, text)
  await logOutbound(supabase, { to, type, patientId, lang, flagged: false, blocked: false })
  return { ok: true }
}

async function logOutbound(supabase, { to, type, patientId, lang, flagged, blocked, reason }) {
  try {
    await supabase.from('audit_logs').insert({
      user_id:  patientId ?? null,
      action:   'WHATSAPP_OUTBOUND',
      resource: 'whatsapp_gateway',
      metadata: {
        type,
        lang,
        flagged:  flagged  ?? false,
        blocked:  blocked  ?? false,
        reason:   reason   ?? null,
        // Never log the phone number or message content in audit metadata
      },
    })
  } catch {} // audit failure must not break message delivery
}

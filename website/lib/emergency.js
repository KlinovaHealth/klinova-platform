// Emergency phrase detection for WhatsApp triage and consultation intake.
// Any matched phrase triggers human review + escalation message before Klinova responds.

const PHRASES = {
  en: [
    'chest pain', 'heart attack', "can't breathe", 'cannot breathe',
    'difficulty breathing', 'not breathing', 'stopped breathing',
    'unconscious', 'not waking up', 'passed out', 'collapsed',
    'seizure', 'convulsing', 'stroke', 'facial droop',
    'bleeding heavily', 'heavy bleeding', 'blood everywhere',
    'overdose', 'took too many', 'poisoning', 'swallowed',
    'suicide', 'kill myself', 'end my life', 'self harm',
    'choking', 'cant swallow', 'throat closing', 'anaphylaxis',
    'allergic reaction', 'severe pain', 'trauma', 'accident',
    'broken neck', 'spinal injury', 'paralysed', 'paralyzed',
    'newborn not breathing', 'baby not breathing', 'miscarriage bleeding',
  ],
  fr: [
    'douleur thoracique', 'douleur dans la poitrine', 'crise cardiaque',
    "ne peut pas respirer", "du mal à respirer", 'essoufflement grave',
    'arrêt respiratoire', 'ne respire plus',
    'inconscient', 'perte de conscience', 'ne se réveille pas', 'évanoui',
    'convulsion', 'crise épileptique', 'avc', 'accident vasculaire cérébral',
    'saignement abondant', 'hémorragie', 'perd beaucoup de sang',
    'surdosage', 'overdose', 'empoisonnement', 'intoxication', 'avalé',
    'suicide', 'me tuer', 'mettre fin à ma vie', 'automutilation',
    'étouffement', 'gorge qui se ferme', 'choc anaphylactique', 'réaction allergique grave',
    'douleur sévère', 'traumatisme', 'accident grave',
    'nouveau-né ne respire pas', 'bébé ne respire pas', 'fausse couche hémorragique',
  ],
  // Common local-language markers across West Africa
  local: [
    'aidez-moi', 'au secours', 'help me', 'i am dying', 'je meurs',
    'mourir', 'dying',
  ],
}

const EMERGENCY_NUMBERS = {
  TG: ['171 (SAMU)', '117 (Police)', '118 (Pompiers)'],
  GH: ['999', '112'],
  NG: ['112', '199 (FRSC)'],
  BJ: ['13 (SAMU)', '117 (Police)'],
  CI: ['185 (SAMU)', '110 (Police)'],
  BF: ['3-25-33-28 (SAMU)', '17 (Police)'],
  SN: ['15 (SAMU)', '17 (Police)'],
  CM: ['15 (SAMU)', '17 (Police)'],
  GN: ['442 (SAMU)'],
  ML: ['15 (SAMU)'],
  NE: ['15 (SAMU)'],
}

export function detectEmergency(text = '') {
  const lower = text.toLowerCase()
  const matched = Object.values(PHRASES).flat().filter(p => lower.includes(p))
  return { isEmergency: matched.length > 0, matched }
}

export function buildEmergencyMessage(country = null, lang = 'en') {
  const nums = EMERGENCY_NUMBERS[country] ?? ['112']
  const numStr = nums.join(' / ')

  if (lang === 'fr') {
    return [
      '🚨 *URGENCE MÉDICALE DÉTECTÉE*',
      '',
      'Ce message indique une urgence médicale. Klinova est une plateforme de télémédecine — nous ne pouvons pas envoyer des secours.',
      '',
      `📞 *Appelez les secours maintenant : ${numStr}*`,
      '',
      'Rendez-vous immédiatement aux urgences les plus proches ou demandez à quelqu\'un de vous y emmener.',
      '',
      '⚠️ _Ne pas attendre une réponse Klinova en cas d\'urgence réelle._',
    ].join('\n')
  }

  return [
    '🚨 *MEDICAL EMERGENCY DETECTED*',
    '',
    'This message indicates a medical emergency. Klinova is a telemedicine platform — we cannot dispatch emergency care.',
    '',
    `📞 *Call emergency services now: ${numStr}*`,
    '',
    'Go immediately to the nearest emergency hospital, or ask someone to take you there.',
    '',
    '⚠️ _Do not wait for a Klinova response in a real emergency._',
  ].join('\n')
}

export const NOT_EMERGENCY_NOTICE = {
  en: '⚠️ Klinova is not an emergency service. For life-threatening situations, call local emergency services or go to your nearest hospital immediately.',
  fr: '⚠️ Klinova n\'est pas un service d\'urgence. Pour les urgences vitales, appelez les secours locaux ou rendez-vous immédiatement à l\'hôpital le plus proche.',
}

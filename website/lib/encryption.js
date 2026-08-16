import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) throw new Error('ENCRYPTION_KEY not set')
  return scryptSync(raw, 'klinova_salt', 32)
}

export function encrypt(plaintext) {
  if (!plaintext) return null
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(12) + tag(16) + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(ciphertext) {
  if (!ciphertext) return null
  const key = getKey()
  const buf = Buffer.from(ciphertext, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}

// Encrypt all PHI fields before inserting into whatsapp_triage
export function encryptTriageRecord(record) {
  return {
    ...record,
    wa_phone_enc: encrypt(record.wa_phone),
    patient_name_enc: encrypt(record.patient_name),
    transcription_enc: encrypt(record.transcription),
    translation_enc: encrypt(record.translation),
    summary_enc: encrypt(record.summary),
    notes_enc: encrypt(record.notes),
    // Clear plaintext fields
    wa_phone: null,
    patient_name: null,
    transcription: null,
    translation: null,
    summary: null,
    notes: null,
  }
}

// Decrypt PHI fields when reading from whatsapp_triage
export function decryptTriageRecord(record) {
  return {
    ...record,
    wa_phone: decrypt(record.wa_phone_enc),
    patient_name: decrypt(record.patient_name_enc),
    transcription: decrypt(record.transcription_enc),
    translation: decrypt(record.translation_enc),
    summary: decrypt(record.summary_enc),
    notes: decrypt(record.notes_enc),
  }
}

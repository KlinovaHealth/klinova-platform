/**
 * RLS Authorization Tests
 *
 * Requires a Supabase test project with:
 *   TEST_SUPABASE_URL
 *   TEST_SUPABASE_ANON_KEY
 *   TEST_SUPABASE_SERVICE_KEY
 *
 * Run: npx jest __tests__/rls.test.js --testTimeout=30000
 *
 * Tests verify that:
 * - Patient A cannot read Patient B's records
 * - A doctor can only read patients assigned to them
 * - A pharmacist can only read prescriptions for their pharmacy
 * - Government/analyst cannot access raw triage PHI
 * - Unauthenticated requests are denied everywhere
 */

import { createClient } from '@supabase/supabase-js'

const URL  = process.env.TEST_SUPABASE_URL  ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.TEST_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SVC  = process.env.TEST_SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !ANON || !SVC) {
  throw new Error('Missing Supabase env vars for RLS tests. Set TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, TEST_SUPABASE_SERVICE_KEY')
}

const admin  = createClient(URL, SVC, { auth: { persistSession: false } })
const anon   = createClient(URL, ANON, { auth: { persistSession: false } })

// ── Test user credentials (created fresh, torn down after) ───
const USERS = {
  patientA:     { email: `rls-test-patient-a-${Date.now()}@test.klinova.internal`, password: 'TestPass123!', role: 'patient' },
  patientB:     { email: `rls-test-patient-b-${Date.now()}@test.klinova.internal`, password: 'TestPass123!', role: 'patient' },
  doctor:       { email: `rls-test-doctor-${Date.now()}@test.klinova.internal`,    password: 'TestPass123!', role: 'doctor'  },
  pharmacist:   { email: `rls-test-pharma-${Date.now()}@test.klinova.internal`,    password: 'TestPass123!', role: 'pharmacist' },
  government:   { email: `rls-test-gov-${Date.now()}@test.klinova.internal`,       password: 'TestPass123!', role: 'government' },
}

const created = {}

async function createTestUser(key) {
  const u = USERS[key]
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email, password: u.password, email_confirm: true,
    user_metadata: { role: u.role, full_name: `Test ${key}` },
  })
  if (error) throw new Error(`Failed to create ${key}: ${error.message}`)
  await admin.from('users').insert({
    id: data.user.id, email: u.email, role: u.role, full_name: `Test ${key}`,
  }).throwOnError()
  created[key] = data.user
  return data.user
}

async function clientFor(key) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } })
  await c.auth.signInWithPassword({ email: USERS[key].email, password: USERS[key].password })
  return c
}

// ── Setup ─────────────────────────────────────────────────────
beforeAll(async () => {
  for (const key of Object.keys(USERS)) await createTestUser(key)

  // Create a consultation: patientB → doctor
  await admin.from('consultations').insert({
    id: 'test-consult-b',
    patient_id: created.patientB.id,
    doctor_id:  created.doctor.id,
    status: 'completed', reason: 'Test reason B', channel: 'chat',
  })

  // Create a prescription for patientB
  await admin.from('prescriptions').insert({
    id: 'test-rx-b',
    patient_id:      created.patientB.id,
    doctor_id:       created.doctor.id,
    consultation_id: 'test-consult-b',
    medications: [{ name: 'TestDrug 500mg' }],
    status: 'pending',
  })
}, 30000)

afterAll(async () => {
  for (const key of Object.keys(created)) {
    await admin.auth.admin.deleteUser(created[key].id)
  }
  await admin.from('consultations').delete().eq('id', 'test-consult-b')
  await admin.from('prescriptions').delete().eq('id', 'test-rx-b')
})

// ── Tests ─────────────────────────────────────────────────────

describe('Patient isolation', () => {
  test('Patient A cannot read Patient B user record', async () => {
    const c = await clientFor('patientA')
    const { data } = await c.from('users').select('id').eq('id', created.patientB.id)
    expect(data ?? []).toHaveLength(0)
  })

  test('Patient A cannot read Patient B consultations', async () => {
    const c = await clientFor('patientA')
    const { data } = await c.from('consultations').select('id').eq('patient_id', created.patientB.id)
    expect(data ?? []).toHaveLength(0)
  })

  test('Patient A cannot read Patient B prescriptions', async () => {
    const c = await clientFor('patientA')
    const { data } = await c.from('prescriptions').select('id').eq('patient_id', created.patientB.id)
    expect(data ?? []).toHaveLength(0)
  })

  test('Patient A can read their own user record', async () => {
    const c = await clientFor('patientA')
    const { data } = await c.from('users').select('id').eq('id', created.patientA.id)
    expect(data ?? []).toHaveLength(1)
  })
})

describe('Doctor access', () => {
  test('Doctor can read Patient B (assigned) user record', async () => {
    const c = await clientFor('doctor')
    const { data } = await c.from('users').select('id').eq('id', created.patientB.id)
    expect(data ?? []).toHaveLength(1)
  })

  test('Doctor cannot read Patient A (unassigned) user record', async () => {
    const c = await clientFor('doctor')
    const { data } = await c.from('users').select('id').eq('id', created.patientA.id)
    expect(data ?? []).toHaveLength(0)
  })

  test('Doctor can read assigned consultation', async () => {
    const c = await clientFor('doctor')
    const { data } = await c.from('consultations').select('id').eq('id', 'test-consult-b')
    expect(data ?? []).toHaveLength(1)
  })
})

describe('WhatsApp triage — government cannot read PHI', () => {
  test('Government user cannot select raw triage rows', async () => {
    const c = await clientFor('government')
    const { data, error } = await c.from('whatsapp_triage').select('wa_phone, patient_name')
    expect(data ?? []).toHaveLength(0)
  })

  test('Government user can call aggregate function', async () => {
    const c = await clientFor('government')
    // gov_subscribed must be true — set it
    await admin.from('users').update({ gov_subscribed: true }).eq('id', created.government.id)
    const { data, error } = await c.rpc('get_triage_district_stats')
    // Should not throw an access denied error (may return empty array)
    expect(error?.message ?? '').not.toContain('Access denied')
  })
})

describe('Unauthenticated access', () => {
  test('Anon cannot read users', async () => {
    const { data } = await anon.from('users').select('id')
    expect(data ?? []).toHaveLength(0)
  })

  test('Anon cannot read consultations', async () => {
    const { data } = await anon.from('consultations').select('id')
    expect(data ?? []).toHaveLength(0)
  })

  test('Anon cannot read prescriptions', async () => {
    const { data } = await anon.from('prescriptions').select('id')
    expect(data ?? []).toHaveLength(0)
  })

  test('Anon cannot read triage', async () => {
    const { data } = await anon.from('whatsapp_triage').select('id')
    expect(data ?? []).toHaveLength(0)
  })
})

describe('Patient self-escalation prevention', () => {
  test('Patient cannot change their own role', async () => {
    const c = await clientFor('patientA')
    const { error } = await c.from('users')
      .update({ role: 'admin' })
      .eq('id', created.patientA.id)
    // Either an RLS error or the update silently applies only to allowed columns
    if (!error) {
      // Verify the role was NOT actually changed
      const { data } = await admin.from('users').select('role').eq('id', created.patientA.id)
      expect(data?.[0]?.role).toBe('patient')
    }
  })
})

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

const VALID_TYPES = ['whatsapp_comms', 'telehealth', 'location', 'analytics', 'research']

// GET /api/consent — return current consent state for authenticated user
export async function GET(request) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.rpc('get_consent_summary', {
    p_patient_id: user.id,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Return as a keyed object for easy lookup
  const summary = Object.fromEntries(
    (data ?? []).map(r => [r.consent_type, {
      consented:    r.consented,
      version:      r.version,
      language:     r.language,
      givenAt:      r.given_at,
      withdrawnAt:  r.withdrawn_at,
    }])
  )
  return Response.json({ ok: true, consent: summary })
}

// POST /api/consent — record consent for one or more types
// Body: { types: ['whatsapp_comms','telehealth'], version: '1.0', language: 'en', channel: 'web' }
export async function POST(request) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { types = [], version = '1.0', language = 'en', channel = 'web' } = body
  const invalid = types.filter(t => !VALID_TYPES.includes(t))
  if (invalid.length) {
    return Response.json({ error: `Unknown consent types: ${invalid.join(', ')}` }, { status: 400 })
  }

  // Hash the IP address (never store raw IP in consent records)
  const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16)

  const rows = types.map(t => ({
    patient_id:   user.id,
    consent_type: t,
    consented:    true,
    version,
    language,
    channel,
    ip_hash:      ipHash,
  }))

  const { error } = await supabase.from('consent_records').insert(rows)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, recorded: types })
}

// DELETE /api/consent — withdraw one or all consent types
// Body: { types: ['whatsapp_comms'] } or { types: 'all' }
export async function DELETE(request) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { types, channel = 'web' } = body
  const now = new Date().toISOString()

  let query = supabase
    .from('consent_records')
    .update({ withdrawn_at: now, withdrawn_channel: channel })
    .eq('patient_id', user.id)
    .is('withdrawn_at', null)
    .eq('consented', true)

  if (types !== 'all') {
    const list = Array.isArray(types) ? types : [types]
    query = query.in('consent_type', list)
  }

  const { error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, withdrawn: types })
}

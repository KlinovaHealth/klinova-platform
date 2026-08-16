import { createClient } from '@/lib/supabase-server'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  return { user, role: profile?.role, supabase }
}

async function checkFinAccess(supabase, userId, role) {
  if (role === 'owner') return true
  const { data } = await supabase.from('fin_access').select('user_id').eq('user_id', userId).single()
  return !!data
}

// GET — return all data for the finance dashboard
export async function GET(req) {
  const auth = await getAuthedUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, role, supabase } = auth

  const ok = await checkFinAccess(supabase, user.id, role)
  if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { data: entries },
    { data: rates },
    { data: settings },
    { count: consultCount },
    { count: triageCount },
    { count: govSubCount },
    { count: pharmCount },
  ] = await Promise.all([
    supabase.from('fin_entries').select('*').order('entry_date', { ascending: false }),
    supabase.from('fin_rates').select('*').eq('active', true),
    supabase.from('fin_settings').select('*'),
    supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('whatsapp_triage').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('gov_subscribed', true),
    supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'fulfilled'),
  ])

  return Response.json({
    entries:      entries ?? [],
    rates:        rates   ?? [],
    settings:     Object.fromEntries((settings ?? []).map(s => [s.key, s.value])),
    platformCounts: {
      consultations:    consultCount ?? 0,
      whatsapp_triage:  triageCount  ?? 0,
      gov_subscription: govSubCount  ?? 0,
      pharmacy_order:   pharmCount   ?? 0,
    },
  })
}

// POST — add entry, update rate, update setting, manage access
export async function POST(req) {
  const auth = await getAuthedUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, role, supabase } = auth

  const ok = await checkFinAccess(supabase, user.id, role)
  if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { action } = body

  if (action === 'add_entry') {
    const { type, category, description, amount, currency, entry_date, notes } = body
    if (!type || !category || !amount) return Response.json({ error: 'Missing fields' }, { status: 400 })
    const { error } = await supabase.from('fin_entries').insert({
      type, category, description, amount: parseFloat(amount),
      currency: currency || 'XOF', entry_date: entry_date || new Date().toISOString().slice(0,10),
      notes, created_by: user.id,
    })
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ ok: true })
  }

  if (action === 'delete_entry') {
    const { id } = body
    await supabase.from('fin_entries').delete().eq('id', id)
    return Response.json({ ok: true })
  }

  // Owner-only actions below
  if (role !== 'owner') return Response.json({ error: 'Owner only' }, { status: 403 })

  if (action === 'update_rate') {
    const { service, rate } = body
    await supabase.from('fin_rates').upsert({ service, rate: parseFloat(rate), currency: body.currency || 'XOF' }, { onConflict: 'service' })
    return Response.json({ ok: true })
  }

  if (action === 'update_setting') {
    const { key, value } = body
    await supabase.from('fin_settings').upsert({ key, value: String(value) }, { onConflict: 'key' })
    return Response.json({ ok: true })
  }

  if (action === 'grant_access') {
    const { email } = body
    const { data: target } = await supabase.from('users').select('id,full_name,email').eq('email', email).single()
    if (!target) return Response.json({ error: 'User not found' }, { status: 404 })
    await supabase.from('fin_access').upsert({ user_id: target.id }, { onConflict: 'user_id' })
    return Response.json({ ok: true, user: target })
  }

  if (action === 'revoke_access') {
    const { userId } = body
    await supabase.from('fin_access').delete().eq('user_id', userId)
    return Response.json({ ok: true })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}

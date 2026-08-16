import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (!['owner', 'admin'].includes(caller?.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, subscribed } = await req.json()
  if (!userId || typeof subscribed !== 'boolean') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ gov_subscribed: subscribed })
    .eq('id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

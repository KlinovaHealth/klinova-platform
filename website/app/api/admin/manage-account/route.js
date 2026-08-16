import { createClient, createAdminClient } from '@/lib/supabase-server'

// Actions: disable_account, enable_account, change_role, grant_manage_accounts, revoke_manage_accounts, toggle_gov, approve_application, reject_application
export async function POST(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('users').select('role, can_manage_accounts').eq('id', user.id).single()

  const isOwner = caller?.role === 'owner'
  const isAdminWithRights = caller?.role === 'admin' && caller?.can_manage_accounts

  const { action, targetId, value } = await req.json()
  if (!targetId || !action) return Response.json({ error: 'Invalid payload' }, { status: 400 })

  // Owner-only actions
  const ownerOnly = ['change_role', 'grant_manage_accounts', 'revoke_manage_accounts', 'toggle_gov']
  if (ownerOnly.includes(action) && !isOwner) {
    return Response.json({ error: 'Only the owner can perform this action' }, { status: 403 })
  }

  // Account enable/disable + application review: owner OR admin with permission
  if (['disable_account', 'enable_account', 'approve_application', 'reject_application'].includes(action) && !isOwner && !isAdminWithRights) {
    return Response.json({ error: 'You do not have permission to manage accounts' }, { status: 403 })
  }

  const admin = createAdminClient()
  let updateData = {}

  switch (action) {
    case 'disable_account':
      updateData = { account_disabled: true }
      break
    case 'enable_account':
      updateData = { account_disabled: false }
      break
    case 'change_role':
      if (!value) return Response.json({ error: 'Role required' }, { status: 400 })
      updateData = { role: value }
      break
    case 'grant_manage_accounts':
      updateData = { can_manage_accounts: true }
      break
    case 'revoke_manage_accounts':
      updateData = { can_manage_accounts: false }
      break
    case 'toggle_gov':
      updateData = { gov_subscribed: !!value }
      break
    case 'approve_application':
      updateData = { status: 'active' }
      break
    case 'reject_application':
      updateData = { status: 'rejected' }
      break
    default:
      return Response.json({ error: 'Unknown action' }, { status: 400 })
  }

  const { error } = await admin.from('users').update(updateData).eq('id', targetId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { writeAuditLog, getClientInfo, AUDIT_ACTIONS } from '@/lib/audit'

// Only allow requests with the KILLSWITCH_SECRET env var set as Bearer token
function isAuthorized(request) {
  const secret = process.env.KILLSWITCH_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}

// POST /api/admin/killswitch — activate or deactivate
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { activate } = await request.json()
  const admin = createAdminClient()
  const { ipAddress, userAgent } = getClientInfo(request)

  if (activate) {
    // 1. Sign out ALL users
    await admin.auth.admin.signOut('*', 'global')

    // 2. Set killswitch flag
    await admin.from('system_flags')
      .update({ value: true, updated_at: new Date().toISOString() })
      .eq('key', 'killswitch_active')

    await writeAuditLog({
      action: AUDIT_ACTIONS.KILLSWITCH_ACTIVATED,
      ipAddress,
      userAgent,
      metadata: { reason: 'Manual activation via API' },
    })

    return NextResponse.json({ ok: true, status: 'killswitch_active' })
  } else {
    // Deactivate
    await admin.from('system_flags')
      .update({ value: false, updated_at: new Date().toISOString() })
      .eq('key', 'killswitch_active')

    await writeAuditLog({
      action: AUDIT_ACTIONS.KILLSWITCH_DEACTIVATED,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ ok: true, status: 'killswitch_inactive' })
  }
}

// GET /api/admin/killswitch — check current state
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('system_flags')
    .select('value, updated_at')
    .eq('key', 'killswitch_active')
    .single()

  return NextResponse.json({ active: data?.value ?? false, updated_at: data?.updated_at })
}

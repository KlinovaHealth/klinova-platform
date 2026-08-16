import { createAdminClient } from './supabase-server'

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',
  PASSWORD_RESET: 'auth.password_reset',
  SESSION_REVOKED: 'auth.session_revoked',
  USER_CREATED: 'user.created',
  USER_DISABLED: 'user.disabled',
  DATA_EXPORT: 'data.export',
  BULK_READ: 'data.bulk_read',
  KILLSWITCH_ACTIVATED: 'security.killswitch_activated',
  KILLSWITCH_DEACTIVATED: 'security.killswitch_deactivated',
}

export async function writeAuditLog({ userId, action, resource, recordId, ipAddress, userAgent, metadata } = {}) {
  try {
    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      user_id: userId ?? null,
      action,
      resource: resource ?? null,
      record_id: recordId ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
      metadata: metadata ?? null,
    })
  } catch {
    // Audit log failure must never crash the app
  }
}

export function getClientInfo(request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown',
    userAgent: request.headers.get('user-agent') ?? 'unknown',
  }
}

export async function checkKillswitch() {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('system_flags')
      .select('value')
      .eq('key', 'killswitch_active')
      .single()
    return data?.value === true
  } catch {
    return false
  }
}

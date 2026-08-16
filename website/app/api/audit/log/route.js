import { writeAuditLog, getClientInfo } from '@/lib/audit'

export async function POST(request) {
  try {
    const { action, userId, metadata } = await request.json()
    if (!action) return Response.json({ ok: false }, { status: 400 })

    const { ipAddress, userAgent } = getClientInfo(request)
    await writeAuditLog({ action, userId: userId ?? null, ipAddress, userAgent, metadata: metadata ?? null })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')

  const admin = createAdminClient()

  const { data, error, count } = await admin
    .from('users')
    .select('id, full_name, role', { count: 'exact' })

  return NextResponse.json({
    callerId,
    count,
    rows: data,
    error: error ? { message: error.message, code: error.code, hint: error.hint, details: error.details } : null,
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? 'missing',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'missing',
  })
}

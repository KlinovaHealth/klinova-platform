import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10 // 10 years

async function getCallerRole(callerId, admin) {
  const { data } = await admin.from('users').select('role, finance_admin').eq('id', callerId).single()
  return data
}

function isPayrollAuthorized(caller) {
  return ['admin', 'owner'].includes(caller?.role) || caller?.finance_admin === true
}

// GET — return all users (for dropdown) + all earnings records
export async function GET() {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const caller = await getCallerRole(callerId, admin)
  if (!isPayrollAuthorized(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [usersRes, earningsRes] = await Promise.all([
    admin.from('users')
      .select('id, full_name, email, role')
      .neq('role', 'patient')
      .order('full_name'),
    admin.from('earnings')
      .select('id, person_id, period_label, amount, currency, status, payslip_url, paid_at, created_at, users!person_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return NextResponse.json({
    users:    usersRes.data    ?? [],
    earnings: earningsRes.data ?? [],
  })
}

// POST — create a pay record, optionally uploading a payslip file
export async function POST(req) {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const caller = await getCallerRole(callerId, admin)
  if (!isPayrollAuthorized(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let personId, periodLabel, amount, currency, status, payslipUrl

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    personId    = formData.get('person_id')
    periodLabel = formData.get('period_label')
    amount      = parseFloat(formData.get('amount'))
    currency    = formData.get('currency') || 'XOF'
    status      = formData.get('status')   || 'pending'
    payslipUrl  = formData.get('payslip_url') || null

    const file = formData.get('file')
    if (file && file.size > 0) {
      const bytes  = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext    = file.name.split('.').pop()
      const path   = `${personId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      const { data: uploadData, error: uploadError } = await admin.storage
        .from('payslips')
        .upload(path, buffer, { contentType: file.type, upsert: false })

      if (uploadError) {
        return NextResponse.json({ error: 'File upload failed: ' + uploadError.message }, { status: 500 })
      }

      const { data: signedData, error: signedError } = await admin.storage
        .from('payslips')
        .createSignedUrl(uploadData.path, SIGNED_URL_EXPIRY)

      if (signedError) {
        return NextResponse.json({ error: 'Could not sign URL: ' + signedError.message }, { status: 500 })
      }

      payslipUrl = signedData.signedUrl
    }
  } else {
    const body  = await req.json()
    personId    = body.person_id
    periodLabel = body.period_label
    amount      = parseFloat(body.amount)
    currency    = body.currency    || 'XOF'
    status      = body.status      || 'pending'
    payslipUrl  = body.payslip_url || null
  }

  if (!personId || !periodLabel || isNaN(amount)) {
    return NextResponse.json({ error: 'person_id, period_label, and amount are required.' }, { status: 400 })
  }

  const record = {
    person_id:    personId,
    period_label: periodLabel,
    amount,
    currency,
    status,
    payslip_url:  payslipUrl,
    paid_at:      status === 'paid' ? new Date().toISOString() : null,
  }

  const { data, error } = await admin.from('earnings').insert(record).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ record: data })
}

// DELETE — remove a pay record
export async function DELETE(req) {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const caller = await getCallerRole(callerId, admin)
  if (!isPayrollAuthorized(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await admin.from('earnings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

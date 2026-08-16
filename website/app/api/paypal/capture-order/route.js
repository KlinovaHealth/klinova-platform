import { createAdminClient } from '@/lib/supabase-server'

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const json = await res.json()
  return json.access_token
}

// POST /api/paypal/capture-order
// body: { orderID, userId, plan }
export async function POST(req) {
  try {
    const { orderID, userId, plan } = await req.json()
    if (!orderID) return Response.json({ error: 'Missing orderID' }, { status: 400 })

    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    const capture = await res.json()
    if (!res.ok || capture.status !== 'COMPLETED') {
      return Response.json({ error: capture.message ?? 'Capture failed' }, { status: 400 })
    }

    // Record payment
    if (userId) {
      const supabase = createAdminClient()
      await supabase.from('payments').insert({
        user_id:    userId,
        provider:   'paypal',
        order_id:   orderID,
        plan,
        amount:     parseFloat(capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? 0),
        currency:   capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ?? 'USD',
        status:     'completed',
      })
    }

    return Response.json({ status: 'COMPLETED' })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

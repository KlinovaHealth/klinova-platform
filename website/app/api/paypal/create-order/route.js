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

// POST /api/paypal/create-order
// body: { plan: 'solo'|'family', currency: 'USD', amount: '2.50' }
export async function POST(req) {
  try {
    const { plan, currency = 'USD', amount } = await req.json()
    if (!amount || !plan) return Response.json({ error: 'Missing plan or amount' }, { status: 400 })

    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: amount },
          description: `Klinova Care Plan — ${plan === 'family' ? 'Family' : 'Solo'}`,
        }],
        application_context: {
          brand_name: 'Klinova',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
        },
      }),
    })
    const order = await res.json()
    if (!res.ok) return Response.json({ error: order.message ?? 'PayPal error' }, { status: 400 })
    return Response.json({ id: order.id })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

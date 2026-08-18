import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Returns { user, token } — token is null when cookie auth is used
async function getAuthContext(request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (token) {
    const sc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    )
    const { data: { user } } = await sc.auth.getUser(token)
    if (user) return { user, token }
  }
  const cookieStore = await cookies()
  const sc = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await sc.auth.getUser()
  return { user: user ?? null, token: null }
}

// Authenticated client using the user's own JWT — respects RLS policies
function makeAuthClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    token
      ? { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
      : { auth: { persistSession: false } }
  )
}

function gridSnap(val, step = 0.09) {
  return Math.round(val / step) * step
}

const URGENCY_STYLE = {
  emergency: { id: 'emergency', color: 'ff0000ff', scale: 1.3 },
  high:      { id: 'high',      color: 'ff0080ff', scale: 1.1 },
  medium:    { id: 'medium',    color: 'ff00a5ff', scale: 1.0 },
  low:       { id: 'low',       color: 'ff00ff00', scale: 0.9 },
  unknown:   { id: 'unknown',   color: 'ff888888', scale: 0.8 },
}

function buildStyles() {
  return Object.values(URGENCY_STYLE).map(s => `
  <Style id="${s.id}">
    <IconStyle>
      <color>${s.color}</color>
      <scale>${s.scale}</scale>
      <Icon><href>https://maps.google.com/mapfiles/kml/paddle/wht-circle.png</href></Icon>
    </IconStyle>
    <LabelStyle><scale>0.7</scale></LabelStyle>
  </Style>`).join('\n')
}

function buildPlacemark(row, idx) {
  const lat = gridSnap(row.location_lat)
  const lng = gridSnap(row.location_lng)
  const urgency = (row.urgency || 'unknown').toLowerCase()
  const styleId = URGENCY_STYLE[urgency]?.id ?? 'unknown'
  const date = new Date(row.created_at).toISOString().slice(0, 10)
  const lang = (row.language || 'unknown').toUpperCase()
  const country = (row.country || 'unknown').toUpperCase()
  const category = row.intent || 'general'

  return `  <Placemark id="t${idx}">
    <styleUrl>#${styleId}</styleUrl>
    <name>${country} · ${urgency.toUpperCase()}</name>
    <description><![CDATA[
      <b>Date:</b> ${date}<br/>
      <b>Urgency:</b> ${urgency}<br/>
      <b>Category:</b> ${category}<br/>
      <b>Language:</b> ${lang}<br/>
      <b>Country:</b> ${country}
    ]]></description>
    <TimeStamp><when>${date}</when></TimeStamp>
    <Point><coordinates>${lng},${lat},0</coordinates></Point>
  </Placemark>`
}

function buildKML(rows, generatedAt, filters) {
  const placemarks = rows.map((r, i) => buildPlacemark(r, i)).join('\n')
  const filterNote = [
    filters.country ? `Country: ${filters.country.toUpperCase()}` : null,
    filters.urgency ? `Urgency: ${filters.urgency}` : null,
    filters.from    ? `From: ${filters.from}` : null,
    filters.to      ? `To: ${filters.to}` : null,
  ].filter(Boolean).join(' | ') || 'All records'

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Klinova Health Signals — ${generatedAt.slice(0, 10)}</name>
  <description><![CDATA[
    <b>Klinova pseudonymised triage export</b><br/>
    Generated: ${generatedAt}<br/>
    Records: ${rows.length}<br/>
    Filters: ${filterNote}<br/>
    <br/>
    <i>Coordinates snapped to ~10 km grid. No personal data included.</i>
  ]]></description>
${buildStyles()}
${placemarks}
</Document>
</kml>`
}

export async function GET(request) {
  try {
  const { user, token } = await getAuthContext(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — no valid session' }, { status: 401 })
  }

  // Use authenticated client (user's JWT) — works with the RLS policy for owner/admin/government
  const authClient = makeAuthClient(token)

  const { data: profile, error: profileErr } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr) {
    return NextResponse.json({ error: `Profile lookup failed: ${profileErr.message}` }, { status: 500 })
  }

  if (!profile || !['government', 'admin', 'owner'].includes(profile.role)) {
    return NextResponse.json({ error: `Forbidden — role is "${profile?.role}"` }, { status: 403 })
  }

  // Query params
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') || null
  const urgency = searchParams.get('urgency') || null
  const from    = searchParams.get('from')    || null
  const to      = searchParams.get('to')      || null

  let query = authClient
    .from('whatsapp_triage')
    .select('created_at, urgency, language, country, intent, location_lat, location_lng')
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (country) query = query.eq('country', country.toLowerCase())
  if (urgency) query = query.eq('urgency', urgency.toLowerCase())
  if (from)    query = query.gte('created_at', from)
  if (to)      query = query.lte('created_at', to + 'T23:59:59Z')

  const { data: rows, error: dbErr } = await query
  if (dbErr) {
    return NextResponse.json({ error: `DB error: ${dbErr.message}` }, { status: 500 })
  }

  const kml = buildKML(rows ?? [], new Date().toISOString(), { country, urgency, from, to })
  const filename = `klinova-health-${new Date().toISOString().slice(0, 10)}.kml`

  return new Response(kml, {
    headers: {
      'Content-Type': 'application/vnd.google-earth.kml+xml',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
  } catch (err) {
    return NextResponse.json({ error: `Unexpected error: ${err?.message ?? err}` }, { status: 500 })
  }
}

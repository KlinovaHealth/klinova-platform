import { createClient, createAdminClient } from '@/lib/supabase-server'

const WHO_RSS    = 'https://www.who.int/feeds/entity/csr/don/en/rss.xml'
const OPENAI_KEY = process.env.OPENAI_API_KEY
const ARCGIS_KEY = process.env.ARCGIS_API_KEY

// GET — return cached outbreaks + published advisories
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const [obRes, advRes, latestRes] = await Promise.all([
    admin.from('health_outbreaks')
      .select('*').eq('active', true)
      .order('detected_at', { ascending: false }).limit(25),
    admin.from('health_advisories')
      .select('*').in('status', ['published', 'draft'])
      .order('created_at', { ascending: false }).limit(10),
    admin.from('health_outbreaks')
      .select('updated_at').order('updated_at', { ascending: false }).limit(1).single(),
  ])

  const staleMs = 3_600_000 // 1 hour
  const isStale = !latestRes.data ||
    Date.now() - new Date(latestRes.data.updated_at).getTime() > staleMs

  // Trigger background refresh if stale (don't await)
  if (isStale) refreshOutbreaks(admin).catch(console.error)

  return Response.json({
    outbreaks:  obRes.data  ?? [],
    advisories: advRes.data ?? [],
    stale: isStale,
  })
}

// POST — owner/admin force-refresh + generate advisories
export async function POST(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['owner', 'admin'].includes(caller?.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { action, advisoryId, status, editedTitle, editedBodyEn, editedBodyFr } = await req.json()

  // Publish / archive advisory
  if (action === 'update_advisory' && advisoryId) {
    const update = { status }
    if (editedTitle)   update.title   = editedTitle
    if (editedBodyEn)  update.body_en = editedBodyEn
    if (editedBodyFr)  update.body_fr = editedBodyFr
    if (status === 'published') {
      update.published_by = user.id
      update.published_at = new Date().toISOString()
    }
    await admin.from('health_advisories').update(update).eq('id', advisoryId)
    return Response.json({ ok: true })
  }

  // Force refresh
  await refreshOutbreaks(admin)
  return Response.json({ ok: true })
}

// ─────────────────────────────────────────────────────────────────────────────

async function refreshOutbreaks(admin) {
  const items = await fetchWHO()
  if (!items.length) return

  for (const item of items.slice(0, 20)) {
    const { disease, country } = parseTitle(item.title)
    if (!disease) continue

    const geo = country ? await geocode(country) : null

    await admin.from('health_outbreaks').upsert({
      source:        'WHO',
      source_url:    item.link || `who-${Date.now()}-${Math.random()}`,
      disease,
      location_name: country || item.title,
      location_lat:  geo?.lat ?? null,
      location_lng:  geo?.lng ?? null,
      severity:      severity(item.title, item.description),
      summary:       item.description?.slice(0, 600) ?? null,
      detected_at:   item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      active:        true,
    }, { onConflict: 'source_url', ignoreDuplicates: false })
  }

  if (OPENAI_KEY) await generateAdvisories(admin)
}

async function fetchWHO() {
  try {
    const res = await fetch(WHO_RSS, {
      headers: { 'User-Agent': 'Klinova-Health/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    const xml = await res.text()
    return parseRSS(xml)
  } catch {
    // Fallback: ReliefWeb epidemics
    try {
      const res = await fetch(
        'https://api.reliefweb.int/v1/disasters?appname=klinova&profile=full&limit=20' +
        '&filter[field]=type.code&filter[value]=EP&sort[]=date:desc',
        { signal: AbortSignal.timeout(8000) }
      )
      const json = await res.json()
      return (json.data ?? []).map(d => ({
        title:       d.fields?.name ?? '',
        description: (d.fields?.description ?? '').slice(0, 600),
        link:        d.fields?.url ?? '',
        date:        d.fields?.date?.created ?? '',
      }))
    } catch { return [] }
  }
}

function parseRSS(xml) {
  const items = []
  for (const [, block] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const get = (tag) =>
      block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))?.[1]?.trim() ?? ''
    const title = get('title')
    const desc  = get('description').replace(/<[^>]*>/g, '').slice(0, 600)
    const link  = get('link')
    const date  = get('pubDate')
    if (title) items.push({ title, description: desc, link, date })
  }
  return items
}

function parseTitle(title) {
  const m = title.match(/^([^–\-]+)\s*[–\-]\s*(.+)$/)
  if (m) return { disease: m[1].trim(), country: m[2].trim() }
  return { disease: title.trim(), country: null }
}

function severity(title, desc = '') {
  const t = (title + ' ' + desc).toLowerCase()
  if (/ebola|marburg|haemorrhagic|hemorrhagic|plague/.test(t)) return 'critical'
  if (/outbreak|emergency|surge|spreading|epidemic/.test(t))   return 'warning'
  return 'info'
}

async function geocode(place) {
  if (!ARCGIS_KEY) return null
  try {
    const p = new URLSearchParams({
      SingleLine: place, f: 'json', token: ARCGIS_KEY,
      maxLocations: '1', category: 'Country,Region,City',
    })
    const res = await fetch(
      `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${p}`,
      { signal: AbortSignal.timeout(5000) }
    )
    const json = await res.json()
    const c = json.candidates?.[0]
    return c ? { lat: c.location.y, lng: c.location.x } : null
  } catch { return null }
}

async function generateAdvisories(admin) {
  // Find outbreaks without a recent advisory
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { data: recent } = await admin
    .from('health_advisories').select('outbreak_id').gte('created_at', cutoff)
  const skip = new Set((recent ?? []).map(r => r.outbreak_id))

  const { data: outbreaks } = await admin
    .from('health_outbreaks')
    .select('*').eq('active', true)
    .order('detected_at', { ascending: false }).limit(5)

  const toProcess = (outbreaks ?? []).filter(o => !skip.has(o.id))

  for (const ob of toProcess.slice(0, 3)) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are Klinova's public health AI for West Africa (Togo, Ghana, Nigeria, Benin, Côte d'Ivoire).
Generate a short, practical health advisory for healthcare workers, government officials, and patients.
Return JSON only:
{
  "title": "max 10 words",
  "body_en": "2-3 sentences with concrete actions healthcare workers and patients should take",
  "body_fr": "same in French",
  "body_local": "same in Ewe (Togolese language)",
  "severity": "info|warning|critical",
  "west_africa_relevant": true or false
}`,
            },
            {
              role: 'user',
              content: `Outbreak: ${ob.disease} in ${ob.location_name}.\nSummary: ${ob.summary ?? 'No details.'}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      })
      const gpt = await res.json()
      const adv = JSON.parse(gpt.choices[0].message.content)

      await admin.from('health_advisories').insert({
        outbreak_id: ob.id,
        title:       adv.title,
        body_en:     adv.body_en,
        body_fr:     adv.body_fr,
        body_local:  adv.body_local,
        severity:    adv.severity ?? ob.severity,
        status:      'draft',
      })
    } catch (e) { console.error('Advisory gen error:', e) }
  }
}

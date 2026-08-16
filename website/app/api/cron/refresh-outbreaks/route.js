import { createAdminClient } from '@/lib/supabase-server'

const WHO_RSS    = 'https://www.who.int/feeds/entity/csr/don/en/rss.xml'
const OPENAI_KEY = process.env.OPENAI_API_KEY

export async function GET(req) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const admin = createAdminClient()

  // Fetch WHO RSS
  let items = []
  try {
    const res = await fetch(WHO_RSS, { headers: { 'User-Agent': 'Klinova/1.0' }, signal: AbortSignal.timeout(8000) })
    const xml = await res.text()
    for (const [, block] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const get = (tag) => block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))?.[1]?.trim() ?? ''
      const title = get('title'); const link = get('link'); const date = get('pubDate')
      const desc = get('description').replace(/<[^>]*>/g, '').slice(0, 600)
      if (title) items.push({ title, description: desc, link, date })
    }
  } catch {
    // ReliefWeb fallback
    try {
      const res = await fetch('https://api.reliefweb.int/v1/disasters?appname=klinova&profile=full&limit=15&filter[field]=type.code&filter[value]=EP&sort[]=date:desc', { signal: AbortSignal.timeout(8000) })
      const json = await res.json()
      items = (json.data ?? []).map(d => ({ title: d.fields?.name ?? '', description: (d.fields?.description ?? '').slice(0,600), link: d.fields?.url ?? '', date: d.fields?.date?.created ?? '' }))
    } catch { return Response.json({ ok: false, error: 'All sources failed' }) }
  }

  let saved = 0
  for (const item of items.slice(0, 20)) {
    const m = item.title.match(/^([^–\-]+)\s*[–\-]\s*(.+)$/)
    const disease = (m ? m[1] : item.title).trim()
    const country = m ? m[2].trim() : null
    if (!disease) continue

    let lat = null, lng = null
    if (country) {
      try {
        const p = new URLSearchParams({ q: country, format: 'json', limit: '1' })
        const g = await fetch(`https://nominatim.openstreetmap.org/search?${p}`, {
          headers: { 'User-Agent': 'Klinova/1.0 (contact@klinova.co)' },
          signal: AbortSignal.timeout(5000),
        })
        const gj = await g.json()
        if (gj[0]) { lat = parseFloat(gj[0].lat); lng = parseFloat(gj[0].lon) }
      } catch {}
    }

    const t = (item.title + ' ' + item.description).toLowerCase()
    const severity = /ebola|marburg|haemorrhagic|plague/.test(t) ? 'critical'
      : /outbreak|emergency|surge|epidemic/.test(t) ? 'warning' : 'info'

    const { error } = await admin.from('health_outbreaks').upsert({
      source: 'WHO', source_url: item.link || `who-cron-${Date.now()}-${Math.random()}`,
      disease, location_name: country || item.title,
      location_lat: lat, location_lng: lng, severity,
      summary: item.description?.slice(0, 600) ?? null,
      detected_at: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(), active: true,
    }, { onConflict: 'source_url', ignoreDuplicates: false })
    if (!error) saved++
  }

  // GPT-4 advisory generation for new outbreaks
  if (OPENAI_KEY) {
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const { data: recent } = await admin.from('health_advisories').select('outbreak_id').gte('created_at', cutoff)
    const skip = new Set((recent ?? []).map(r => r.outbreak_id))
    const { data: obs } = await admin.from('health_outbreaks').select('*').eq('active', true).order('detected_at', { ascending: false }).limit(5)
    for (const ob of (obs ?? []).filter(o => !skip.has(o.id)).slice(0, 3)) {
      try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: `You are Klinova's public health AI for West Africa. Generate a short advisory. Return JSON: {"title":"max 10 words","body_en":"2-3 sentences with concrete actions","body_fr":"same in French","body_local":"same in Ewe","severity":"info|warning|critical"}` },
              { role: 'user', content: `Outbreak: ${ob.disease} in ${ob.location_name}. Summary: ${ob.summary ?? 'No details.'}` },
            ],
            response_format: { type: 'json_object' },
          }),
        })
        const gpt = await r.json()
        const adv = JSON.parse(gpt.choices[0].message.content)
        await admin.from('health_advisories').insert({ outbreak_id: ob.id, title: adv.title, body_en: adv.body_en, body_fr: adv.body_fr, body_local: adv.body_local, severity: adv.severity ?? ob.severity, status: 'draft' })
      } catch {}
    }
  }

  return Response.json({ ok: true, saved, total: items.length, ran: new Date().toISOString() })
}

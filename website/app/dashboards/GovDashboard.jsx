'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'

const DATA_STATEMENT = `KLINOVA HEALTH PLATFORM
Data Use & Privacy Statement
Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERVIEW
This dashboard provides anonymised, aggregate health data collected via Klinova's telemedicine
platform and WhatsApp triage pipeline across West Africa. Data is updated in real time.
Patient records are never exposed.

DATA COLLECTION
• Consultations are conducted via the Klinova mobile app and WhatsApp triage system
• Patient-level data is pseudonymised at point of collection
• Location data is generalised to district or region level — never precise addresses
• Language preference and symptom category are collected to improve triage accuracy

DATA VISIBLE IN THIS DASHBOARD
• Aggregate consultation counts (total, by urgency, by language)
• Anonymous symptom cluster maps (no identifying information)
• WHO Disease Outbreak News (publicly available source)
• AI-generated public health advisories reviewed by Klinova administrators

DATA NOT VISIBLE
• Patient names, phone numbers, or contact details
• Individual medical histories or diagnoses
• Exact GPS coordinates of patients
• Any information that would allow re-identification of a patient

ACCESS CONTROL
• This dashboard is accessible only to verified government-role accounts
• Access is granted by Klinova platform administrators
• All access events are logged

LEGAL BASIS
Data processing is conducted in accordance with applicable data protection legislation and
WHO guidelines on public health data sharing.

For data governance enquiries: contact@klinova.co
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Klinova Health · klinova.co · West Africa`

function downloadStatement() {
  const blob = new Blob([DATA_STATEMENT], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: 'Klinova-Data-Statement.txt',
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const KlinovaMapSection    = dynamic(() => import('./KlinovaMapSection'), { ssr: false })
const OutbreakAlertSection = dynamic(() => import('./OutbreakAlertSection'), { ssr: false })

const C = '#0A5440'

const URGENCY_COLORS = {
  low:       '#2ECC71',
  medium:    '#F1C40F',
  high:      '#E74C3C',
  emergency: '#9B59B6',
}

export default function GovDashboard() {
  const supabase = createClient()

  const { data: consultCount = 0 } = useSWR('gov-consult-count', async () => {
    const { count } = await supabase
      .from('consultations').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: triageCount = 0 } = useSWR('gov-triage-count', async () => {
    const { count } = await supabase
      .from('whatsapp_triage').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: urgencyRows = [] } = useSWR('gov-urgency', async () => {
    const { data } = await supabase
      .from('whatsapp_triage')
      .select('urgency')
    const counts = {}
    ;(data ?? []).forEach(r => {
      counts[r.urgency] = (counts[r.urgency] ?? 0) + 1
    })
    const order = ['emergency', 'high', 'medium', 'low']
    return order
      .filter(u => counts[u])
      .map(u => ({ urgency: u, count: counts[u] }))
  }, { refreshInterval: 30000 })

  const total = urgencyRows.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">
          Government Health Dashboard
        </h2>
        <p className="text-sm text-ink/60 mt-0.5">
          Real-time health intelligence — West Africa · Klinova&apos;s Invisible Grid
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GovStat label="Total consultations" value={consultCount} />
        <GovStat label="WhatsApp triage cases" value={triageCount} />
        <GovStat label="Languages supported" value={14} />
        <GovStat label="Partner clinics" value="—" />
      </div>

      <OutbreakAlertSection userRole="government" />

      <KlinovaMapSection />

      {urgencyRows.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Triage Urgency Breakdown</h3>
          <div className="space-y-3">
            {urgencyRows.map(({ urgency, count }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const color = URGENCY_COLORS[urgency] ?? C
              return (
                <div key={urgency} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-ink/60 capitalize shrink-0">{urgency}</span>
                  <div className="flex-1 bg-[#EDE4D2] rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-sm text-ink/70 w-20 text-right shrink-0">
                    {count} · {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <AboutSection />
    </div>
  )
}

function AboutSection() {
  const [open, setOpen] = useState(false)
  return (
    <section className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-ivory/50 transition-colors">
        <div>
          <h3 className="font-semibold text-ink">About this dashboard</h3>
          <p className="text-xs text-ink/40 mt-0.5">
            Data transparency · privacy statement · language coverage
          </p>
        </div>
        <span className="text-ink/30 text-sm shrink-0 ml-4">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <p className="text-sm text-ink/60 leading-relaxed">
            This dashboard provides anonymised, aggregate health data collected via Klinova&apos;s
            telemedicine platform and WhatsApp triage pipeline across West Africa.
            Data is updated in real time. Patient records are never exposed.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-[#F0F8F4] border border-[#C3E0D0] p-3">
              <p className="font-semibold text-[#0A5440] mb-1.5">What you can see</p>
              <ul className="space-y-1 text-ink/60">
                <li>✓ Aggregate consultation counts</li>
                <li>✓ Anonymous symptom cluster maps</li>
                <li>✓ WHO Disease Outbreak News</li>
                <li>✓ AI-generated public health advisories</li>
                <li>✓ Urgency breakdowns by region</li>
              </ul>
            </div>
            <div className="rounded-lg bg-[#FDF5F5] border border-[#F0C0C0] p-3">
              <p className="font-semibold text-red-700 mb-1.5">What is never exposed</p>
              <ul className="space-y-1 text-ink/60">
                <li>✗ Patient names or contact details</li>
                <li>✗ Individual medical histories</li>
                <li>✗ Exact GPS coordinates</li>
                <li>✗ Any re-identifiable information</li>
              </ul>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">
              14 Languages supported
            </p>
            <div className="flex flex-wrap gap-2">
              {['Ewe','Twi','Kabye','Yoruba','Igbo','Pidgin','French','English',
                'Hausa','Wolof','Bambara','Fon','Dagbani','Tamasheq'].map(lang => (
                <span key={lang}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#E3EFE8] text-[#0A5440]">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border">
            <p className="text-xs text-ink/40">
              Processed under applicable data protection law &amp; WHO public health data guidelines.
              Enquiries: <span className="text-ink/60">contact@klinova.co</span>
            </p>
            <button
              onClick={downloadStatement}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0A5440] hover:opacity-90 shrink-0 self-start sm:self-auto">
              📄 Download Data Statement
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function GovStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-4">
      <p className="text-2xl font-bold text-[#0A5440]">{value}</p>
      <p className="text-xs text-ink/50 mt-1 leading-tight">{label}</p>
    </div>
  )
}

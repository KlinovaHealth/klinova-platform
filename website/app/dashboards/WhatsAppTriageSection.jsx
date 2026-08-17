'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'

const URGENCY_STYLE = {
  low:       { bg: '#E3EFE8', color: '#0E6B4F', label: 'Low'       },
  medium:    { bg: '#F4E2BC', color: '#D99A2B', label: 'Medium'    },
  high:      { bg: '#FBEEE8', color: '#CF5A3C', label: 'High'      },
  emergency: { bg: '#FDE8E8', color: '#B91C1C', label: 'Emergency' },
}

const STATUS_STYLE = {
  new:               { bg: '#E3EFE8', color: '#0E6B4F' },
  awaiting_location: { bg: '#F4E2BC', color: '#D99A2B' },
  location_received: { bg: '#EDE4D2', color: '#6E7F76' },
  assigned:          { bg: '#E3EFE8', color: '#0A5440' },
  resolved:          { bg: '#F5EFE3', color: '#15302A' },
}

export default function WhatsAppTriageSection({ doctorId }) {
  const [selected, setSelected] = useState(null)

  const { data: cases = [], mutate } = useSWR('wa-triage', async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('whatsapp_triage')
      .select('*')
      .in('status', ['new', 'awaiting_location', 'location_received'])
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  }, { refreshInterval: 15000 })

  async function markResolved(id) {
    const supabase = createClient()
    await supabase.from('whatsapp_triage')
      .update({ status: 'resolved', doctor_id: doctorId })
      .eq('id', id)
    setSelected(null)
    mutate()
  }

  async function markAssigned(id) {
    const supabase = createClient()
    await supabase.from('whatsapp_triage')
      .update({ status: 'assigned', doctor_id: doctorId })
      .eq('id', id)
    mutate()
  }

  return (
    <section id="triage" style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#25D366' }} />
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#15302A', margin: 0 }}>
          WhatsApp Triage
        </h3>
        {cases.length > 0 && (
          <span style={{ background: '#CF5A3C', color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
            {cases.length}
          </span>
        )}
      </div>

      {cases.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D0', padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#15302A60', margin: 0 }}>No active WhatsApp triage cases.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 12 }}>
          {/* Case list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cases.map(c => {
              const urg = URGENCY_STYLE[c.urgency] ?? URGENCY_STYLE.medium
              const sta = STATUS_STYLE[c.status]  ?? STATUS_STYLE.new
              const isSelected = selected?.id === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => setSelected(isSelected ? null : c)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: `1px solid ${isSelected ? '#0A5440' : '#E8E0D0'}`,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px #0A544030' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#15302A' }}>
                        {c.patient_name || c.wa_phone}
                      </div>
                      <div style={{ fontSize: 11, color: '#15302A60', marginTop: 1 }}>
                        {c.language} · {new Date(c.created_at).toLocaleTimeString('fr-TG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ background: urg.bg, color: urg.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                        {urg.label}
                      </span>
                      <span style={{ background: sta.bg, color: sta.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0A5440', marginBottom: 4 }}>
                    {c.intent}
                  </div>
                  <div style={{ fontSize: 12, color: '#15302A80', lineHeight: 1.5 }}>
                    {c.summary || c.translation}
                  </div>

                  {c.location_lat && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#0E6B4F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      Location received · {c.location_lat.toFixed(4)}, {c.location_lng.toFixed(4)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #0A5440', padding: '20px 20px', position: 'sticky', top: 16, alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontWeight: 700, fontSize: 15, color: '#15302A', margin: 0 }}>Case Detail</h4>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15302A60', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 2l12 12M14 2L2 14"/>
                  </svg>
                </button>
              </div>

              <DetailRow label="Patient"      value={selected.patient_name || selected.wa_phone} />
              <DetailRow label="Phone"        value={selected.wa_phone} />
              <DetailRow label="Language"     value={selected.language} />
              <DetailRow label="Intent"       value={selected.intent} />
              <DetailRow label="Urgency"      value={selected.urgency?.toUpperCase()} />

              {selected.transcription && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#15302A60', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original ({selected.language})</div>
                  <div style={{ fontSize: 13, color: '#15302A', background: '#F5EFE3', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 }}>
                    {selected.transcription}
                  </div>
                </div>
              )}

              {selected.translation && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#15302A60', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>English Translation</div>
                  <div style={{ fontSize: 13, color: '#15302A', background: '#F5EFE3', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 }}>
                    {selected.translation}
                  </div>
                </div>
              )}

              {selected.location_lat && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#0E6B4F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  {selected.location_lat.toFixed(5)}, {selected.location_lng.toFixed(5)}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => markAssigned(selected.id)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#0A5440', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Assign to Me
                </button>
                <button
                  onClick={() => markResolved(selected.id)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #E8E0D0', background: '#fff', color: '#15302A80', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
      <span style={{ width: 80, color: '#15302A60', flexShrink: 0, fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#15302A' }}>{value}</span>
    </div>
  )
}

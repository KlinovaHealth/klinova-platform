'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Alert } from './PatientDashboard'

const C = '#0A5440'

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']

function isoDate(d) { return d.toISOString().slice(0, 10) }

export default function AppointmentsSection({ doctorId, clinicMode = false }) {
  const supabase = createClient()
  const { t, lang } = useLanguage()

  const DAYS   = lang === 'fr' ? DAYS_FR   : DAYS_EN
  const MONTHS = lang === 'fr' ? MONTHS_FR : MONTHS_EN

  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(isoDate(today))
  const [form, setForm] = useState({ patientName: '', patientPhone: '', reason: '', time: '09:00', notes: '' })
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr]     = useState('')
  const [saveOk, setSaveOk]       = useState(false)
  const [editId, setEditId]       = useState(null)

  // Fetch appointments for this doctor
  const { data: appts = [], mutate } = useSWR(
    `appointments-${doctorId}-${cursor.year}-${cursor.month}`,
    async () => {
      const from = new Date(cursor.year, cursor.month, 1).toISOString()
      const to   = new Date(cursor.year, cursor.month + 1, 0, 23, 59, 59).toISOString()
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('scheduled_at', from)
        .lte('scheduled_at', to)
        .order('scheduled_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 30000 }
  )

  // Build calendar grid
  const calDays = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1)
    const last  = new Date(cursor.year, cursor.month + 1, 0)
    const cells = []
    for (let i = 0; i < first.getDay(); i++) cells.push(null)
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(cursor.year, cursor.month, d))
    return cells
  }, [cursor])

  const apptsByDate = useMemo(() => {
    const map = {}
    appts.forEach(a => {
      const d = a.scheduled_at?.slice(0, 10)
      if (d) (map[d] = map[d] ?? []).push(a)
    })
    return map
  }, [appts])

  const dayAppts = apptsByDate[selected] ?? []

  function prevMonth() {
    setCursor(c => {
      const m = c.month === 0 ? 11 : c.month - 1
      const y = c.month === 0 ? c.year - 1 : c.year
      return { year: y, month: m }
    })
  }
  function nextMonth() {
    setCursor(c => {
      const m = c.month === 11 ? 0 : c.month + 1
      const y = c.month === 11 ? c.year + 1 : c.year
      return { year: y, month: m }
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setSaveErr(''); setSaveOk(false)
    const scheduled_at = new Date(`${selected}T${form.time}:00`).toISOString()
    const payload = {
      doctor_id:     doctorId,
      patient_name:  form.patientName.trim(),
      patient_phone: form.patientPhone.trim() || null,
      reason:        form.reason.trim(),
      notes:         form.notes.trim() || null,
      scheduled_at,
      status: 'scheduled',
    }
    const { error } = editId
      ? await supabase.from('appointments').update(payload).eq('id', editId)
      : await supabase.from('appointments').insert(payload)
    if (error) {
      setSaveErr(error.message)
    } else {
      setSaveOk(true)
      setForm({ patientName: '', patientPhone: '', reason: '', time: '09:00', notes: '' })
      setEditId(null)
      mutate()
    }
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    mutate()
  }

  function startEdit(a) {
    const d = new Date(a.scheduled_at)
    setSelected(isoDate(d))
    setForm({
      patientName:  a.patient_name ?? '',
      patientPhone: a.patient_phone ?? '',
      reason:       a.reason ?? '',
      time:         d.toTimeString().slice(0, 5),
      notes:        a.notes ?? '',
    })
    setEditId(a.id)
  }

  const inp = `w-full px-3 py-2.5 rounded-lg border border-[#E5DDD0] bg-[#FAFAF7] text-[#0E1A15] text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5440]/30`

  return (
    <section id="appointments" className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E5DDD0] shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div style={{ background: C }} className="flex items-center justify-between px-5 py-3">
          <button onClick={prevMonth} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>‹</button>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
            {MONTHS[cursor.month]} {cursor.year}
          </span>
          <button onClick={nextMonth} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F0EAE0' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#999', padding: '6px 0', letterSpacing: '.04em' }}>{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calDays.map((d, i) => {
            if (!d) return <div key={`e${i}`} style={{ minHeight: 48, borderRight: '1px solid #F8F4EE', borderBottom: '1px solid #F8F4EE' }} />
            const ds      = isoDate(d)
            const isToday = ds === isoDate(today)
            const isSel   = ds === selected
            const count   = apptsByDate[ds]?.length ?? 0
            return (
              <button key={ds} onClick={() => setSelected(ds)}
                style={{
                  minHeight: 48, border: 'none', borderRight: '1px solid #F8F4EE', borderBottom: '1px solid #F8F4EE',
                  background: isSel ? C : isToday ? '#EAF7F1' : '#fff',
                  cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3, padding: '4px 2px',
                }}>
                <span style={{ fontSize: 13, fontWeight: isToday || isSel ? 700 : 400, color: isSel ? '#fff' : isToday ? C : '#333' }}>
                  {d.getDate()}
                </span>
                {count > 0 && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : C }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day appointments */}
      <div className="bg-white rounded-xl border border-[#E5DDD0] shadow-sm p-5">
        <h3 style={{ fontWeight: 600, fontSize: 15, color: '#0E1A15', marginBottom: 12 }}>
          {lang === 'fr' ? 'Rendez-vous' : 'Appointments'} — {new Date(selected + 'T12:00').toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>

        {dayAppts.length === 0 ? (
          <p style={{ fontSize: 13, color: '#AAA' }}>{lang === 'fr' ? 'Aucun rendez-vous ce jour.' : 'No appointments this day.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dayAppts.map(a => {
              const time = new Date(a.scheduled_at).toTimeString().slice(0, 5)
              const statusColor = { scheduled: '#0A5440', completed: '#888', cancelled: '#CF5A3C' }[a.status] ?? '#888'
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5DDD0', background: '#FAFAF7' }}>
                  <div style={{ minWidth: 44, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C }}>{time}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0E1A15' }}>{a.patient_name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{a.reason}</div>
                    {a.patient_phone && <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>{a.patient_phone}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: `${statusColor}15`, borderRadius: 6, padding: '2px 8px' }}>
                      {a.status}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {a.status === 'scheduled' && (
                        <button onClick={() => updateStatus(a.id, 'completed')}
                          style={{ fontSize: 11, color: C, background: '#EAF7F1', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}>
                          {lang === 'fr' ? 'Terminer' : 'Done'}
                        </button>
                      )}
                      <button onClick={() => startEdit(a)}
                        style={{ fontSize: 11, color: '#666', background: '#F0EAE0', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
                        {lang === 'fr' ? 'Modifier' : 'Edit'}
                      </button>
                      {a.status === 'scheduled' && (
                        <button onClick={() => updateStatus(a.id, 'cancelled')}
                          style={{ fontSize: 11, color: '#CF5A3C', background: '#FDF0ED', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
                          {lang === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Book / Edit form */}
      <div className="bg-white rounded-xl border border-[#E5DDD0] shadow-sm p-5">
        <h3 style={{ fontWeight: 600, fontSize: 15, color: '#0E1A15', marginBottom: 4 }}>
          {editId ? (lang === 'fr' ? 'Modifier le rendez-vous' : 'Edit appointment') : (lang === 'fr' ? 'Nouveau rendez-vous' : 'New appointment')}
        </h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          {lang === 'fr' ? `Pour le ${new Date(selected + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : `For ${new Date(selected + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`}
        </p>

        {saveErr && <Alert type="error"   msg={saveErr} />}
        {saveOk  && <Alert type="success" msg={lang === 'fr' ? 'Rendez-vous enregistré.' : 'Appointment saved.'} />}

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              {lang === 'fr' ? 'Nom du patient *' : 'Patient name *'}
            </label>
            <input required className={inp} value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              placeholder={lang === 'fr' ? 'Nom complet' : 'Full name'} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              {lang === 'fr' ? 'Téléphone' : 'Phone'}
            </label>
            <input className={inp} value={form.patientPhone}
              onChange={e => setForm(f => ({ ...f, patientPhone: e.target.value }))}
              placeholder="+228 90..." />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              {lang === 'fr' ? 'Heure *' : 'Time *'}
            </label>
            <select required className={inp} value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
              {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              {lang === 'fr' ? 'Motif *' : 'Reason *'}
            </label>
            <input required className={inp} value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder={lang === 'fr' ? 'Ex: Consultation générale, suivi diabète…' : 'E.g. General consultation, diabetes follow-up…'} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              {lang === 'fr' ? 'Notes internes' : 'Internal notes'}
            </label>
            <input className={inp} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={lang === 'fr' ? 'Optionnel' : 'Optional'} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '10px 24px', background: C, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? '…' : editId ? (lang === 'fr' ? 'Enregistrer' : 'Save') : (lang === 'fr' ? 'Planifier' : 'Schedule')}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ patientName:'', patientPhone:'', reason:'', time:'09:00', notes:'' }) }}
                style={{ padding: '10px 18px', background: '#F0EAE0', color: '#555', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

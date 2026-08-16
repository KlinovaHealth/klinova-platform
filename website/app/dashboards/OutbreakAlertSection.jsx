'use client'
import { useState } from 'react'
import useSWR from 'swr'

const SEV_STYLE = {
  critical: { bg: 'bg-red-50',    border: 'border-red-300',   dot: 'bg-red-500',    text: 'text-red-700',   badge: 'bg-red-100 text-red-700'    },
  warning:  { bg: 'bg-amber-50',  border: 'border-amber-300', dot: 'bg-amber-500',  text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  info:     { bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-400',   text: 'text-blue-700',  badge: 'bg-blue-50 text-blue-700'    },
}

const fetcher = () => fetch('/api/outbreaks').then(r => r.json())

export default function OutbreakAlertSection({ userRole }) {
  const isManager = ['owner', 'admin'].includes(userRole)
  const { data, mutate, isLoading } = useSWR('outbreaks', fetcher, { refreshInterval: 300_000 })

  const outbreaks  = data?.outbreaks  ?? []
  const advisories = data?.advisories ?? []
  const published  = advisories.filter(a => a.status === 'published')
  const drafts     = advisories.filter(a => a.status === 'draft')

  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded]     = useState(null)
  const [editing, setEditing]       = useState({})

  async function forceRefresh() {
    setRefreshing(true)
    await fetch('/api/outbreaks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    await mutate()
    setRefreshing(false)
  }

  async function updateAdvisory(id, status, edits = {}) {
    await fetch('/api/outbreaks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_advisory', advisoryId: id, status, ...edits }),
    })
    mutate()
    setEditing(e => { const n = { ...e }; delete n[id]; return n })
  }

  return (
    <div className="space-y-4">

      {/* Published alert banners */}
      {published.map(a => {
        const s = SEV_STYLE[a.severity] ?? SEV_STYLE.warning
        return (
          <div key={a.id} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${s.text}`}>{a.title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${s.text} opacity-80`}>{a.body_en}</p>
                {a.body_fr && (
                  <p className={`text-xs mt-1 leading-relaxed ${s.text} opacity-60 italic`}>{a.body_fr}</p>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${s.badge}`}>
                {a.severity}
              </span>
            </div>
          </div>
        )
      })}

      {/* Main section */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-ink">Global Health Alerts</h3>
            <p className="text-xs text-ink/50 mt-0.5">
              WHO Disease Outbreak News · AI-generated advisories · updated hourly
            </p>
          </div>
          {isManager && (
            <button onClick={forceRefresh} disabled={refreshing}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-ink/60 hover:bg-ivory disabled:opacity-40">
              {refreshing ? 'Fetching WHO data…' : '↻ Refresh now'}
            </button>
          )}
        </div>

        {isLoading && (
          <div className="text-sm text-ink/40 animate-pulse py-4 text-center">Loading WHO feed…</div>
        )}

        {/* Active outbreaks */}
        {outbreaks.length > 0 && (
          <div className="space-y-2 mb-5">
            {outbreaks.slice(0, 12).map(ob => {
              const s = SEV_STYLE[ob.severity] ?? SEV_STYLE.info
              const isOpen = expanded === ob.id
              return (
                <div key={ob.id} className={`rounded-lg border ${s.border} ${s.bg}`}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : ob.id)}
                    className="w-full flex items-center gap-3 p-3 text-left">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${s.text}`}>{ob.disease}</span>
                      <span className="text-xs text-ink/40 ml-2">{ob.location_name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${s.badge}`}>
                      {ob.severity}
                    </span>
                    <span className="text-xs text-ink/30">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && (
                    <div className={`px-4 pb-3 pt-1 border-t ${s.border}`}>
                      <p className={`text-xs leading-relaxed ${s.text} opacity-80`}>{ob.summary}</p>
                      {ob.source_url && (
                        <a href={ob.source_url} target="_blank" rel="noreferrer"
                          className="text-xs underline text-ink/40 mt-1 inline-block">
                          WHO source ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {outbreaks.length === 0 && !isLoading && (
          <p className="text-sm text-ink/40 mb-4">
            No active outbreaks on record. Click &quot;Refresh now&quot; to fetch latest WHO data.
          </p>
        )}

        {/* Draft advisories — owner/admin only */}
        {isManager && drafts.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
              AI-Generated Advisories — awaiting your review
            </p>
            <div className="space-y-3">
              {drafts.map(a => {
                const s = SEV_STYLE[a.severity] ?? SEV_STYLE.warning
                const ed = editing[a.id] ?? {}
                return (
                  <div key={a.id} className={`rounded-lg border p-4 ${s.bg} ${s.border}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <input
                        className="text-sm font-semibold bg-transparent border-b border-dashed border-current/30 w-full focus:outline-none"
                        value={ed.title ?? a.title}
                        onChange={e => setEditing(prev => ({ ...prev, [a.id]: { ...(prev[a.id] ?? {}), editedTitle: e.target.value } }))}
                      />
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium capitalize ${s.badge}`}>
                        {a.severity}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      className="w-full text-xs bg-transparent border border-dashed border-current/20 rounded p-2 mb-1 resize-none focus:outline-none"
                      value={ed.editedBodyEn ?? a.body_en ?? ''}
                      onChange={e => setEditing(prev => ({ ...prev, [a.id]: { ...(prev[a.id] ?? {}), editedBodyEn: e.target.value } }))}
                      placeholder="English advisory…"
                    />
                    <textarea
                      rows={2}
                      className="w-full text-xs bg-transparent border border-dashed border-current/20 rounded p-2 mb-2 resize-none focus:outline-none"
                      value={ed.editedBodyFr ?? a.body_fr ?? ''}
                      onChange={e => setEditing(prev => ({ ...prev, [a.id]: { ...(prev[a.id] ?? {}), editedBodyFr: e.target.value } }))}
                      placeholder="Advisory en français…"
                    />
                    {a.body_local && (
                      <p className="text-xs text-ink/50 italic mb-2">{a.body_local}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAdvisory(a.id, 'published', editing[a.id] ?? {})}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0A5440] hover:opacity-90">
                        Publish to all dashboards
                      </button>
                      <button
                        onClick={() => updateAdvisory(a.id, 'archived')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-ink/50 hover:bg-ivory">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {published.length > 0 && isManager && (
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Published</p>
            <div className="space-y-1">
              {published.map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs text-ink/60 py-1">
                  <span>{a.title}</span>
                  <button onClick={() => updateAdvisory(a.id, 'archived')}
                    className="text-ink/30 hover:text-red-500">Archive</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

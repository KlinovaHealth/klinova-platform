'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase-client'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import GovDashboard from '@/app/dashboards/GovDashboard'

const ALLOWED = ['owner', 'admin', 'government']

export default function GovPage() {
  const { user, role, profile, loading } = useAuth()
  const router = useRouter()
  const [govSubscribed, setGovSubscribed] = useState(null)
  const [checkingGov, setCheckingGov] = useState(false)

  useEffect(() => {
    if (!loading && !ALLOWED.includes(role)) {
      router.replace('/dashboard')
    }
    // Only government role needs subscription check
    if (!loading && role === 'government' && user) {
      setCheckingGov(true)
      const supabase = createClient()
      supabase.from('users').select('gov_subscribed').eq('id', user.id).single()
        .then(({ data }) => { setGovSubscribed(data?.gov_subscribed ?? false); setCheckingGov(false) })
    }
  }, [loading, role, user, router])

  if (loading || checkingGov) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-kgreen text-sm animate-pulse">Loading…</div>
    </div>
  )

  if (!ALLOWED.includes(role)) return null

  const isGov = role === 'government'
  const subscribed = isGov ? govSubscribed : true

  return (
    <DashboardLayout role={role} userName={profile?.full_name}>
      {isGov && !subscribed ? <SubscribeWall /> : <GovDashboard />}
    </DashboardLayout>
  )
}

function SubscribeWall() {
  return (
    <div className="max-w-md mx-auto mt-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#E3EFE8] flex items-center justify-center mx-auto mb-5">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#0A5440" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 20.25H5.25A2.25 2.25 0 013 18V6.75A2.25 2.25 0 015.25 4.5H9M15 4.5h3.75A2.25 2.25 0 0121 6.75V18a2.25 2.25 0 01-2.25 2.25H15M12 3v18M9 12h6" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        className="text-2xl font-semibold text-ink mb-3">
        Government Health Dashboard
      </h2>
      <p className="text-sm text-ink/60 leading-relaxed mb-6">
        Access real-time disease tracking maps, clinic coverage data, and regional health analytics
        for your ministry. Contact Klinova to activate your subscription.
      </p>
      <a href="mailto:contact@klinova.co"
        className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90"
        style={{ background: '#0A5440' }}>
        Contact Klinova to Subscribe
      </a>
    </div>
  )
}

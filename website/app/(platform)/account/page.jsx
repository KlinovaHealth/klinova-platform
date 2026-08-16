'use client'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import AccountContent from './AccountContent'

export default function AccountPage() {
  const { user, role, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-kgreen text-sm animate-pulse">Loading…</div>
    </div>
  )

  return (
    <DashboardLayout role={role}>
      <AccountContent user={user} role={role} profile={profile} />
    </DashboardLayout>
  )
}

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import PartnersDashboard from '@/app/dashboards/PartnersDashboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Partners — Klinova' }

export default async function PartnersPage() {
  const headersList = await headers()
  const userId   = headersList.get('x-user-id')
  const userName = headersList.get('x-user-name') ?? ''
  if (!userId) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('role, full_name, finance_admin')
    .eq('id', userId)
    .single()

  if (!['admin', 'analyst', 'owner'].includes(profile?.role)) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name ?? userName} financeAdmin={profile.finance_admin ?? false}>
      <PartnersDashboard />
    </DashboardLayout>
  )
}

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import FinanceDashboard from '@/app/dashboards/FinanceDashboard'

export default async function FinancePage() {
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

  const role = profile?.role ?? null
  if (!role) redirect('/login')

  const isOwner = role === 'owner'

  if (!isOwner) {
    const { data: access } = await admin
      .from('fin_access')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!access) redirect('/dashboard')
  }

  const fullName = profile?.full_name ?? userName

  return (
    <DashboardLayout role={role} userName={fullName} financeAdmin={profile?.finance_admin ?? false}>
      <FinanceDashboard isOwner={isOwner} />
    </DashboardLayout>
  )
}

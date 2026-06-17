import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import PatientDashboard     from '@/app/dashboards/PatientDashboard'
import DoctorDashboard      from '@/app/dashboards/DoctorDashboard'
import PharmacistDashboard  from '@/app/dashboards/PharmacistDashboard'
import AdminDashboard       from '@/app/dashboards/AdminDashboard'
import AnalystDashboard     from '@/app/dashboards/AnalystDashboard'
import NurseDashboard       from '@/app/dashboards/NurseDashboard'
import MarketingDashboard   from '@/app/dashboards/MarketingDashboard'
import FrontdeskDashboard   from '@/app/dashboards/FrontdeskDashboard'
import OwnerDashboard       from '@/app/dashboards/OwnerDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const headersList = await headers()
  const userId    = headersList.get('x-user-id')
  const userEmail = headersList.get('x-user-email') ?? ''
  const userName  = headersList.get('x-user-name')  ?? ''
  if (!userId) redirect('/login')

  const admin = createAdminClient()
  let { data: profile, error: profileErr } = await admin
    .from('users')
    .select('role, full_name, force_password_change, pharmacy_id, finance_admin')
    .eq('id', userId)
    .single()

  // If the profile row doesn't exist yet, insert it (ignoreDuplicates so we never
  // overwrite a manually-set full_name).
  if (profileErr?.code === 'PGRST116') {
    const displayName = userName && !userName.includes('@')
      ? userName
      : (userEmail.split('@')[0] ?? 'Admin')
    const { error: insertErr } = await admin
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: displayName,
        role: 'admin',
        force_password_change: false,
      }, { onConflict: 'id', ignoreDuplicates: true })

    if (insertErr) {
      console.error('[dashboard] profile insert error:', insertErr.message)
    } else {
      const { data: refetched } = await admin
        .from('users')
        .select('role, full_name, force_password_change, pharmacy_id, finance_admin')
        .eq('id', userId)
        .single()
      profile = refetched
    }
  } else if (profileErr) {
    console.error('[dashboard] profile fetch error:', profileErr.message, profileErr.code)
  }

  if (profile?.force_password_change) redirect('/auth/first-login')

  const role         = profile?.role         ?? 'admin'
  const full_name    = profile?.full_name    ?? (userName || 'User')
  const pharmacy_id  = profile?.pharmacy_id  ?? null
  const finance_admin = profile?.finance_admin ?? false

  const DASHBOARDS = {
    patient:    <PatientDashboard    userId={userId} name={full_name} />,
    doctor:     <DoctorDashboard     userId={userId} name={full_name} />,
    pharmacist: <PharmacistDashboard userId={userId} name={full_name} pharmacyId={pharmacy_id} />,
    admin:      <AdminDashboard      userId={userId} name={full_name} />,
    analyst:    <AnalystDashboard    userId={userId} name={full_name} />,
    nurse:      <NurseDashboard      userId={userId} name={full_name} />,
    marketing:  <MarketingDashboard  userId={userId} name={full_name} />,
    frontdesk:  <FrontdeskDashboard  userId={userId} name={full_name} />,
    owner:      <OwnerDashboard      userId={userId} name={full_name} financeAdmin={finance_admin} />,
  }

  const content = DASHBOARDS[role] ?? (
    <div className="p-8 text-ink/60">Unknown role: {role}</div>
  )

  return (
    <DashboardLayout role={role} userName={full_name} financeAdmin={finance_admin}>
      {content}
    </DashboardLayout>
  )
}

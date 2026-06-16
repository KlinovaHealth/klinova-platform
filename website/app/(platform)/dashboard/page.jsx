import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardLayout from '@/app/dashboards/DashboardLayout'
import PatientDashboard     from '@/app/dashboards/PatientDashboard'
import DoctorDashboard      from '@/app/dashboards/DoctorDashboard'
import PharmacistDashboard  from '@/app/dashboards/PharmacistDashboard'
import AdminDashboard       from '@/app/dashboards/AdminDashboard'
import AnalystDashboard     from '@/app/dashboards/AnalystDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, force_password_change, pharmacy_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.force_password_change) redirect('/auth/first-login')

  const { role, full_name, pharmacy_id } = profile

  const DASHBOARDS = {
    patient:     <PatientDashboard    userId={user.id} name={full_name} />,
    doctor:      <DoctorDashboard     userId={user.id} name={full_name} />,
    pharmacist:  <PharmacistDashboard userId={user.id} name={full_name} pharmacyId={pharmacy_id} />,
    admin:       <AdminDashboard      userId={user.id} name={full_name} />,
    analyst:     <AnalystDashboard    userId={user.id} name={full_name} />,
  }

  const content = DASHBOARDS[role] ?? (
    <div className="p-8 text-ink/60">Unknown role: {role}</div>
  )

  return (
    <DashboardLayout role={role}>
      {content}
    </DashboardLayout>
  )
}

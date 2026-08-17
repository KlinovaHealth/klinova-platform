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
    .select('role, full_name, force_password_change, pharmacy_id, finance_admin, status')
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

  if (profile?.status === 'pending') {
    const ROLE_LABELS = { doctor: 'Doctor', frontdesk: 'Clinic / Hospital', pharmacist: 'Pharmacy' }
    const label = ROLE_LABELS[profile.role] ?? 'Provider'
    return (
      <div style={{ minHeight: '100vh', background: '#F5EFE3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
          <img src="/klinova-logo-white.png" alt="Klinova" style={{ height: 56, width: 'auto', marginBottom: 28 }} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D99A2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#15302A', margin: '0 0 10px' }}>Application under review</h1>
          <p style={{ fontSize: 15, color: '#6E7F76', lineHeight: 1.6, margin: '0 0 24px' }}>
            Your {label} application has been received. Our team will review it and get back to you within <strong style={{ color: '#15302A' }}>48 hours</strong>.
          </p>
          <p style={{ fontSize: 13, color: '#6E7F76', margin: 0 }}>
            Questions? Email us at{' '}
            <a href="mailto:contact@klinova.co" style={{ color: '#0E6B4F', textDecoration: 'none', fontWeight: 600 }}>contact@klinova.co</a>
          </p>
        </div>
      </div>
    )
  }

  if (profile?.status === 'rejected') {
    return (
      <div style={{ minHeight: '100vh', background: '#F5EFE3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
          <img src="/klinova-logo-white.png" alt="Klinova" style={{ height: 56, width: 'auto', marginBottom: 28 }} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FBEEE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#CF5A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#15302A', margin: '0 0 10px' }}>Application not approved</h1>
          <p style={{ fontSize: 15, color: '#6E7F76', lineHeight: 1.6, margin: '0 0 24px' }}>
            Unfortunately your application did not meet our current requirements. If you believe this is an error, please reach out to us directly.
          </p>
          <a href="mailto:contact@klinova.co" style={{ display: 'inline-block', background: '#0E6B4F', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Contact us
          </a>
        </div>
      </div>
    )
  }

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

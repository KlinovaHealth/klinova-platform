import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

// GET /api/directory
// Returns Klinova-registered providers (doctors, clinics, pharmacies) for the public directory.
// No auth required — only listed/public data is returned.
export async function GET() {
  const admin = createAdminClient()

  const [doctorsRes, clinicsRes, pharmaciesRes] = await Promise.all([
    // Doctors: all partner and inhouse — auto-listed on account creation
    admin.from('users')
      .select('id, full_name, doctor_type, specialty, city, country, accepting_patients, created_at')
      .eq('role', 'doctor')
      .order('created_at', { ascending: false })
      .limit(500),

    // Clinics: all — auto-listed, profile details improve their card
    admin.from('clinics')
      .select('id, name, address, city, country, phone, email, services, hours, lat, lng, accepting_patients, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),

    // Pharmacies: all — auto-listed, profile details improve their card
    admin.from('pharmacies')
      .select('id, name, address, city, country, phone, email, services, hours, lat, lng, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),
  ])

  return NextResponse.json({
    doctors:    doctorsRes.data ?? [],
    clinics:    clinicsRes.data ?? [],
    pharmacies: pharmaciesRes.data ?? [],
    updated_at: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

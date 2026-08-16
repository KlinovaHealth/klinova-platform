'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase-client'
import useSWR from 'swr'
import lazyLoad from 'next/dynamic'

const FinanceDashboard = lazyLoad(() => import('@/app/dashboards/FinanceDashboard'), { ssr: false })

export default function FinancePageClient() {
  const { user, role, loading } = useAuth()
  const router   = useRouter()
  const supabase = createClient()

  const shouldCheckAccess = !!(user && role && role !== 'owner')

  const { data: hasAccess, isLoading: checkingAccess } = useSWR(
    shouldCheckAccess ? `fin-access-check-${user.id}` : null,
    async () => {
      const { data } = await supabase.from('fin_access').select('user_id').eq('user_id', user.id).maybeSingle()
      return !!data
    }
  )

  useEffect(() => {
    if (loading || !role) return
    if (!user) { router.replace('/login'); return }
    if (role === 'owner') return
    if (!checkingAccess && hasAccess === false) router.replace('/dashboard')
  }, [user, role, loading, hasAccess, checkingAccess, router])

  if (loading || !user || !role) return null
  if (role === 'owner') return <FinanceDashboard isOwner />
  if (checkingAccess) return null
  if (!hasAccess) return null

  return <FinanceDashboard isOwner={false} />
}

'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile(authUser) {
      if (!authUser) {
        setUser(null); setRole(null); setProfile(null)
        setLoading(false)
        return
      }
      setUser(authUser)
      const { data } = await supabase
        .from('users')
        .select('role, full_name, force_password_change, pharmacy_id')
        .eq('id', authUser.id)
        .single()
      if (data) {
        setRole(data.role)
        setProfile(data)
      }
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

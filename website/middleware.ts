import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session and rotates the cookie if needed
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected =
    path.startsWith('/dashboard') ||
    path.startsWith('/account') ||
    path.startsWith('/auth/first-login') ||
    path.startsWith('/api/')

  // Guard: no session → login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Guard: logged-in user hitting /login → dashboard
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Forward verified user identity as request headers so server components
  // can read them via headers(). Must be request headers, not response headers.
  if (user) {
    const reqHeaders = new Headers(request.headers)
    reqHeaders.set('x-user-id', user.id)
    reqHeaders.set('x-user-email', user.email ?? '')
    reqHeaders.set('x-user-name', (user.user_metadata?.full_name as string) ?? user.email ?? '')
    const res = NextResponse.next({ request: { headers: reqHeaders } })
    // Copy any session-refresh cookies Supabase wrote on this request
    supabaseResponse.cookies.getAll().forEach(cookie => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/auth/first-login',
    '/api/:path*',
    '/login',
  ],
}

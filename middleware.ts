import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Auth pages — redirect to dashboard if already logged in
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some(p => path.startsWith(p))
    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Authenticated-only routes
    const protectedPaths = ['/dashboard', '/profile', '/import-request', '/checkout', '/listing/create']
    const adminPaths = ['/admin']

    const isProtected = protectedPaths.some(p => path.startsWith(p))
    const isAdmin = adminPaths.some(p => path.startsWith(p))

    // Not logged in → redirect to login
    if ((isProtected || isAdmin) && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(loginUrl)
    }

    // Non-admin trying to access /admin → redirect to dashboard
    if (isAdmin && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/dashboard/:path*',
        '/admin/:path*',
        '/profile/:path*',
        '/import-request',
        '/checkout',
        '/listing/create',
    ],
}

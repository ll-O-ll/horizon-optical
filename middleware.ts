import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if the user is trying to access the dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Check for the admin auth cookie
        const adminAuth = request.cookies.get('admin_auth')

        // If there's no cookie, or it doesn't match a secret value, redirect to login
        // We're keeping it very simple since you just wanted a hardcoded password
        if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Check if the user is trying to access the portal content
    if (request.nextUrl.pathname.startsWith('/portal/content')) {
        const portalSession = request.cookies.get('portal_session')

        if (!portalSession?.value) {
            return NextResponse.redirect(new URL('/portal', request.url))
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/dashboard/:path*', '/portal/content/:path*'],
}

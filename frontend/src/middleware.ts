import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if we have tokens (since Zustand stores it in auth-storage local storage, we can't easily read it in Edge runtime)
    // NOTE: A more robust approach combines server-side cookies or session for standard SSR Auth.
    // For client-side standard, this is an initial placeholder or basic cookie-based block if you upgrade.

    // Example implementation checking a hypothetical 'accessToken' cookie, which could be set along with Zustand.
    const token = request.cookies.get('accessToken')?.value;

    // Path prefixes that require authentication
    const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
    // Path prefixes for auth (if user is already logged in, they shouldn't visit these)
    const authRoutes = ['/login', '/register', '/forgot-password'];

    const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    // If we had a token, we might enforce logic here. Since it's local storage right now, 
    // relying entirely on client-side routing protection or adding cookie-syncing logic is recommended.
    // Let's assume we implement a cookie-based sync later or just let this be scaffolded.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (template assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};

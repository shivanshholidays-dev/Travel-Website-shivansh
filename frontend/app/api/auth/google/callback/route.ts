import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Get the query parameters sent by Google (`code`, `state`, etc.)
    const url = new URL(request.url);
    const searchParams = url.search;

    // We must forward these parameters back to the NestJS backend
    // so that Passport's GoogleStrategy can exchange the `code` for user profile data.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // The backend endpoint that processes the Google callback is `/auth/google/callback`
    const backendRedirectUrl = `${backendUrl}/auth/google/callback${searchParams}`;

    // Redirect the user's browser to the backend
    return NextResponse.redirect(backendRedirectUrl);
}

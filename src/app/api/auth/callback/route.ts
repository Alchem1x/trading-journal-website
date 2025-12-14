import { NextRequest, NextResponse } from 'next/server';
import { getDiscordUser, createToken, setAuthCookie } from '@/lib/custom-auth';

/**
 * Handle Discord OAuth callback
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error || !code) {
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    try {
        // Exchange code for user info
        const user = await getDiscordUser(code);

        if (!user) {
            return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
        }

        // Create JWT token
        const token = await createToken(user);

        // Create response with redirect
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        // Set auth cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}

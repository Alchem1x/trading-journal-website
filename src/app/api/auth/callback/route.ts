import { NextRequest, NextResponse } from 'next/server';
import { getDiscordUser, createToken } from '@/lib/custom-auth';

/**
 * Handle Discord OAuth callback
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('Callback received:', { code: code ? 'present' : 'missing', error });

    // Handle OAuth errors
    if (error || !code) {
        console.error('OAuth error:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    try {
        // Exchange code for user info
        console.log('Exchanging code for user...');
        const user = await getDiscordUser(code);

        if (!user) {
            console.error('Failed to get user from Discord');
            return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
        }

        console.log('User fetched:', user.username);

        // Create JWT token
        const token = await createToken(user);
        console.log('Token created');

        // Create response with redirect
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        // Set auth cookie using response.cookies
        response.cookies.set({
            name: 'auth-token',
            value: token,
            httpOnly: true,
            secure: true, // Always use secure on Vercel
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        console.log('Cookie set, redirecting to dashboard');
        return response;
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}

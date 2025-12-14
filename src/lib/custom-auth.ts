/**
 * Custom Authentication System
 * Simple, reliable auth that works on Vercel
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
);

export interface UserSession {
    id: string;
    discordId: string;
    username: string;
    avatar: string | null;
}

/**
 * Create a JWT token for the user
 */
export async function createToken(user: UserSession): Promise<string> {
    const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // Token expires in 7 days
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<UserSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.user as UserSession;
    } catch (error) {
        return null;
    }
}

/**
 * Get the current user session from cookies
 */
export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

/**
 * Set the auth cookie
 */
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Clear the auth cookie (logout)
 */
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
}

/**
 * Exchange Discord code for user info
 */
export async function getDiscordUser(code: string): Promise<UserSession | null> {
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
            }),
        });

        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', await tokenResponse.text());
            return null;
        }

        const { access_token } = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userResponse.ok) {
            console.error('User fetch failed:', await userResponse.text());
            return null;
        }

        const discordUser = await userResponse.json();

        return {
            id: discordUser.id,
            discordId: discordUser.id,
            username: discordUser.username,
            avatar: discordUser.avatar,
        };
    } catch (error) {
        console.error('Discord OAuth error:', error);
        return null;
    }
}

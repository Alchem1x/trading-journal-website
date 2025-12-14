import { NextResponse } from 'next/server';

/**
 * Initiate Discord OAuth login
 */
export async function GET() {
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');

    discordAuthUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
    discordAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/callback`);
    discordAuthUrl.searchParams.set('response_type', 'code');
    discordAuthUrl.searchParams.set('scope', 'identify');

    return NextResponse.redirect(discordAuthUrl.toString());
}

/**
 * NextAuth configuration for Discord OAuth
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Store Discord user ID in JWT token
            if (account && profile) {
                token.discordId = (profile as any).id;
                token.username = (profile as any).username;
                token.avatar = (profile as any).avatar;
            }
            return token;
        },
        async session({ session, token }) {
            // Add Discord user ID to session
            if (session.user) {
                (session.user as any).id = token.discordId; // Map Discord ID to user.id for database queries
                (session.user as any).discordId = token.discordId;
                (session.user as any).username = token.username;
                (session.user as any).avatar = token.avatar;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
    // Vercel-specific settings
    useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://'),
    cookies: {
        sessionToken: {
            name: `${process.env.NEXTAUTH_URL?.startsWith('https://') ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://'),
            },
        },
    },
};

export default NextAuth(authOptions);

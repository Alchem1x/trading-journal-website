/**
 * API route to fetch user statistics
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStats, getCurrentStreak } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const userId = parseInt(user.discordId);

        const stats = getUserStats(userId);
        const streak = getCurrentStreak(userId);

        return NextResponse.json({ stats, streak });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMistakeStats, getMistakeTrends } from '@/lib/database';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt((session.user as any).id);

        // Get days from query params or default to 30
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const mistakeStats = getMistakeStats(userId);
        const mistakeTrends = getMistakeTrends(userId, days);

        return NextResponse.json({
            mistakeStats,
            mistakeTrends
        });
    } catch (error) {
        console.error('Mistakes API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

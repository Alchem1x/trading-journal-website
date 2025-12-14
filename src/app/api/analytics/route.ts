import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTimeOfDayStats, getDayOfWeekStats, getRREfficiency, getEquityCurveData } from '@/lib/database';
import { calculateMaxDrawdown } from '@/lib/utils';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt((session.user as any).id);

        // Get all analytics data
        const timeOfDay = getTimeOfDayStats(userId);
        const dayOfWeek = getDayOfWeekStats(userId);
        const rrEfficiency = getRREfficiency(userId);

        // Calculate drawdown
        const equityCurve = getEquityCurveData(userId);
        const drawdown = calculateMaxDrawdown(equityCurve.map(d => d.cumulative_pnl));

        return NextResponse.json({
            timeOfDay,
            dayOfWeek,
            rrEfficiency,
            drawdown
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

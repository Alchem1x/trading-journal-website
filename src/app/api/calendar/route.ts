import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarData, getStreakInfo } from '@/lib/database';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt((session.user as any).id);

        // Get month from query params or use current month
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');

        const date = monthParam ? new Date(monthParam) : new Date();
        const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

        const calendarData = getCalendarData(userId, startDate, endDate);
        const streaks = getStreakInfo(userId);

        return NextResponse.json({
            calendarData,
            streaks,
            month: format(date, 'MMMM yyyy')
        });
    } catch (error) {
        console.error('Calendar API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

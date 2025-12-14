import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTradesForDay } from '@/lib/database';

export async function GET(
    request: Request,
    { params }: { params: { date: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt((session.user as any).id);
        const trades = getTradesForDay(userId, params.date);

        return NextResponse.json({ trades });
    } catch (error) {
        console.error('Calendar day API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

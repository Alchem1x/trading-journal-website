/**
 * API route to fetch all user trades
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserTrades } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const userId = parseInt(user.discordId);

        // Fetch all trades (no limit for trade history page)
        const trades = getUserTrades(userId, 1000);

        return NextResponse.json({ trades });
    } catch (error) {
        console.error('Error fetching trades:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * API route to fetch setup grade statistics
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSetupGradeStats } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const userId = parseInt(user.discordId);

        const data = getSetupGradeStats(userId);

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching setup grades:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

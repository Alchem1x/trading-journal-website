'use client';

import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}

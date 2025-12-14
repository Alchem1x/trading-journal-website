'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    discordId: string;
    username: string;
    avatar: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                setUser(data.user || null);
                setLoading(false);

                // Redirect to login if not authenticated
                if (!data.user) {
                    router.push('/');
                }
            })
            .catch(() => {
                setLoading(false);
                router.push('/');
            });
    }, [router]);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    return { user, loading, logout };
}

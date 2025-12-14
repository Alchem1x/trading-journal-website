'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartLine, FaHistory, FaChartBar, FaCog, FaSignOutAlt, FaDiscord, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { ReactNode } from 'react';

interface NavItem {
    name: string;
    href: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <FaChartLine /> },
    { name: 'Trade History', href: '/dashboard/trades', icon: <FaHistory /> },
    { name: 'Analytics', href: '/dashboard/analytics', icon: <FaChartBar /> },
    { name: 'Calendar', href: '/dashboard/calendar', icon: <FaCalendarAlt /> },
    { name: 'Mistakes', href: '/dashboard/mistakes', icon: <FaExclamationTriangle /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <FaCog /> },
];

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session) return null;

    const user = session.user as any;

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-900 border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-800">
                <FaChartLine className="text-2xl text-emerald-500" />
                <span className="text-xl font-bold text-white">Trading Journal</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-emerald-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                    {user.avatar ? (
                        <img
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <FaDiscord className="text-white text-xl" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user.username || user.name}
                        </p>
                        <p className="text-xs text-gray-400">Discord User</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

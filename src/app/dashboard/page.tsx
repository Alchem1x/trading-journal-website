'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { FaChartLine, FaTrophy, FaDollarSign, FaFire, FaCalendarAlt, FaClock, FaPercentage, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import EquityCurve from '@/components/EquityCurve';

interface UserStats {
    total_trades: number;
    wins: number;
    losses: number;
    breakeven: number;
    total_pnl: number;
    win_rate: number;
}

interface Streak {
    type: 'win' | 'loss' | 'none';
    count: number;
}

interface Trade {
    id: number;
    timestamp: string;
    pnl: number;
    result: string;
    session: string;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && !authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        try {
            const [statsRes, tradesRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/trades')
            ]);
            const statsData = await statsRes.json();
            const tradesData = await tradesRes.json();

            setStats(statsData.stats);
            setStreak(statsData.streak);
            setTrades(tradesData.trades);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl neon-text-cyan">Loading your dashboard...</div>
            </div>
        );
    }

    // user is already available from useAuth hook


    // Calculate advanced metrics
    const avgWin = trades.filter(t => t.result === 'Win').reduce((sum, t) => sum + t.pnl, 0) / (stats?.wins || 1);
    const avgLoss = Math.abs(trades.filter(t => t.result === 'Loss').reduce((sum, t) => sum + t.pnl, 0) / (stats?.losses || 1));
    const profitFactor = avgWin / (avgLoss || 1);
    const expectancy = ((stats?.win_rate || 0) / 100 * avgWin) - ((100 - (stats?.win_rate || 0)) / 100 * avgLoss);

    // Best and worst day
    const dailyPnL = trades.reduce((acc, trade) => {
        const date = new Date(trade.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + trade.pnl;
        return acc;
    }, {} as Record<string, number>);

    const bestDay = Object.entries(dailyPnL).sort((a, b) => b[1] - a[1])[0];
    const worstDay = Object.entries(dailyPnL).sort((a, b) => a[1] - b[1])[0];

    // Session analysis
    const sessionStats = trades.reduce((acc, trade) => {
        if (!acc[trade.session]) {
            acc[trade.session] = { wins: 0, losses: 0, pnl: 0 };
        }
        if (trade.result === 'Win') acc[trade.session].wins++;
        if (trade.result === 'Loss') acc[trade.session].losses++;
        acc[trade.session].pnl += trade.pnl;
        return acc;
    }, {} as Record<string, { wins: number; losses: number; pnl: number }>);

    const bestSession = Object.entries(sessionStats).sort((a, b) => b[1].pnl - a[1].pnl)[0];

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8 text-center fade-in">
                <h1 className="text-4xl font-bold neon-text-cyan mb-2">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-400 text-lg">Here's your complete trading performance overview</p>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Trades */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 neon-border-animated slide-in-up hover:neon-glow-cyan text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <FaChartLine className="text-3xl neon-text-cyan" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold neon-text-cyan mb-2">
                        {stats?.total_trades || 0}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">Total Trades</div>
                </div>

                {/* Win Rate */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 neon-border-animated slide-in-up hover:neon-glow-green text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <FaTrophy className="text-3xl neon-text-green" />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${(stats?.win_rate || 0) >= 50 ? 'neon-text-green' : 'text-red-500'}`}>
                        {stats?.win_rate.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Win Rate</div>
                    <div className="text-xs text-gray-500">
                        {stats?.wins}W / {stats?.losses}L / {stats?.breakeven}BE
                    </div>
                </div>

                {/* Total PnL */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 neon-border-animated slide-in-up hover:neon-glow-magenta text-center">
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-lg ${(stats?.total_pnl || 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <FaDollarSign className={`text-3xl ${(stats?.total_pnl || 0) >= 0 ? 'neon-text-green' : 'text-red-500'}`} />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${(stats?.total_pnl || 0) >= 0 ? 'neon-text-green' : 'text-red-500'}`}>
                        ${stats?.total_pnl.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">Total P&L</div>
                </div>

                {/* Current Streak */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 neon-border-animated slide-in-up pulse-glow text-center">
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-lg ${streak?.type === 'win' ? 'bg-emerald-500/10' : streak?.type === 'loss' ? 'bg-red-500/10' : 'bg-gray-700/10'}`}>
                            <FaFire className={`text-3xl ${streak?.type === 'win' ? 'neon-text-green' : streak?.type === 'loss' ? 'text-red-500' : 'text-gray-500'}`} />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${streak?.type === 'win' ? 'neon-text-green' : streak?.type === 'loss' ? 'text-red-500' : 'text-gray-400'}`}>
                        {streak?.count || 0}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">
                        {streak?.type === 'win' ? 'Win Streak' : streak?.type === 'loss' ? 'Loss Streak' : 'No Active Streak'}
                    </div>
                </div>
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Performance Metrics */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 slide-in-up">
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4 flex items-center gap-2">
                        <FaPercentage className="text-sm" />
                        Performance Metrics
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Win</span>
                            <span className="text-emerald-500 font-semibold">${avgWin.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Loss</span>
                            <span className="text-red-500 font-semibold">-${avgLoss.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Profit Factor</span>
                            <span className={`font-semibold ${profitFactor >= 2 ? 'neon-text-green' : profitFactor >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {profitFactor.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Expectancy</span>
                            <span className={`font-semibold ${expectancy >= 0 ? 'neon-text-green' : 'text-red-500'}`}>
                                ${expectancy.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Best & Worst Days */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 slide-in-up">
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-sm" />
                        Best & Worst Days
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FaArrowUp className="text-emerald-500" />
                                <span className="text-gray-400 text-sm">Best Day</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm">{bestDay?.[0] || 'N/A'}</span>
                                <span className="neon-text-green font-bold">${bestDay?.[1]?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FaArrowDown className="text-red-500" />
                                <span className="text-gray-400 text-sm">Worst Day</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm">{worstDay?.[0] || 'N/A'}</span>
                                <span className="text-red-500 font-bold">${worstDay?.[1]?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Analysis */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 slide-in-up">
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4 flex items-center gap-2">
                        <FaClock className="text-sm" />
                        Best Session
                    </h3>
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold neon-text-magenta mb-2">
                                {bestSession?.[0] || 'N/A'}
                            </div>
                            <div className={`text-2xl font-semibold mb-3 ${(bestSession?.[1]?.pnl || 0) >= 0 ? 'neon-text-green' : 'text-red-500'}`}>
                                ${bestSession?.[1]?.pnl?.toFixed(2) || '0.00'}
                            </div>
                            <div className="flex justify-center gap-4 text-sm">
                                <span className="text-emerald-500">{bestSession?.[1]?.wins || 0}W</span>
                                <span className="text-red-500">{bestSession?.[1]?.losses || 0}L</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Equity Curve Chart */}
            <div className="mb-8">
                <EquityCurve />
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 slide-in-up">
                <h3 className="text-lg font-semibold neon-text-cyan mb-4 text-center">Quick Insights</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{((stats?.wins || 0) / (stats?.total_trades || 1) * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400 uppercase">Win Percentage</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{((stats?.losses || 0) / (stats?.total_trades || 1) * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400 uppercase">Loss Percentage</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{((stats?.breakeven || 0) / (stats?.total_trades || 1) * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400 uppercase">Breakeven %</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{Object.keys(dailyPnL).length}</div>
                        <div className="text-xs text-gray-400 uppercase">Trading Days</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

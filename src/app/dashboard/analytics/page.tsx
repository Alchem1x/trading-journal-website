'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaChartLine, FaClock, FaCalendarAlt, FaBullseye } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TimeOfDayChart from '@/components/analytics/TimeOfDayChart';
import DayOfWeekChart from '@/components/analytics/DayOfWeekChart';
import EquityCurve from '@/components/EquityCurve';
import SetupGradeChart from '@/components/SetupGradeChart';
import StrategyPerformance from '@/components/StrategyPerformance';

interface AnalyticsData {
    timeOfDay: any[];
    dayOfWeek: any[];
    rrEfficiency: any[];
    drawdown: number;
}

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchAnalytics();
        }
    }, [session]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            const analyticsData = await res.json();
            setData(analyticsData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text="Loading analytics..." />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-400">
                    <p>Unable to load analytics data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8 fade-in">
                <h1 className="text-4xl font-bold neon-text-cyan mb-2 flex items-center gap-3">
                    <FaChartLine />
                    Advanced Analytics
                </h1>
                <p className="text-gray-400 text-lg">Deep insights into your trading performance</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card glowColor="cyan">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg">
                            <FaClock className="text-3xl neon-text-cyan" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Best Trading Hour</div>
                            <div className="text-2xl font-bold text-white">
                                {data.timeOfDay.length > 0
                                    ? `${data.timeOfDay[0].hour}:00`
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="green">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <FaCalendarAlt className="text-3xl neon-text-green" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Best Day of Week</div>
                            <div className="text-2xl font-bold text-white">
                                {data.dayOfWeek.length > 0
                                    ? data.dayOfWeek.reduce((prev, curr) =>
                                        curr.total_pnl > prev.total_pnl ? curr : prev
                                    ).day_name
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="magenta">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-500/10 rounded-lg">
                            <FaBullseye className="text-3xl neon-text-magenta" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Max Drawdown</div>
                            <div className="text-2xl font-bold text-red-500">
                                {data.drawdown.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* New Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <TimeOfDayChart data={data.timeOfDay} />
                </Card>

                <Card>
                    <DayOfWeekChart data={data.dayOfWeek} />
                </Card>
            </div>

            {/* R:R Efficiency */}
            {data.rrEfficiency.length > 0 && (
                <Card className="mb-8">
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4">Risk:Reward Efficiency</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.rrEfficiency.map((rr, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="text-xl font-bold neon-text-cyan">{rr.target_rr}</div>
                                <div className="text-sm text-gray-400">{rr.count} trades</div>
                                <div className={`text-lg font-semibold ${rr.efficiency >= 80 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                    {rr.efficiency.toFixed(0)}% efficient
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Existing Charts */}
            <div className="space-y-6">
                <EquityCurve />
                <SetupGradeChart />
                <StrategyPerformance />
            </div>
        </div>
    );
}

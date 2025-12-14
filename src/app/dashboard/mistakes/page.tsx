'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaDollarSign, FaChartLine } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MistakeData {
    mistakeStats: Array<{
        mistake: string;
        frequency: number;
        total_cost: number;
        avg_cost: number;
        percentage: number;
    }>;
    mistakeTrends: Array<{
        date: string;
        mistake: string;
        count: number;
    }>;
}

export default function MistakesPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<MistakeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchMistakes();
        }
    }, [session]);

    const fetchMistakes = async () => {
        try {
            const res = await fetch('/api/mistakes');
            const mistakeData = await res.json();
            setData(mistakeData);
        } catch (error) {
            console.error('Error fetching mistakes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text="Loading mistake analysis..." />
            </div>
        );
    }

    if (!data || data.mistakeStats.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-4xl font-bold neon-text-cyan mb-4">Mistake Tracker</h1>
                <Card>
                    <div className="text-center text-gray-400 py-12">
                        <FaExclamationTriangle className="text-6xl mx-auto mb-4 text-emerald-500" />
                        <p className="text-xl">No mistakes logged yet!</p>
                        <p className="text-sm mt-2">This is great - keep trading with discipline! 🎯</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Calculate totals
    const totalMistakes = data.mistakeStats.reduce((sum, m) => sum + m.frequency, 0);
    const totalCost = data.mistakeStats.reduce((sum, m) => sum + m.total_cost, 0);
    const mostFrequent = data.mistakeStats[0];
    const mostCostly = data.mistakeStats.reduce((prev, current) =>
        (current.total_cost < prev.total_cost) ? current : prev
    );

    // Prepare trend data (group by date)
    const trendData = data.mistakeTrends.reduce((acc, item) => {
        if (!acc[item.date]) {
            acc[item.date] = { date: item.date, total: 0 };
        }
        acc[item.date].total += item.count;
        return acc;
    }, {} as Record<string, { date: string; total: number }>);

    const trendChartData = Object.values(trendData).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8 fade-in">
                <h1 className="text-4xl font-bold neon-text-cyan mb-2 flex items-center gap-3">
                    <FaExclamationTriangle />
                    Mistake Tracker
                </h1>
                <p className="text-gray-400 text-lg">Learn from your errors and improve faster</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card glowColor="magenta">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-500/10 rounded-lg">
                            <FaExclamationTriangle className="text-3xl neon-text-magenta" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Total Mistakes</div>
                            <div className="text-3xl font-bold text-white">{totalMistakes}</div>
                            <div className="text-xs text-gray-500">Last 30 days</div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="cyan">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <FaDollarSign className="text-3xl text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Total Cost</div>
                            <div className="text-3xl font-bold text-red-500">${totalCost.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">P&L impact</div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="green">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <FaChartLine className="text-3xl neon-text-green" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Most Frequent</div>
                            <div className="text-xl font-bold text-white">{mostFrequent.mistake}</div>
                            <div className="text-xs text-gray-500">{mostFrequent.frequency} times ({mostFrequent.percentage}%)</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Frequency Chart */}
                <Card>
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4">Mistake Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.mistakeStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis
                                dataKey="mistake"
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #00f5ff',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#00f5ff' }}
                            />
                            <Bar dataKey="frequency" fill="#ff00ff" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Cost Analysis */}
                <Card>
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4">Cost by Mistake Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.mistakeStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis
                                dataKey="mistake"
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #00f5ff',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#00f5ff' }}
                            />
                            <Bar dataKey="total_cost" fill="#ff0055" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Trend Chart */}
            {trendChartData.length > 0 && (
                <Card className="mb-8">
                    <h3 className="text-lg font-semibold neon-text-cyan mb-4">Mistake Trend (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis
                                dataKey="date"
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #00f5ff',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#00f5ff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#00f5ff"
                                strokeWidth={2}
                                dot={{ fill: '#00f5ff', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-gray-400 mt-4 text-center">
                        {trendChartData[trendChartData.length - 1].total < trendChartData[0].total
                            ? '✅ Great! Your mistakes are decreasing over time.'
                            : '⚠️ Your mistakes are increasing. Focus on discipline!'}
                    </p>
                </Card>
            )}

            {/* Detailed Breakdown */}
            <Card>
                <h3 className="text-lg font-semibold neon-text-cyan mb-4">Detailed Breakdown</h3>
                <div className="space-y-3">
                    {data.mistakeStats.map((mistake, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-lg font-bold text-white">{mistake.mistake}</h4>
                                    <p className="text-sm text-gray-400">{mistake.frequency} occurrences ({mistake.percentage}% of all mistakes)</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-red-500">${mistake.total_cost.toFixed(2)}</div>
                                    <div className="text-sm text-gray-400">Total cost</div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Avg Cost:</span>
                                    <span className="text-red-500 font-semibold ml-2">${mistake.avg_cost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Alert if repeating mistakes */}
            {mostFrequent.frequency >= 3 && (
                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <FaExclamationTriangle className="text-3xl text-yellow-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xl font-bold text-yellow-500 mb-2">⚠️ Repeated Mistake Alert!</h4>
                            <p className="text-gray-300">
                                You've made the <span className="font-bold">{mostFrequent.mistake}</span> mistake {mostFrequent.frequency} times recently.
                                This has cost you <span className="font-bold text-red-500">${mostFrequent.total_cost.toFixed(2)}</span>.
                            </p>
                            <p className="text-gray-400 mt-2 text-sm">
                                💡 Tip: Review your trading rules and consider adding a checklist to prevent this mistake.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

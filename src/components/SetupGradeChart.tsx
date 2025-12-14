'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';

interface GradeStats {
    count: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_pnl: number;
    total_pnl: number;
}

export default function SetupGradeChart() {
    const [data, setData] = useState<{ [grade: string]: GradeStats }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGradeStats();
    }, []);

    const fetchGradeStats = async () => {
        try {
            const response = await fetch('/api/setup-grades');
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error('Error fetching setup grades:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Setup Grade Analysis</h2>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (Object.keys(data).length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Setup Grade Analysis</h2>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">No graded trades available</p>
                </div>
            </div>
        );
    }

    // Format data for chart
    const chartData = ['A+', 'A', 'B', 'C']
        .filter(grade => data[grade])
        .map(grade => ({
            grade,
            'Win Rate': data[grade].win_rate,
            'Trades': data[grade].count,
            'Avg P&L': data[grade].avg_pnl
        }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Setup Grade Analysis</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['A+', 'A', 'B', 'C'].map(grade => {
                    if (!data[grade]) return null;
                    const stats = data[grade];
                    return (
                        <div key={grade} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <div className="text-2xl font-bold text-white mb-1">{grade}</div>
                            <div className="text-sm text-gray-400 mb-2">{stats.count} trades</div>
                            <div className={`text-lg font-semibold ${stats.win_rate >= 60 ? 'text-emerald-500' :
                                    stats.win_rate >= 50 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {stats.win_rate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                                {stats.wins}W / {stats.losses}L
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="grade" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'Win Rate') return [`${value.toFixed(1)}%`, name];
                            if (name === 'Avg P&L') return [`$${value.toFixed(2)}`, name];
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Win Rate" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>

            {/* Insight */}
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                    💡 <strong>Insight:</strong> Focus on taking more A+ and A grade setups to improve your win rate.
                </p>
            </div>
        </div>
    );
}

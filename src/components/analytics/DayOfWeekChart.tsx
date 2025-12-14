'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DayOfWeekChartProps {
    data: Array<{
        day_of_week: number;
        day_name: string;
        total: number;
        wins: number;
        losses: number;
        win_rate: number;
        avg_pnl: number;
        total_pnl: number;
    }>;
}

export default function DayOfWeekChart({ data }: DayOfWeekChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-400 py-12">
                <p>No day-of-week data available</p>
                <p className="text-sm mt-2">Log more trades to see this analysis</p>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        day: d.day_name.substring(0, 3), // Mon, Tue, etc.
        'Win Rate': d.win_rate,
        'Total P&L': d.total_pnl,
        trades: d.total
    }));

    // Find best and worst days
    const bestDay = data.reduce((prev, current) =>
        (current.total_pnl > prev.total_pnl) ? current : prev
    );
    const worstDay = data.reduce((prev, current) =>
        (current.total_pnl < prev.total_pnl) ? current : prev
    );

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold neon-text-cyan mb-2">Performance by Day of Week</h3>
                <p className="text-sm text-gray-400">Which days are most profitable?</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                        dataKey="day"
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
                    <Legend />
                    <Bar dataKey="Total P&L" fill="#00f5ff" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Win Rate" fill="#39ff14" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            {/* Best and worst days */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Best Day</div>
                    <div className="text-2xl font-bold neon-text-green">{bestDay.day_name}</div>
                    <div className="text-sm text-emerald-500">${bestDay.total_pnl.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{bestDay.total} trades</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Worst Day</div>
                    <div className="text-2xl font-bold text-red-500">{worstDay.day_name}</div>
                    <div className="text-sm text-red-500">${worstDay.total_pnl.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{worstDay.total} trades</div>
                </div>
            </div>
        </div>
    );
}

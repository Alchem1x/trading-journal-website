'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TimeOfDayChartProps {
    data: Array<{
        hour: number;
        total: number;
        wins: number;
        losses: number;
        win_rate: number;
        avg_pnl: number;
        total_pnl: number;
    }>;
}

export default function TimeOfDayChart({ data }: TimeOfDayChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-400 py-12">
                <p>No time-of-day data available</p>
                <p className="text-sm mt-2">Log trades with entry times to see this analysis</p>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        hour: `${d.hour}:00`,
        winRate: d.win_rate,
        pnl: d.total_pnl,
        trades: d.total
    }));

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold neon-text-cyan mb-2">Performance by Hour</h3>
                <p className="text-sm text-gray-400">Win rate and P&L by trading hour</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                        dataKey="hour"
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
                    <Bar dataKey="winRate" name="Win Rate (%)" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.winRate >= 50 ? '#39ff14' : '#ff0055'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Best trading hours */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {data.slice(0, 4).map((d, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-2xl font-bold neon-text-cyan">{d.hour}:00</div>
                        <div className="text-xs text-gray-400">{d.total} trades</div>
                        <div className={`text-sm font-semibold ${d.win_rate >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {d.win_rate.toFixed(1)}% WR
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

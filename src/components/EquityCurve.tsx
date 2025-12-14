'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface EquityCurveData {
    timestamp: string;
    cumulative_pnl: number;
}

export default function EquityCurve() {
    const [data, setData] = useState<EquityCurveData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEquityCurve();
    }, []);

    const fetchEquityCurve = async () => {
        try {
            const response = await fetch('/api/equity-curve');
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error('Error fetching equity curve:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Equity Curve</h2>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Equity Curve</h2>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">No trade data available</p>
                </div>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map((item, index) => ({
        trade: index + 1,
        pnl: item.cumulative_pnl,
        date: new Date(item.timestamp).toLocaleDateString()
    }));

    // Determine if overall profitable
    const finalPnL = data[data.length - 1]?.cumulative_pnl || 0;
    const lineColor = finalPnL >= 0 ? '#10b981' : '#ef4444';

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Equity Curve</h2>
                <div className="text-sm text-gray-400">
                    Total: <span className={finalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        ${finalPnL.toFixed(2)}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="trade"
                        stroke="#9ca3af"
                        label={{ value: 'Trade Number', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        label={{ value: 'Cumulative P&L ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                        labelFormatter={(label) => `Trade #${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="pnl"
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';

interface StrategyStats {
    strategy: string;
    count: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_pnl: number;
    total_pnl: number;
}

export default function StrategyPerformance() {
    const [data, setData] = useState<StrategyStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStrategyStats();
    }, []);

    const fetchStrategyStats = async () => {
        try {
            const response = await fetch('/api/strategies');
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error('Error fetching strategy stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Strategy Performance</h2>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Strategy Performance</h2>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No strategy data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Strategy Performance</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Strategy</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Trades</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Win Rate</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">W/L</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Avg P&L</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Total P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((strategy, index) => (
                            <tr
                                key={strategy.strategy}
                                className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${index === 0 ? 'bg-emerald-500/5' : ''
                                    }`}
                            >
                                <td className="py-3 px-4 text-white font-medium">
                                    {strategy.strategy}
                                    {index === 0 && (
                                        <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded">
                                            Best
                                        </span>
                                    )}
                                </td>
                                <td className="text-center py-3 px-4 text-gray-300">
                                    {strategy.count}
                                </td>
                                <td className="text-center py-3 px-4">
                                    <span className={`font-semibold ${strategy.win_rate >= 60 ? 'text-emerald-500' :
                                            strategy.win_rate >= 50 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {strategy.win_rate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="text-center py-3 px-4 text-gray-400 text-sm">
                                    {strategy.wins}W / {strategy.losses}L
                                </td>
                                <td className={`text-right py-3 px-4 font-medium ${strategy.avg_pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    ${strategy.avg_pnl.toFixed(2)}
                                </td>
                                <td className={`text-right py-3 px-4 font-bold ${strategy.total_pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    ${strategy.total_pnl.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-400">Total Strategies:</span>
                        <span className="ml-2 text-white font-semibold">{data.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Best Strategy:</span>
                        <span className="ml-2 text-emerald-500 font-semibold">{data[0]?.strategy}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Best Win Rate:</span>
                        <span className="ml-2 text-emerald-500 font-semibold">
                            {Math.max(...data.map(s => s.win_rate)).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

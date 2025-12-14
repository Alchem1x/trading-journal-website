'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaTimes, FaSortUp, FaSortDown } from 'react-icons/fa';

interface Trade {
    id: number;
    timestamp: string;
    session: string;
    strategy: string;
    result: string;
    pnl: number;
    rr: string;
    mistake: string;
    emotion: string | null;
    screenshot_url: string | null;
    trade_type: string;
    setup_grade: string | null;
    log_date: string | null;
    entry_time: string | null;
}

export default function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [resultFilter, setResultFilter] = useState<string>('all');
    const [strategyFilter, setStrategyFilter] = useState<string>('all');
    const [gradeFilter, setGradeFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Sorting
    const [sortField, setSortField] = useState<keyof Trade>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const tradesPerPage = 20;

    useEffect(() => {
        fetchTrades();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [trades, resultFilter, strategyFilter, gradeFilter, typeFilter, sortField, sortDirection]);

    const fetchTrades = async () => {
        try {
            const response = await fetch('/api/trades');
            const data = await response.json();
            setTrades(data.trades);
        } catch (error) {
            console.error('Error fetching trades:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...trades];

        // Apply filters
        if (resultFilter !== 'all') {
            filtered = filtered.filter(t => t.result === resultFilter);
        }
        if (strategyFilter !== 'all') {
            filtered = filtered.filter(t => t.strategy === strategyFilter);
        }
        if (gradeFilter !== 'all') {
            filtered = filtered.filter(t => t.setup_grade === gradeFilter);
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.trade_type === typeFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        setFilteredTrades(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSort = (field: keyof Trade) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const clearFilters = () => {
        setResultFilter('all');
        setStrategyFilter('all');
        setGradeFilter('all');
        setTypeFilter('all');
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Time', 'Type', 'Session', 'Strategy', 'Result', 'P&L', 'R:R', 'Grade', 'Emotion', 'Mistake'];
        const rows = filteredTrades.map(t => [
            new Date(t.timestamp).toLocaleDateString(),
            t.entry_time || new Date(t.timestamp).toLocaleTimeString(),
            t.trade_type,
            t.session,
            t.strategy,
            t.result,
            t.pnl,
            t.rr,
            t.setup_grade || '',
            t.emotion || '',
            t.mistake
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Get unique values for filters
    const uniqueStrategies = Array.from(new Set(trades.map(t => t.strategy)));
    const activeFiltersCount = [resultFilter, strategyFilter, gradeFilter, typeFilter].filter(f => f !== 'all').length;

    // Pagination
    const indexOfLastTrade = currentPage * tradesPerPage;
    const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
    const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade);
    const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-screen">
                <p className="text-white text-xl">Loading trades...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Trade History</h1>
                    <p className="text-gray-400">
                        {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
                        {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={filteredTrades.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaDownload />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white">
                        <FaFilter />
                        <span className="font-semibold">Filters</span>
                    </div>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                            Clear all
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Result Filter */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Result</label>
                        <select
                            value={resultFilter}
                            onChange={(e) => setResultFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Results</option>
                            <option value="Win">Win</option>
                            <option value="Loss">Loss</option>
                            <option value="BE">Breakeven</option>
                        </select>
                    </div>

                    {/* Strategy Filter */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Strategy</label>
                        <select
                            value={strategyFilter}
                            onChange={(e) => setStrategyFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Strategies</option>
                            {uniqueStrategies.map(strategy => (
                                <option key={strategy} value={strategy}>{strategy}</option>
                            ))}
                        </select>
                    </div>

                    {/* Grade Filter */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Setup Grade</label>
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Grades</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Trade Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Live">Live</option>
                            <option value="Backtest">Backtest</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                                    <div className="flex items-center gap-2">
                                        Date
                                        {sortField === 'timestamp' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Time</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('session')}>
                                    <div className="flex items-center gap-2">
                                        Session
                                        {sortField === 'session' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('strategy')}>
                                    <div className="flex items-center gap-2">
                                        Strategy
                                        {sortField === 'strategy' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </div>
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('result')}>
                                    <div className="flex items-center justify-center gap-2">
                                        Result
                                        {sortField === 'result' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </div>
                                </th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('pnl')}>
                                    <div className="flex items-center justify-end gap-2">
                                        P&L
                                        {sortField === 'pnl' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </div>
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Grade</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Emotion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTrades.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12 text-gray-500">
                                        No trades found
                                    </td>
                                </tr>
                            ) : (
                                currentTrades.map((trade) => (
                                    <tr key={trade.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3 px-4 text-white">
                                            {new Date(trade.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">
                                            {trade.entry_time || new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded ${trade.trade_type === 'Live' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {trade.trade_type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{trade.session}</td>
                                        <td className="py-3 px-4 text-white">{trade.strategy}</td>
                                        <td className="text-center py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${trade.result === 'Win' ? 'bg-emerald-500/20 text-emerald-500' :
                                                    trade.result === 'Loss' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {trade.result}
                                            </span>
                                        </td>
                                        <td className={`text-right py-3 px-4 font-semibold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            ${trade.pnl.toFixed(2)}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {trade.setup_grade ? (
                                                <span className="text-white font-semibold">{trade.setup_grade}</span>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">
                                            {trade.emotion || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Showing {indexOfFirstTrade + 1} to {Math.min(indexOfLastTrade, filteredTrades.length)} of {filteredTrades.length} trades
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded ${currentPage === pageNum
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

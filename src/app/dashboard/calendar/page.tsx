'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { getTradingDayColor } from '@/lib/utils';

interface CalendarData {
    calendarData: Array<{
        date: string;
        pnl: number;
        trades: number;
        wins: number;
        losses: number;
    }>;
    streaks: {
        longest_win_streak: number;
        longest_loss_streak: number;
        current_streak_type: 'win' | 'loss' | 'none';
        current_streak_count: number;
    };
    month: string;
}

interface DayTrades {
    date: string;
    trades: any[];
}

export default function CalendarPage() {
    const { data: session } = useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<CalendarData | null>(null);
    const [selectedDay, setSelectedDay] = useState<DayTrades | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchCalendarData();
        }
    }, [session, currentDate]);

    const fetchCalendarData = async () => {
        try {
            const monthParam = format(currentDate, 'yyyy-MM-dd');
            const res = await fetch(`/api/calendar?month=${monthParam}`);
            const calendarData = await res.json();
            setData(calendarData);
        } catch (error) {
            console.error('Error fetching calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDayClick = async (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        try {
            const res = await fetch(`/api/calendar/${dateStr}`);
            const dayData = await res.json();
            setSelectedDay({ date: dateStr, trades: dayData.trades });
        } catch (error) {
            console.error('Error fetching day trades:', error);
        }
    };

    const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text="Loading calendar..." />
            </div>
        );
    }

    if (!data) {
        return <div className="p-6 text-center text-gray-400">Unable to load calendar data</div>;
    }

    // Generate calendar days
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get P&L for each day
    const getDayPnL = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return data.calendarData.find(d => d.date === dateStr);
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8 fade-in">
                <h1 className="text-4xl font-bold neon-text-cyan mb-2 flex items-center gap-3">
                    <FaCalendarAlt />
                    Trading Calendar
                </h1>
                <p className="text-gray-400 text-lg">Visual overview of your trading activity</p>
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card glowColor="green">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <FaFire className="text-3xl neon-text-green" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Longest Win Streak</div>
                            <div className="text-3xl font-bold neon-text-green">
                                {data.streaks.longest_win_streak}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="magenta">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <FaFire className="text-3xl text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Longest Loss Streak</div>
                            <div className="text-3xl font-bold text-red-500">
                                {data.streaks.longest_loss_streak}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card glowColor="cyan">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg">
                            <FaFire className={`text-3xl ${data.streaks.current_streak_type === 'win' ? 'neon-text-green' : data.streaks.current_streak_type === 'loss' ? 'text-red-500' : 'text-gray-500'}`} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Current Streak</div>
                            <div className="text-3xl font-bold text-white">
                                {data.streaks.current_streak_count} {data.streaks.current_streak_type === 'win' ? 'W' : data.streaks.current_streak_type === 'loss' ? 'L' : '-'}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Calendar */}
            <Card>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <FaChevronLeft className="text-cyan-500" />
                    </button>
                    <h2 className="text-2xl font-bold neon-text-cyan">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <FaChevronRight className="text-cyan-500" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">
                            {day}
                        </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Calendar days */}
                    {daysInMonth.map(date => {
                        const dayData = getDayPnL(date);
                        const hasData = !!dayData;
                        const bgColor = hasData ? getTradingDayColor(dayData.pnl) : 'bg-gray-800';

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => hasData && handleDayClick(date)}
                                className={`aspect-square rounded-lg border border-gray-700 hover:border-cyan-500 transition-all ${bgColor} ${hasData ? 'cursor-pointer hover:scale-105' : 'cursor-default'} flex flex-col items-center justify-center p-2`}
                            >
                                <div className="text-white font-semibold">{format(date, 'd')}</div>
                                {hasData && (
                                    <>
                                        <div className={`text-xs font-bold ${dayData.pnl >= 0 ? 'text-white' : 'text-white'}`}>
                                            ${dayData.pnl.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-gray-300">{dayData.trades}T</div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded" />
                        <span className="text-gray-400">Profit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        <span className="text-gray-400">Loss</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 rounded" />
                        <span className="text-gray-400">Break Even</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded" />
                        <span className="text-gray-400">No Trades</span>
                    </div>
                </div>
            </Card>

            {/* Day Detail Modal */}
            {selectedDay && (
                <Modal
                    isOpen={!!selectedDay}
                    onClose={() => setSelectedDay(null)}
                    title={`Trades on ${format(new Date(selectedDay.date), 'MMMM d, yyyy')}`}
                    size="lg"
                >
                    <div className="space-y-4">
                        {selectedDay.trades.map((trade, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`text-lg font-bold ${trade.result === 'Win' ? 'text-emerald-500' : trade.result === 'Loss' ? 'text-red-500' : 'text-gray-400'}`}>
                                            {trade.result}
                                        </span>
                                        <span className="text-gray-400 ml-2">#{trade.id}</span>
                                    </div>
                                    <div className={`text-xl font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        ${trade.pnl.toFixed(2)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-400">Strategy:</span> {trade.strategy}</div>
                                    <div><span className="text-gray-400">Session:</span> {trade.session}</div>
                                    <div><span className="text-gray-400">R:R:</span> {trade.rr}</div>
                                    {trade.entry_time && <div><span className="text-gray-400">Time:</span> {trade.entry_time}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    );
}

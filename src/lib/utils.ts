/**
 * Utility functions for the trading journal
 */

import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend } from 'date-fns';

/**
 * Format currency with proper sign and decimals
 */
export function formatCurrency(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
}

/**
 * Format percentage with proper sign
 */
export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format date from ISO string
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
    try {
        return format(parseISO(dateString), formatStr);
    } catch {
        return dateString;
    }
}

/**
 * Get color class based on P&L value
 */
export function getPnLColor(pnl: number): string {
    if (pnl > 0) return 'text-emerald-500 neon-text-green';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-400';
}

/**
 * Get week range for a given date
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
    return {
        start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(date, { weekStartsOn: 1 })
    };
}

/**
 * Get all days in a week
 */
export function getWeekDays(date: Date): Date[] {
    const { start, end } = getWeekRange(date);
    return eachDayOfInterval({ start, end });
}

/**
 * Calculate win rate
 */
export function calculateWinRate(wins: number, total: number): number {
    if (total === 0) return 0;
    return (wins / total) * 100;
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(grossProfit: number, grossLoss: number): number {
    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
    return grossProfit / Math.abs(grossLoss);
}

/**
 * Calculate expectancy
 */
export function calculateExpectancy(
    winRate: number,
    avgWin: number,
    avgLoss: number
): number {
    return (winRate / 100 * avgWin) - ((100 - winRate) / 100 * Math.abs(avgLoss));
}

/**
 * Get trading day color for calendar (based on P&L)
 */
export function getTradingDayColor(pnl: number): string {
    if (pnl > 0) {
        // Green intensity based on profit
        if (pnl > 500) return 'bg-emerald-500';
        if (pnl > 200) return 'bg-emerald-400';
        if (pnl > 50) return 'bg-emerald-300';
        return 'bg-emerald-200';
    } else if (pnl < 0) {
        // Red intensity based on loss
        if (pnl < -500) return 'bg-red-500';
        if (pnl < -200) return 'bg-red-400';
        if (pnl < -50) return 'bg-red-300';
        return 'bg-red-200';
    }
    return 'bg-gray-600'; // Break even
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

/**
 * Calculate Sharpe Ratio (simplified)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;
    return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = equityCurve[0];

    for (const value of equityCurve) {
        if (value > peak) {
            peak = value;
        }
        const drawdown = ((peak - value) / peak) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
}

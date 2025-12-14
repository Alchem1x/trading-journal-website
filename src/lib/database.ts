/**
 * Database utilities for Trading Journal
 * Provides user-specific query functions for SQLite database
 * Mirrors Python database.py functionality
 */

import Database from 'better-sqlite3';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'trades.db');

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database.Database {
    if (!db) {
        db = new Database(DATABASE_PATH, { readonly: true });
    }
    return db;
}

/**
 * Trade interface matching database schema
 */
export interface Trade {
    id: number;
    user_id: number;
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

/**
 * User statistics interface
 */
export interface UserStats {
    total_trades: number;
    wins: number;
    losses: number;
    breakeven: number;
    total_pnl: number;
    win_rate: number;
}

/**
 * Get recent trades for a specific user
 */
export function getUserTrades(userId: number, limit: number = 50, tradeType?: string): Trade[] {
    const db = getDatabase();

    let query = `
    SELECT * FROM trades
    WHERE user_id = ?
    ${tradeType ? 'AND trade_type = ?' : ''}
    ORDER BY timestamp DESC
    LIMIT ?
  `;

    const params = tradeType ? [userId, tradeType, limit] : [userId, limit];
    const stmt = db.prepare(query);
    return stmt.all(...params) as Trade[];
}

/**
 * Get user statistics
 */
export function getUserStats(userId: number): UserStats {
    const db = getDatabase();

    // Total trades
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM trades WHERE user_id = ?');
    const { total } = totalStmt.get(userId) as { total: number };

    // Result counts
    const resultsStmt = db.prepare(`
    SELECT result, COUNT(*) as count 
    FROM trades 
    WHERE user_id = ? 
    GROUP BY result
  `);
    const results = resultsStmt.all(userId) as { result: string; count: number }[];

    const wins = results.find(r => r.result === 'Win')?.count || 0;
    const losses = results.find(r => r.result === 'Loss')?.count || 0;
    const breakeven = results.find(r => r.result === 'BE')?.count || 0;

    // Total PnL
    const pnlStmt = db.prepare('SELECT SUM(pnl) as total_pnl FROM trades WHERE user_id = ?');
    const { total_pnl } = pnlStmt.get(userId) as { total_pnl: number | null };

    const winRate = total > 0 ? (wins / total) * 100 : 0;

    return {
        total_trades: total,
        wins,
        losses,
        breakeven,
        total_pnl: total_pnl || 0,
        win_rate: Math.round(winRate * 100) / 100
    };
}

/**
 * Get equity curve data (cumulative PnL over time)
 */
export function getEquityCurveData(userId: number): { timestamp: string; cumulative_pnl: number }[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT timestamp, pnl 
    FROM trades 
    WHERE user_id = ? 
    ORDER BY timestamp ASC
  `);

    const trades = stmt.all(userId) as { timestamp: string; pnl: number }[];

    let cumulativePnl = 0;
    return trades.map(trade => {
        cumulativePnl += trade.pnl;
        return {
            timestamp: trade.timestamp,
            cumulative_pnl: Math.round(cumulativePnl * 100) / 100
        };
    });
}

/**
 * Get setup grade statistics
 */
export interface SetupGradeStats {
    [grade: string]: {
        count: number;
        wins: number;
        losses: number;
        win_rate: number;
        avg_pnl: number;
        total_pnl: number;
    };
}

export function getSetupGradeStats(userId: number, tradeType?: string): SetupGradeStats {
    const db = getDatabase();

    const query = `
    SELECT 
      setup_grade,
      COUNT(*) as count,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses,
      AVG(pnl) as avg_pnl,
      SUM(pnl) as total_pnl
    FROM trades
    WHERE user_id = ? 
      AND setup_grade IS NOT NULL
      ${tradeType ? 'AND trade_type = ?' : ''}
    GROUP BY setup_grade
    ORDER BY setup_grade
  `;

    const params = tradeType ? [userId, tradeType] : [userId];
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    const stats: SetupGradeStats = {};

    rows.forEach(row => {
        const winRate = row.count > 0 ? (row.wins / row.count) * 100 : 0;
        stats[row.setup_grade] = {
            count: row.count,
            wins: row.wins,
            losses: row.losses,
            win_rate: Math.round(winRate * 100) / 100,
            avg_pnl: Math.round((row.avg_pnl || 0) * 100) / 100,
            total_pnl: Math.round((row.total_pnl || 0) * 100) / 100
        };
    });

    return stats;
}

/**
 * Get strategy performance breakdown
 */
export interface StrategyStats {
    strategy: string;
    count: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_pnl: number;
    total_pnl: number;
}

export function getStrategyStats(userId: number): StrategyStats[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      strategy,
      COUNT(*) as count,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses,
      AVG(pnl) as avg_pnl,
      SUM(pnl) as total_pnl
    FROM trades
    WHERE user_id = ?
    GROUP BY strategy
    ORDER BY total_pnl DESC
  `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
        strategy: row.strategy,
        count: row.count,
        wins: row.wins,
        losses: row.losses,
        win_rate: Math.round((row.wins / row.count) * 100 * 100) / 100,
        avg_pnl: Math.round((row.avg_pnl || 0) * 100) / 100,
        total_pnl: Math.round((row.total_pnl || 0) * 100) / 100
    }));
}

/**
 * Get current win/loss streak
 */
export function getCurrentStreak(userId: number): { type: 'win' | 'loss' | 'none'; count: number } {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT result 
    FROM trades 
    WHERE user_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 20
  `);

    const trades = stmt.all(userId) as { result: string }[];

    if (trades.length === 0) {
        return { type: 'none', count: 0 };
    }

    const firstResult = trades[0].result;
    if (firstResult === 'BE') {
        return { type: 'none', count: 0 };
    }

    let streak = 0;
    for (const trade of trades) {
        if (trade.result === firstResult) {
            streak++;
        } else {
            break;
        }
    }

    return {
        type: firstResult === 'Win' ? 'win' : 'loss',
        count: streak
    };
}

/**
 * Get performance by time of day (hourly)
 */
export interface TimeOfDayStats {
    hour: number;
    total: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_pnl: number;
    total_pnl: number;
}

export function getTimeOfDayStats(userId: number): TimeOfDayStats[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      CAST(substr(entry_time, 1, 2) AS INTEGER) as hour,
      COUNT(*) as total,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses,
      AVG(pnl) as avg_pnl,
      SUM(pnl) as total_pnl
    FROM trades
    WHERE user_id = ? AND entry_time IS NOT NULL
    GROUP BY hour
    ORDER BY hour
  `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
        hour: row.hour,
        total: row.total,
        wins: row.wins,
        losses: row.losses,
        win_rate: Math.round((row.wins / row.total) * 100 * 100) / 100,
        avg_pnl: Math.round((row.avg_pnl || 0) * 100) / 100,
        total_pnl: Math.round((row.total_pnl || 0) * 100) / 100
    }));
}

/**
 * Get performance by day of week
 */
export interface DayOfWeekStats {
    day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
    day_name: string;
    total: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_pnl: number;
    total_pnl: number;
}

export function getDayOfWeekStats(userId: number): DayOfWeekStats[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      CAST(strftime('%w', log_date) AS INTEGER) as day_of_week,
      COUNT(*) as total,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses,
      AVG(pnl) as avg_pnl,
      SUM(pnl) as total_pnl
    FROM trades
    WHERE user_id = ? AND log_date IS NOT NULL
    GROUP BY day_of_week
    ORDER BY day_of_week
  `);

    const rows = stmt.all(userId) as any[];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return rows.map(row => ({
        day_of_week: row.day_of_week,
        day_name: dayNames[row.day_of_week],
        total: row.total,
        wins: row.wins,
        losses: row.losses,
        win_rate: Math.round((row.wins / row.total) * 100 * 100) / 100,
        avg_pnl: Math.round((row.avg_pnl || 0) * 100) / 100,
        total_pnl: Math.round((row.total_pnl || 0) * 100) / 100
    }));
}

/**
 * Get R:R efficiency (actual vs target)
 */
export interface RREfficiency {
    target_rr: string;
    count: number;
    wins: number;
    avg_actual_rr: number;
    efficiency: number; // percentage of target achieved
}

export function getRREfficiency(userId: number): RREfficiency[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      rr as target_rr,
      COUNT(*) as count,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      AVG(CASE WHEN result = 'Win' THEN pnl ELSE 0 END) as avg_win_pnl
    FROM trades
    WHERE user_id = ?
    GROUP BY rr
    ORDER BY count DESC
  `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => {
        // Parse target R:R (e.g., "1:3" -> 3)
        const targetRatio = parseFloat(row.target_rr.split(':')[1] || '1');
        const actualRatio = row.avg_win_pnl / 100; // Simplified calculation
        const efficiency = (actualRatio / targetRatio) * 100;

        return {
            target_rr: row.target_rr,
            count: row.count,
            wins: row.wins,
            avg_actual_rr: Math.round(actualRatio * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100
        };
    });
}

/**
 * Get mistake frequency and cost
 */
export interface MistakeStats {
    mistake: string;
    frequency: number;
    total_cost: number;
    avg_cost: number;
    percentage: number;
}

export function getMistakeStats(userId: number): MistakeStats[] {
    const db = getDatabase();

    // Get total trades with mistakes
    const totalStmt = db.prepare(`
    SELECT COUNT(*) as total 
    FROM trades 
    WHERE user_id = ? AND mistake != 'None'
  `);
    const { total } = totalStmt.get(userId) as { total: number };

    const stmt = db.prepare(`
    SELECT 
      mistake,
      COUNT(*) as frequency,
      SUM(pnl) as total_cost,
      AVG(pnl) as avg_cost
    FROM trades
    WHERE user_id = ? AND mistake != 'None'
    GROUP BY mistake
    ORDER BY frequency DESC
  `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
        mistake: row.mistake,
        frequency: row.frequency,
        total_cost: Math.round((row.total_cost || 0) * 100) / 100,
        avg_cost: Math.round((row.avg_cost || 0) * 100) / 100,
        percentage: total > 0 ? Math.round((row.frequency / total) * 100 * 100) / 100 : 0
    }));
}

/**
 * Get mistake trends over time (last 30 days)
 */
export interface MistakeTrend {
    date: string;
    mistake: string;
    count: number;
}

export function getMistakeTrends(userId: number, days: number = 30): MistakeTrend[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      DATE(log_date) as date,
      mistake,
      COUNT(*) as count
    FROM trades
    WHERE user_id = ? 
      AND mistake != 'None'
      AND log_date >= date('now', '-${days} days')
    GROUP BY date, mistake
    ORDER BY date DESC
  `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
        date: row.date,
        mistake: row.mistake,
        count: row.count
    }));
}

/**
 * Get calendar heatmap data (daily P&L)
 */
export interface CalendarDay {
    date: string;
    pnl: number;
    trades: number;
    wins: number;
    losses: number;
}

export function getCalendarData(userId: number, startDate: string, endDate: string): CalendarDay[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT 
      DATE(log_date) as date,
      SUM(pnl) as pnl,
      COUNT(*) as trades,
      SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses
    FROM trades
    WHERE user_id = ? 
      AND log_date BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date
  `);

    const rows = stmt.all(userId, startDate, endDate) as any[];

    return rows.map(row => ({
        date: row.date,
        pnl: Math.round((row.pnl || 0) * 100) / 100,
        trades: row.trades,
        wins: row.wins,
        losses: row.losses
    }));
}

/**
 * Get trades for a specific day
 */
export function getTradesForDay(userId: number, date: string): Trade[] {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT * FROM trades
    WHERE user_id = ? AND DATE(log_date) = ?
    ORDER BY timestamp DESC
  `);

    return stmt.all(userId, date) as Trade[];
}

/**
 * Calculate longest streaks
 */
export interface StreakInfo {
    longest_win_streak: number;
    longest_loss_streak: number;
    current_streak_type: 'win' | 'loss' | 'none';
    current_streak_count: number;
}

export function getStreakInfo(userId: number): StreakInfo {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT result FROM trades
    WHERE user_id = ?
    ORDER BY timestamp ASC
  `);

    const trades = stmt.all(userId) as { result: string }[];

    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentStreak = 0;
    let currentType: 'win' | 'loss' | 'none' = 'none';

    for (let i = 0; i < trades.length; i++) {
        const result = trades[i].result;

        if (result === 'BE') {
            currentStreak = 0;
            currentType = 'none';
            continue;
        }

        if (i === 0 || trades[i - 1].result === 'BE' || trades[i - 1].result !== result) {
            currentStreak = 1;
            currentType = result === 'Win' ? 'win' : 'loss';
        } else {
            currentStreak++;
        }

        if (result === 'Win' && currentStreak > longestWinStreak) {
            longestWinStreak = currentStreak;
        } else if (result === 'Loss' && currentStreak > longestLossStreak) {
            longestLossStreak = currentStreak;
        }
    }

    // Get current streak
    const currentStreakData = getCurrentStreak(userId);

    return {
        longest_win_streak: longestWinStreak,
        longest_loss_streak: longestLossStreak,
        current_streak_type: currentStreakData.type,
        current_streak_count: currentStreakData.count
    };
}


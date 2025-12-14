/**
 * Neon-styled Card Component
 */

'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    glowColor?: 'cyan' | 'green' | 'magenta' | 'purple';
    hover?: boolean;
}

export default function Card({ children, className = '', glowColor = 'cyan', hover = true }: CardProps) {
    const glowClasses = {
        cyan: 'border-cyan-500/30 hover:neon-glow-cyan',
        green: 'border-emerald-500/30 hover:neon-glow-green',
        magenta: 'border-fuchsia-500/30 hover:neon-glow-magenta',
        purple: 'border-purple-500/30 hover:border-purple-500/50'
    };

    return (
        <div className={`bg-gray-900 border rounded-lg p-6 transition-all duration-300 ${glowClasses[glowColor]} ${hover ? 'hover:scale-[1.02]' : ''} ${className}`}>
            {children}
        </div>
    );
}

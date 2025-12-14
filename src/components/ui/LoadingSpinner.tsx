/**
 * Loading Spinner Component
 */

'use client';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin`} />
            {text && <p className="text-gray-400 neon-text-cyan">{text}</p>}
        </div>
    );
}

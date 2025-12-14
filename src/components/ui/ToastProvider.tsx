/**
 * Toast Notification Provider
 * Wraps the app to provide toast notifications
 */

'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #00f5ff',
                    boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
                },
                success: {
                    iconTheme: {
                        primary: '#39ff14',
                        secondary: '#1a1a1a',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ff0055',
                        secondary: '#1a1a1a',
                    },
                },
            }}
        />
    );
}

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaDiscord, FaChartLine, FaLock, FaBrain } from 'react-icons/fa';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen animated-gradient text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // Show dashboard if authenticated (during redirect)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen animated-gradient text-white flex items-center justify-center">
        <div className="text-2xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient text-white">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl text-center">
          {/* Logo/Title */}
          <div className="mb-8 flex items-center justify-center gap-3 slide-in-up">
            <FaChartLine className="text-5xl neon-text-cyan pulse-glow" />
            <h1 className="text-5xl font-bold tracking-tight neon-text-cyan">
              Trading Journal
            </h1>
          </div>

          {/* Tagline */}
          <p className="mb-12 text-2xl text-gray-300 slide-in-up">
            Your Trading Performance, <span className="neon-text-magenta">Visualized</span>
          </p>

          {/* Description */}
          <p className="mb-12 text-lg text-gray-400 max-w-2xl mx-auto slide-in-up">
            Analyze your trades, track your progress, and improve your edge with
            professional-grade analytics. Seamlessly integrated with your Discord trading journal.
          </p>

          {/* Login Button */}
          <button
            onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
            className="group relative inline-flex items-center gap-3 rounded-lg bg-[#5865F2] px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-110 neon-glow-cyan pulse-glow slide-in-up"
          >
            <FaDiscord className="text-2xl" />
            Login with Discord
            <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="rounded-lg bg-gray-800/50 p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <FaChartLine className="text-3xl text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Interactive Charts</h3>
              <p className="text-gray-400">
                Visualize your equity curve, setup grades, and strategy performance with beautiful, interactive charts.
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <FaLock className="text-3xl text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-400">
                Your data is yours alone. User-specific isolation ensures complete privacy and security.
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <FaBrain className="text-3xl text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-400">
                Discover patterns in your trading with setup grade analysis, emotional state tracking, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

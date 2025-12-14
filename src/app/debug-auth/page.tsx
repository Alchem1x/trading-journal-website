import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DebugAuth() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">Auth Debug Page</h1>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Session Data:</h2>
                <pre className="bg-gray-950 p-4 rounded overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Environment Variables:</h2>
                <ul className="space-y-2">
                    <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing'}</li>
                    <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}</li>
                    <li>DISCORD_CLIENT_ID: {process.env.DISCORD_CLIENT_ID ? '✅ Set' : '❌ Missing'}</li>
                    <li>DISCORD_CLIENT_SECRET: {process.env.DISCORD_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</li>
                </ul>
            </div>
        </div>
    );
}

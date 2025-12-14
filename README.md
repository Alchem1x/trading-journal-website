# Trading Journal Website

A professional trading journal web dashboard with Discord OAuth authentication. View and analyze your trading data from your Discord bot in a beautiful, interactive web interface.

## Features

- 🔐 **Discord OAuth Login** - Secure authentication using your Discord account
- 📊 **Interactive Dashboard** - View key metrics (total trades, win rate, P&L, streaks)
- 📈 **Data Visualization** - Equity curves, setup grade analysis, strategy performance
- 🔒 **Privacy First** - User-specific data isolation ensures complete privacy
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Prerequisites

- Node.js 18+ installed
- Discord bot with trades database (`trades.db`)
- Discord Developer Application for OAuth

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create a new one)
3. Navigate to **OAuth2** → **General**
4. Add redirect URL: `http://localhost:3000/api/auth/callback` (for local development)
5. Copy your **Client ID** and **Client Secret**

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Discord OAuth (from Discord Developer Portal)
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here

# Database Path (path to trades.db from Discord bot)
DATABASE_PATH=../trades.db
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configure Database Path

Make sure `DATABASE_PATH` in `.env.local` points to your Discord bot's `trades.db` file.

Example paths:
- Same directory: `./trades.db`
- Parent directory: `../trades.db`
- Absolute path: `/path/to/TradingJournal_Zaloha/trades.db`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL, e.g., `https://your-domain.com`)
   - `NEXTAUTH_SECRET`
   - `DATABASE_PATH` (configure based on your deployment setup)
4. Deploy!

### 3. Update Discord OAuth Redirect

After deployment, add your production callback URL to Discord:
- Go to Discord Developer Portal → OAuth2
- Add redirect: `https://your-domain.com/api/auth/callback`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API routes
│   │   └── stats/               # User statistics API
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   └── page.tsx            # Dashboard home page
│   └── page.tsx                # Landing page with login
├── components/
│   └── Sidebar.tsx             # Navigation sidebar
└── lib/
    ├── auth.ts                 # NextAuth configuration
    └── database.ts             # Database query functions
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** NextAuth.js with Discord OAuth
- **Database:** SQLite (better-sqlite3)
- **Styling:** Tailwind CSS
- **Icons:** React Icons
- **Language:** TypeScript

## Troubleshooting

### "Database not found" error
- Check that `DATABASE_PATH` in `.env.local` is correct
- Ensure the Discord bot has created `trades.db`
- Try using an absolute path

### OAuth redirect error
- Verify redirect URL matches exactly in Discord Developer Portal
- Check `NEXTAUTH_URL` in `.env.local`
- Ensure no trailing slashes in URLs

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check browser console for errors

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT


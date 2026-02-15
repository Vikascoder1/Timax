# Quick Start - Fix the 404 Error

## The Problem
You're seeing a 404 error because Supabase environment variables are not set up.

## Quick Fix (2 minutes)

### Step 1: Create `.env.local` file

In your project root (`/home/hcode/magnetik/timax/`), create a file named `.env.local`:

```bash
cd /home/hcode/magnetik/timax
touch .env.local
```

### Step 2: Get Supabase Credentials

1. **If you don't have a Supabase account yet:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up (free)
   - Create a new project (takes ~2 minutes)

2. **Get your API keys:**
   - In Supabase dashboard → Your Project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (starts with `eyJ...`)

### Step 3: Add to `.env.local`

Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace** `your-project-id` and `your-anon-key-here` with your actual values from Step 2.

### Step 4: Restart Dev Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
yarn dev
```

## That's it!

After restarting, the signup/login should work. The 404 error will be gone.

## Need Help?

See `SETUP_SUPABASE.md` for complete setup instructions including database table creation.


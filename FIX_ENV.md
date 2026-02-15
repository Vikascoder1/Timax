# Fix Your Environment Variables

## ❌ Current Problem

Your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3000/
```

This is **WRONG**! You're pointing to your local Next.js server instead of Supabase.

## ✅ Correct Setup

### Step 1: Get Your Real Supabase URL

1. Go to https://supabase.com/dashboard
2. Click on your project (or create one if you don't have it)
3. Go to **Settings** → **API**
4. Find **Project URL** - it looks like:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
5. Copy this URL

### Step 2: Update Your `.env` File

Change your `.env` file to:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ........
```

**Important:**
- ✅ Use `https://` (not `http://`)
- ✅ Use your actual Supabase project URL (not `localhost:3000`)
- ✅ Remove trailing slash (no `/` at the end)
- ✅ The URL should end with `.supabase.co`

### Step 3: Restart Dev Server

```bash
# Stop your server (Ctrl+C)
# Then restart:
yarn dev
```

## Example of Correct Format

```env
# ✅ CORRECT
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ❌ WRONG (what you have now)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3000/
```

## Still Getting 404?

1. Make sure you've restarted your dev server after changing `.env`
2. Check that your Supabase project is active (not paused)
3. Verify the URL in Supabase dashboard matches what's in your `.env`
4. Make sure there's no trailing slash in the URL


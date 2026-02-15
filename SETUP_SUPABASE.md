# Supabase Setup Guide

## Step 1: Create Supabase Account (Free)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - Project name: `timax` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to you
   - Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep this secret!)

## Step 3: Set Environment Variables

1. Copy the template file:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Important**: Replace the placeholder values with your actual Supabase URL and anon key from Step 2.

3. Restart your development server after creating `.env.local`:
   ```bash
   # Stop the server (Ctrl+C) and restart
   yarn dev
   ```

## Step 4: Create Database Table for User Profiles

In Supabase dashboard:
1. Go to **SQL Editor**
2. Run this SQL to create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Configure Authentication

In Supabase dashboard:
1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL**: `http://localhost:3000` (for development)
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## Step 6: Install Dependencies

✅ **Already installed!** The dependencies have been added to your project.

## Step 7: Test the Authentication

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to:
   - Sign up: `http://localhost:3000/auth/signup`
   - Sign in: `http://localhost:3000/auth/login`

3. Try creating an account and signing in!

## What's Been Implemented

✅ Supabase client setup (browser & server)
✅ Authentication context with React hooks
✅ Login page (`/auth/login`)
✅ Signup page (`/auth/signup`)
✅ Auth callback route for email verification
✅ Integration with checkout page
✅ User profile storage in database

## Features

- **Free Forever**: Supabase free tier includes:
  - 500MB database storage
  - 50,000 monthly active users
  - Unlimited API requests
  - Email authentication
  - Row Level Security

- **User Data Storage**: All new users are automatically saved to the `profiles` table
- **Guest Checkout**: Users can checkout without signing in
- **Secure**: All authentication handled by Supabase with industry-standard security

## Next Steps

1. Complete the Supabase setup (Steps 1-5 above)
2. Add your environment variables to `.env.local`
3. Test the authentication flow
4. Customize the user profile fields as needed


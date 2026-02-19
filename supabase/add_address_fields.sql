-- Add address fields to profiles table
-- Run this in Supabase SQL Editor

-- Add address fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS saved_first_name TEXT,
ADD COLUMN IF NOT EXISTS saved_last_name TEXT,
ADD COLUMN IF NOT EXISTS saved_address TEXT,
ADD COLUMN IF NOT EXISTS saved_apartment TEXT,
ADD COLUMN IF NOT EXISTS saved_city TEXT,
ADD COLUMN IF NOT EXISTS saved_state TEXT,
ADD COLUMN IF NOT EXISTS saved_pincode TEXT,
ADD COLUMN IF NOT EXISTS saved_country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS saved_phone TEXT;


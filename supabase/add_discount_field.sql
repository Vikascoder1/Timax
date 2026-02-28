-- Add discount field to orders table for prepaid discount feature
-- Run this in Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN orders.discount IS 'Discount amount (10% for prepaid orders)';


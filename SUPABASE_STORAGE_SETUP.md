# 📦 Supabase Storage Setup for Product Images

## 🎯 Overview
This guide will help you upload product images to Supabase Storage so they can be used in order confirmation emails.

**Why Supabase Storage?**
- Email clients require **public URLs** to display images
- Local paths like `/images/ocean.jpeg` don't work in emails
- Supabase Storage provides public URLs that work everywhere

---

## 📋 Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Enable** (check this box) - **IMPORTANT!**
   - Click **"Create bucket"**

---

## 📋 Step 2: Set Up Storage Policies

Run this SQL in **Supabase SQL Editor**:

```sql
-- Set up storage policies for public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Service role can manage"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
```

**Note**: If policies already exist, you may see an error. That's okay - the policies are already set up!

---

## 📋 Step 3: Upload Product Images

### Option A: Via Supabase Dashboard (Easiest) ⭐ Recommended

1. Go to **Storage** → **product-images** bucket
2. Click **"New folder"** and name it `products` (optional, but recommended for organization)
3. Click into the `products` folder (or stay in root)
4. Click **"Upload file"** or drag and drop
5. Upload your images from your local `/public/images/` folder:
   - `ocean.jpeg` → Upload as `products/ocean.jpeg`
   - `ocean2.jpeg` → Upload as `products/ocean2.jpeg`
   - `ocean3.jpeg` → Upload as `products/ocean3.jpeg`
   - `ocean4.jpeg` → Upload as `products/ocean4.jpeg`
   - `green.jpeg` → Upload as `products/green.jpeg`
   - `green2.jpeg` → Upload as `products/green2.jpeg`
   - `green3.jpeg` → Upload as `products/green3.jpeg`
   - `green4.jpeg` → Upload as `products/green4.jpeg`
   - `triangle.jpeg` → Upload as `products/triangle.jpeg`
   - `triangle2.jpeg` → Upload as `products/triangle2.jpeg`
   - `triangle3.jpeg` → Upload as `products/triangle3.jpeg`
   - `triangle4.jpeg` → Upload as `products/triangle4.jpeg`

**Important**: 
- Keep the **exact same filename** (e.g., `ocean.jpeg`)
- Upload to the `products/` folder path in Supabase Storage
- The system will automatically convert `/images/ocean.jpeg` → `products/ocean.jpeg` → Supabase URL

---

## 📋 Step 4: Verify Images Are Accessible

After uploading, test if images are accessible:

1. Go to **Storage** → **product-images** → Click on an image
2. Copy the **Public URL**
3. Open it in a new tab - it should display the image
4. The URL should look like:
   ```
   https://[your-project].supabase.co/storage/v1/object/public/product-images/products/ocean.jpeg
   ```

---

## ✅ What Happens Next

Once images are uploaded:

1. **Order creation** will automatically convert local image paths to Supabase Storage URLs
2. **Order confirmation emails** will use Supabase Storage URLs (which work in emails!)
3. **Images will display** correctly in email clients

---

## 🔧 Current Image Paths

Your current product images are at:
- `/images/ocean.jpeg` → Will be converted to Supabase Storage URL
- `/images/green.jpeg` → Will be converted to Supabase Storage URL
- `/images/triangle.jpeg` → Will be converted to Supabase Storage URL

The system will automatically:
1. Take the local path (e.g., `/images/ocean.jpeg`)
2. Extract filename (`ocean.jpeg`)
3. Look for it in Supabase Storage at `products/ocean.jpeg`
4. Return the public URL

---

## 🚨 Important Notes

1. **Image Names Must Match**: The filename in Supabase Storage must match the filename in your local `/images/` folder
   - Local: `/images/ocean.jpeg`
   - Supabase: `products/ocean.jpeg` ✅

2. **Public Bucket Required**: The bucket must be public for email images to work

3. **File Extensions**: Keep the same extensions (.jpeg, .jpg, .png, etc.)

---

## 🧪 Testing

After uploading images:

1. Place a test order (COD)
2. Check the order confirmation email
3. Images should now display correctly!

---

**Ready to upload your images!** 🚀


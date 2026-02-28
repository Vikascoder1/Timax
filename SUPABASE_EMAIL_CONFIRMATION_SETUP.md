# 📧 Supabase Email Confirmation Setup Guide

## Problem
After signup, users are not receiving email confirmation emails from Supabase.

## Solution: Enable Email Confirmation in Supabase

### Step 1: Enable Email Confirmation

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Auth** section
4. Find **"Enable email confirmations"** toggle
5. **Turn it ON** ✅
6. Click **Save**

### Step 2: Configure SMTP (Required for Email Sending)

Supabase needs SMTP configured to send emails. You have two options:

#### Option A: Use Supabase's Built-in Email (Limited)
- Supabase free tier has limited email sending
- May not work reliably for production

#### Option B: Configure Custom SMTP (Recommended - Use Brevo)

1. In Supabase Dashboard, go to **Settings** → **Auth** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Enter your Brevo SMTP credentials:

```
SMTP Host: smtp-relay.brevo.com
SMTP Port: 587
SMTP User: Your Brevo SMTP username (usually your Brevo account email)
SMTP Password: Your Brevo SMTP password (NOT your API key)
Sender Email: Your verified Brevo sender email (e.g., noreply@yourdomain.com)
Sender Name: MS CRAFTS
```

**How to get Brevo SMTP credentials:**
1. Go to Brevo Dashboard → **Settings** → **SMTP & API**
2. Click on **SMTP** tab
3. You'll see:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: Your Brevo account email
   - Password: Your SMTP password (create one if you don't have it)

### Step 3: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **"Confirm signup"** template if needed
3. Make sure the confirmation link points to: `{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup`

### Step 4: Set Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### Step 5: Test Email Confirmation

1. Try signing up with a test email
2. Check your email inbox (and spam folder)
3. You should receive an email with a confirmation link
4. Click the link to confirm your email
5. After confirmation, you'll receive the welcome email from Brevo

## Troubleshooting

### Email Not Received?

1. **Check Supabase Logs:**
   - Go to **Logs** → **Auth Logs**
   - Look for email sending errors

2. **Check SMTP Configuration:**
   - Verify SMTP credentials are correct
   - Test SMTP connection in Supabase

3. **Check Spam Folder:**
   - Confirmation emails might go to spam

4. **Check Email Confirmation is Enabled:**
   - Go to **Authentication** → **Settings**
   - Verify "Enable email confirmations" is ON

5. **Check Brevo Sender Email:**
   - Make sure your sender email is verified in Brevo
   - Go to Brevo → **Senders & IP** → **Senders**
   - Verify your email is listed and verified

## Current Flow

1. User signs up → `supabase.auth.signUp()` is called
2. Supabase creates user account (unconfirmed)
3. **Supabase sends confirmation email** (if enabled and SMTP configured)
4. User clicks confirmation link → Redirects to `/auth/callback`
5. Callback route exchanges code for session
6. **Welcome email is sent** via Brevo API (after confirmation)

## Important Notes

- **Email confirmation is sent by Supabase**, not by our code
- **Welcome email is sent by Brevo** after email confirmation
- If SMTP is not configured, Supabase cannot send confirmation emails
- The confirmation email uses Supabase's email system
- The welcome email uses Brevo API (separate system)


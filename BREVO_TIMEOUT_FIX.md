# 🔧 Fixing Brevo API Timeout Issues

## 🚨 Problem
Brevo API calls are timing out with `ETIMEDOUT` error. This happens when:
- Network connection is slow
- Brevo API is experiencing high load
- Email payload is large (with images)

## ✅ Solutions Applied

### 1. **Increased Timeout** (60 seconds)
- Changed from 30s to 60s timeout
- Configurable via `BREVO_TIMEOUT_MS` environment variable

### 2. **Better Retry Logic**
- Exponential backoff: 3s, 6s, 9s between retries
- Better error detection for timeout errors

### 3. **Non-Blocking Email Sending**
- Emails are sent in background (fire-and-forget)
- Order creation doesn't wait for email to complete

## 🔍 Troubleshooting

### If timeouts persist:

#### Option 1: Use Brevo SMTP Instead of API
SMTP is often more reliable than API for sending emails:

1. Get SMTP credentials from Brevo:
   - Go to **Settings → SMTP & API**
   - Copy SMTP server, port, username, password

2. Use a Node.js SMTP library like `nodemailer`:
   ```bash
   yarn add nodemailer
   ```

3. Update `lib/email.ts` to use SMTP instead of API

#### Option 2: Check Network/Firewall
- Ensure your server can reach `api.brevo.com`
- Check if firewall is blocking outbound HTTPS
- Test connectivity: `curl https://api.brevo.com/v3/smtp/email`

#### Option 3: Reduce Email Payload Size
- Compress images before uploading to Supabase
- Use smaller image dimensions in emails
- Consider using image CDN URLs instead of direct Supabase URLs

#### Option 4: Use Email Queue System
- Implement a queue (Redis, BullMQ, etc.)
- Process emails asynchronously
- Retry failed emails automatically

## 📝 Environment Variables

Add to `.env.local` if needed:

```bash
# Optional: Custom timeout (default: 60000ms = 60 seconds)
BREVO_TIMEOUT_MS=60000
```

## 🧪 Testing

1. **Test API connectivity:**
   ```bash
   curl -X POST https://api.brevo.com/v3/smtp/email \
     -H "api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"sender":{"email":"test@example.com"},"to":[{"email":"test@example.com"}],"subject":"Test","htmlContent":"<p>Test</p>"}'
   ```

2. **Check Brevo API status:**
   - Visit: https://status.brevo.com
   - Check if there are any ongoing issues

3. **Monitor email delivery:**
   - Check Brevo dashboard → **Statistics**
   - See if emails are being queued or failing

## 💡 Quick Fix

If you need emails to work immediately:

1. **Temporarily disable images in emails** (remove image URLs)
2. **Use SMTP instead of API** (more reliable)
3. **Send emails via a separate service** (e.g., Vercel Cron Job)

---

**Current Status**: Email sending is non-blocking, so orders will complete even if email fails. Check logs to see if emails eventually succeed after retries.


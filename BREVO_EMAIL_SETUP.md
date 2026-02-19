# 📧 Brevo Email Setup & Implementation Plan

## 🎯 Overview
Switching from Resend to Brevo (formerly Sendinblue) for email services:
- ✅ Order confirmation emails with product images
- ✅ Signup confirmation emails

---

## 📋 What You Need to Provide

### 1. **Brevo API Key**
- Sign up at [brevo.com](https://www.brevo.com) (free tier: 300 emails/day)
- Go to **Settings → API Keys**
- Create a new API key
- Copy the API key (starts with `xkeysib-...`)

### 2. **Brevo Sender Email**
- Go to **Senders & IP → Senders**
- Add and verify your sender email (e.g., `noreply@yourdomain.com`)
- Or use the default sender for testing

### 3. **Environment Variables**
Add these to your `.env.local` (local) and Vercel (production):

```bash
# Brevo Configuration
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_FROM_EMAIL=MS CRAFTS <noreply@yourdomain.com>
BREVO_FROM_NAME=MS CRAFTS

# Optional: For custom domain
BREVO_REPLY_TO=support@yourdomain.com
```

---

## 🔄 Implementation Steps

### ✅ Step 1: Replace Resend with Brevo
- [x] Brevo package already installed (`@getbrevo/brevo`)
- [x] Update `lib/email.ts` to use Brevo API
- [x] Remove Resend dependencies

### ✅ Step 2: Order Confirmation Emails
- [x] Update email HTML template to include product images
- [x] Update order creation API to pass product images
- [x] Test email with product images

### ✅ Step 3: Signup Confirmation Emails
- [x] Create signup email function
- [x] Integrate with Supabase auth flow
- [x] Send welcome email after signup

### ✅ Step 4: Testing
- [ ] Test order confirmation email
- [ ] Test signup confirmation email
- [ ] Verify images load correctly
- [ ] Check email deliverability

---

## 📦 Brevo Free Tier Limits

- **300 emails/day** (9,000/month)
- **Unlimited contacts**
- **Email templates**
- **SMTP & API access**
- **Email tracking**

---

## 🔧 Supabase SMTP Setup (Already Done)

Since you've configured SMTP on Supabase:
- Supabase will automatically use Brevo SMTP for auth emails
- No code changes needed for Supabase auth emails
- Just ensure SMTP credentials match your Brevo account

---

## 📝 Next Steps After Implementation

1. **Add environment variables** to `.env.local` and Vercel
2. **Test locally** with a test order
3. **Test signup** flow
4. **Deploy to production** and test again
5. **Monitor Brevo dashboard** for email delivery stats

---

## 🐛 Troubleshooting

### Emails not sending?
- Check Brevo API key is correct
- Verify sender email is verified in Brevo
- Check Brevo dashboard for error logs
- Ensure environment variables are set

### Images not showing?
- Use absolute URLs (https://yourdomain.com/images/...)
- Or use Brevo's image hosting
- Check image paths are correct

---

**Ready to implement!** 🚀


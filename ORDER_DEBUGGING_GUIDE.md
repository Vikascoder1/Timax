# 🔍 Order Debugging Guide

## Issue: No Order Confirmation Email & No Shiprocket Order

### Step 1: Check if API Route is Being Called

**Look for this in your server console/terminal:**
```
🛒🛒🛒 ORDER API ROUTE HIT - STARTING 🛒🛒🛒
```

**If you DON'T see this:**
- The API route is not being called
- Check browser console for errors
- Check network tab in browser DevTools
- Verify the checkout page is calling `/api/orders/create`

### Step 2: Check Payment Method

**Look for this in logs:**
```
💳💳💳 PAYMENT METHOD: cod 💳💳💳
🚨🚨🚨 ENTERING COD BLOCK - WILL SEND EMAIL AND SHIPROCKET 🚨🚨🚨
```

**If you see "NOT COD ORDER":**
- Email and Shiprocket are only sent for COD orders
- Prepaid orders send email after payment verification

### Step 3: Check Email Logs

**Look for these logs:**
```
📧 ===== PREPARING TO SEND ORDER CONFIRMATION EMAIL =====
🚨🚨🚨 CALLING sendOrderConfirmationEmail NOW 🚨🚨🚨
```

**Then look for:**
- `✅✅✅ Email sent successfully! ✅✅✅` (success)
- `❌❌❌ FAILED TO SEND ORDER EMAIL ❌❌❌` (failure)

### Step 4: Check Shiprocket Logs

**Look for these logs:**
```
📦📦📦 ATTEMPTING TO PUSH COD ORDER [ORDER_NUMBER] TO SHIPROCKET 📦📦📦
🚨🚨🚨 CALLING createShiprocketOrder NOW 🚨🚨🚨
```

**Then look for:**
- `✅✅✅ Shiprocket order created successfully ✅✅✅` (success)
- `❌❌❌ Failed to push order to Shiprocket ❌❌❌` (failure)

## Common Issues

### 1. API Route Not Called
**Symptoms:** No logs at all
**Fix:** 
- Check browser console for JavaScript errors
- Check network tab - is the POST request being made?
- Check if form validation is preventing submission

### 2. Payment Method Not COD
**Symptoms:** See "NOT COD ORDER" in logs
**Fix:** 
- Make sure you're selecting "Cash on Delivery" option
- Check `paymentMethod` value in request body

### 3. Email Failing Silently
**Symptoms:** See "CALLING sendOrderConfirmationEmail" but no success/failure
**Fix:**
- Check Brevo API key: `BREVO_API_KEY` in `.env`
- Verify sender email in Brevo Dashboard → Senders & IP → Senders
- Check Brevo error codes in logs

### 4. Shiprocket Failing
**Symptoms:** See "CALLING createShiprocketOrder" but no success
**Fix:**
- Check Shiprocket credentials: `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` in `.env`
- Verify credentials are correct in Shiprocket dashboard
- Check for pickup location errors

## Quick Test

1. **Place a test order (COD)**
2. **Watch your server terminal/console** (not browser console)
3. **Look for the 🚨 emoji logs** - they mark critical points
4. **Copy all logs** and check:
   - Is API route called? (🛒🛒🛒)
   - Is COD block entered? (🚨🚨🚨 ENTERING COD BLOCK)
   - Is email called? (🚨🚨🚨 CALLING sendOrderConfirmationEmail)
   - Is Shiprocket called? (🚨🚨🚨 CALLING createShiprocketOrder)

## What to Share for Debugging

If still not working, share:
1. **Server console logs** (the terminal running `yarn dev`)
2. **Browser console logs** (F12 → Console tab)
3. **Network tab** (F12 → Network tab → find `/api/orders/create` request)
4. **Order number** that was created


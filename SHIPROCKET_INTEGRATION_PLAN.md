# Shiprocket Integration Plan

## 📦 Overview
To automatically push new orders from your application to Shiprocket so they appear in your Shiprocket dashboard for fulfillment. We will use the **Shiprocket Custom Order API** to achieve this.

## 🔄 The Flow

Since our checkout process handles two payment methods (COD and Prepaid via Razorpay), we need to trigger the Shiprocket order creation at different stages:

1. **For Cash On Delivery (COD) Orders:**
   - User places order -> Order saved in Supabase -> Confirmation email sent -> **Push to Shiprocket API** (Asynchronously so the checkout isn't delayed for the user).
   
2. **For Prepaid (Razorpay) Orders:**
   - User places order -> Redirects to payment -> Payment verified successfully -> Order marked as Paid in Supabase -> Confirmation email sent -> **Push to Shiprocket API** (Asynchronously).

## 🛠 Prerequisites / Requirements (What I need)

To implement this, we require Shiprocket API credentials. I will need to set these up in your `.env` and `.env.local` file:
1. **Shiprocket Account Email:** Used to log into your Shiprocket account.
2. **Shiprocket Account Password:** Your Shiprocket account password.

*Note: Shiprocket uses these credentials to generate a secure Bearer token via its Authentication API, which is then used to create orders.*

## 📋 Implementation Steps

1. **Add Shiprocket Logic (`lib/shiprocket.ts`)**
   - Create a service to handle Shiprocket authentication (generating tokens from your email/password). 
   - Note: The token is valid for 10 days. We can temporarily authenticate per order.
   - Create a function `createShiprocketOrder(fullOrderData, orderItems)` that maps our Supabase database fields (like `customer_name`, `shipping_address`, `items`) to Shiprocket's required JSON schema.

2. **Update Order Creation API (`app/api/orders/create/route.ts`)**
   - Intercept after a COD order is completely entered and committed to Supabase.
   - Call the Shiprocket service without blocking the immediate response to the user.
   
3. **Update Payment Verification API (`app/api/payments/verify/route.ts`)**
   - Intercept after the Razorpay verification is successful and the order is marked as `confirmed`.
   - Call the Shiprocket service.

4. **Testing the connection**
   - We can place a test order or manually trigger the Shiprocket creation with dummy data to verify it appears as a Custom Order on the Shiprocket dashboard.

---

Please review this plan. If you confirm, please provide the Shiprocket email and password (or you can put them in the `.env` file yourself as `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`), and I will proceed with the implementation.

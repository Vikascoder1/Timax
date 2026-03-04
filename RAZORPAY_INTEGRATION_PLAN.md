# 💳 Razorpay Payment Integration Plan

## 📋 Overview

Razorpay is a popular payment gateway in India that supports:
- UPI
- Credit/Debit Cards
- Net Banking
- Wallets
- EMI

---

## 🔑 Setup Requirements

### 1. **Razorpay Account Setup**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get **Key ID** and **Key Secret**
4. Add to `.env.local`:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

### 2. **Install Razorpay SDK**
```bash
yarn add razorpay
```

---

## 🔄 Razorpay Payment Flow

### **Step-by-Step Flow:**

```
1. User clicks "Pay now" (Prepaid)
   ↓
2. Create order in database (status: "pending_payment")
   ↓
3. Create Razorpay order via API
   ↓
4. Generate payment options page
   ↓
5. User selects payment method (UPI/Card/NetBanking)
   ↓
6. User completes payment on Razorpay
   ↓
7. Razorpay redirects to success/callback URL
   ↓
8. Verify payment signature
   ↓
9. Update order status to "confirmed"
   ↓
10. Send confirmation email
   ↓
11. Redirect to order confirmation page
```

---

## 🛠️ Implementation Structure

### **1. API Routes Needed:**

#### `/api/payments/create-order` (POST)
- Creates Razorpay order
- Returns order ID and amount
- Used to initialize payment

#### `/api/payments/verify` (POST)
- Verifies payment signature
- Updates order status
- Called after payment completion

#### `/api/payments/webhook` (POST) - Optional
- Handles Razorpay webhooks
- For payment status updates
- More reliable than redirect callback

---

## 📝 Code Structure

### **1. Razorpay Client Setup**
```typescript
// lib/razorpay.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### **2. Create Payment Order**
```typescript
// API: /api/payments/create-order
const order = await razorpay.orders.create({
  amount: totalAmount * 100, // Amount in paise
  currency: 'INR',
  receipt: `order_${orderId}`,
  notes: {
    orderId: orderId,
    customerEmail: email,
  }
});
```

### **3. Frontend Payment Integration**
```typescript
// Use Razorpay Checkout
const options = {
  key: RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: 'INR',
  name: 'MS HandCraft',
  description: 'Order Payment',
  order_id: order.id,
  handler: function (response) {
    // Verify payment
    verifyPayment(response);
  },
  prefill: {
    name: customerName,
    email: customerEmail,
    contact: customerPhone,
  },
  theme: {
    color: '#14b8a6', // Teal color
  },
};

const razorpayInstance = new Razorpay(options);
razorpayInstance.open();
```

### **4. Payment Verification**
```typescript
// API: /api/payments/verify
const crypto = require('crypto');

function verifyPaymentSignature(orderId, paymentId, signature) {
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  return generatedSignature === signature;
}
```

---

## 🎯 Integration Points

### **1. Checkout Page**
- Update "Pay now" button for prepaid
- Show Razorpay payment options
- Handle payment initiation

### **2. Payment Success Page**
- `/order-confirmation/[orderId]`
- Show order details
- Payment confirmation

### **3. Payment Failure Page**
- `/payment-failed`
- Show error message
- Option to retry payment

---

## 🔐 Security Best Practices

1. **Never expose Key Secret** on frontend
2. **Always verify payment signature** server-side
3. **Use HTTPS** for all payment pages
4. **Validate amounts** before processing
5. **Store payment IDs** for reference
6. **Handle webhooks** for payment status updates

---

## 📊 Database Updates

### **Orders Table - Additional Fields:**
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_signature VARCHAR(500);
```

---

## 🧪 Testing

### **Test Mode:**
- Razorpay provides test credentials
- Use test cards for testing
- Test all payment methods

### **Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

---

## 📋 Implementation Checklist

- [ ] Set up Razorpay account
- [ ] Get Key ID and Key Secret
- [ ] Install Razorpay SDK
- [ ] Create Razorpay client utility
- [ ] Create `/api/payments/create-order` endpoint
- [ ] Create `/api/payments/verify` endpoint
- [ ] Update checkout page for prepaid
- [ ] Add Razorpay checkout script
- [ ] Create payment success page
- [ ] Create payment failure page
- [ ] Test payment flow
- [ ] Add webhook handler (optional)

---

## 🚀 Advantages of Razorpay

1. **Easy Integration**: Simple SDK and API
2. **Multiple Payment Methods**: UPI, Cards, NetBanking, Wallets
3. **Good Documentation**: Comprehensive guides
4. **Test Mode**: Easy testing before going live
5. **Webhooks**: Real-time payment updates
6. **Dashboard**: View all transactions

---

## 💰 Pricing

- **Setup Fee**: ₹0
- **Transaction Fee**: 2% per transaction
- **No Monthly Charges**: Pay per transaction only

---

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

---

**Ready to implement after COD flow is complete!** 🚀









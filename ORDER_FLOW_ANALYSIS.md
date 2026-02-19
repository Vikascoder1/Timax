# Complete Purchase Flow Analysis & Implementation Plan

## 📋 Overview

This document outlines the complete purchase flow for both **Cash on Delivery (COD)** and **Prepaid Payment** methods, including order storage, email notifications, and customer contact management.

---

## 🔄 Flow 1: Cash on Delivery (COD)

### Current Flow:
1. User fills checkout form (address, contact info)
2. User selects COD payment method
3. User clicks "Pay now" / "Place Order"
4. **→ Order created in database**
5. **→ Confirmation email sent to customer**
6. **→ Order details stored for admin access**

### Implementation Requirements:

#### 1. **Order Storage (Supabase Database)**
- Store complete order details:
  - Customer information (name, email, phone, address)
  - Order items (products, quantities, sizes, prices)
  - Order total, payment method, order status
  - Order date, order ID
  - Delivery instructions (if any)

#### 2. **Email Service**
- **Recommended: Resend** (Free tier: 3,000 emails/month)
- Alternative: SendGrid (Free tier: 100 emails/day)
- Send order confirmation email with:
  - Order ID
  - Order summary (items, quantities, prices)
  - Delivery address
  - Estimated delivery date
  - Contact information

#### 3. **Admin Access to Orders**
- Create admin dashboard or API endpoint
- Query orders from Supabase
- Filter by status (pending, confirmed, shipped, delivered)
- View customer contact details for delivery

---

## 💳 Flow 2: Prepaid Payment (PhonePe Gateway)

### Current Flow:
1. User fills checkout form
2. User selects PhonePe payment method
3. User clicks "Pay now"
4. **→ Redirect to PhonePe payment gateway**
5. **→ User completes payment on PhonePe**
6. **→ PhonePe redirects back with payment status**
7. **→ If successful: Create order + Send confirmation email**
8. **→ If failed: Show error message**

### Implementation Requirements:

#### 1. **PhonePe Integration**
- Register with PhonePe Merchant
- Get Merchant ID, Salt Key, Salt Index
- Implement payment initiation API
- Handle payment callback/webhook
- Verify payment signature

#### 2. **Payment Flow Steps:**
```
Step 1: Create Payment Intent
  - Generate payment request
  - Create order with status "pending_payment"
  - Redirect to PhonePe gateway

Step 2: Payment Processing (on PhonePe)
  - User enters payment details
  - PhonePe processes payment

Step 3: Payment Callback
  - PhonePe redirects to success/failure URL
  - Verify payment signature
  - Update order status to "confirmed" or "failed"
  - Send confirmation email if successful
```

#### 3. **Order Storage**
- Same as COD, but with additional fields:
  - Payment transaction ID
  - Payment status
  - Payment gateway response

---

## 🗄️ Database Schema Design

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  order_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., ORD-2024-001234
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  payment_method VARCHAR(20) NOT NULL, -- cod, phonepe
  payment_status VARCHAR(20), -- pending, completed, failed (for prepaid)
  payment_transaction_id VARCHAR(255), -- PhonePe transaction ID
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Shipping Address
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(10) NOT NULL,
  shipping_country VARCHAR(100) DEFAULT 'India',
  
  -- Order Details
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Special Instructions
  special_instructions TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended - Free Tier)
- **Free Tier**: 3,000 emails/month
- **Setup**: 
  1. Sign up at resend.com
  2. Get API key
  3. Verify domain (optional for free tier)
  4. Install: `yarn add resend`

### Option 2: SendGrid (Alternative)
- **Free Tier**: 100 emails/day
- **Setup**: Similar to Resend

### Email Template Structure:
```
Subject: Order Confirmation - Order #ORD-2024-001234

Body:
- Order number
- Order date
- Customer details
- Delivery address
- Order items table
- Total amount
- Payment method
- Estimated delivery
- Contact support link
```

---

## 🎯 Best Implementation Approach

### Phase 1: Database Setup
1. Create `orders` and `order_items` tables in Supabase
2. Set up Row Level Security (RLS) policies
3. Create indexes for performance

### Phase 2: COD Flow
1. Create API route: `/api/orders/create`
2. Validate form data
3. Create order in database
4. Send confirmation email
5. Clear cart
6. Redirect to order confirmation page

### Phase 3: Prepaid Flow
1. Create API route: `/api/payments/initiate`
2. Integrate PhonePe SDK/API
3. Create order with "pending_payment" status
4. Redirect to PhonePe
5. Create callback route: `/api/payments/callback`
6. Verify payment and update order
7. Send confirmation email

### Phase 4: Admin Dashboard (Optional)
1. Create admin page to view orders
2. Filter and search orders
3. Update order status
4. Export order data

---

## 🔐 Security Considerations

1. **Input Validation**: Validate all form inputs server-side
2. **Payment Verification**: Always verify payment signatures
3. **RLS Policies**: Restrict order access to owners/admins
4. **Rate Limiting**: Prevent order spam
5. **Email Verification**: Verify customer email before sending

---

## 📱 Customer Contact & Delivery

### How to Contact Customers:
1. **Email**: From order confirmation email
2. **Phone**: Stored in `orders.customer_phone`
3. **Address**: Complete delivery address in order

### Admin Access:
- Query orders: `SELECT * FROM orders WHERE status = 'confirmed'`
- Get customer details: All fields in orders table
- Filter by date, status, payment method

---

## 🚀 Next Steps

1. **Set up database tables** in Supabase
2. **Configure email service** (Resend recommended)
3. **Implement COD flow** first (simpler)
4. **Integrate PhonePe** for prepaid payments
5. **Test complete flow** end-to-end
6. **Create admin dashboard** for order management

---

## 📝 Notes

- **Free Tier Limits**: 
  - Resend: 3,000 emails/month
  - Supabase: 500MB database, 2GB bandwidth
  - PhonePe: Check their pricing

- **Scalability**: 
  - Database can handle thousands of orders
  - Email service can be upgraded as needed
  - Consider caching for order queries

- **Backup**: 
  - Regular database backups (Supabase handles this)
  - Export orders periodically for records






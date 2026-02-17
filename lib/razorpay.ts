import Razorpay from "razorpay"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // In dev, log a clear warning so setup issues are obvious
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. Razorpay payments will not work."
    )
  }
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})





import { convertToStorageUrl } from "./supabase-storage"

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external"

let cachedToken: string | null = null
let tokenExpiry: number | null = null
let cachedPickupLocation: string | null = null

/**
 * Fetch available pickup locations from Shiprocket
 */
export async function getShiprocketPickupLocations(): Promise<{ id: number; pickup_location: string }[]> {
  const token = await getShiprocketToken()
  
  try {
    const response = await fetch(`${SHIPROCKET_API_URL}/settings/company/pickup`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch pickup locations: ${errorText}`)
    }

    const data = await response.json()
    
    // Handle different response formats
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((loc: any) => ({
        id: loc.id,
        pickup_location: loc.pickup_location,
      }))
    } else if (Array.isArray(data)) {
      return data.map((loc: any) => ({
        id: loc.id,
        pickup_location: loc.pickup_location,
      }))
    }
    
    return []
  } catch (error) {
    console.error("Error fetching Shiprocket pickup locations:", error)
    throw error
  }
}

/**
 * Get the first available pickup location (or use cached one)
 */
export async function getPickupLocation(): Promise<string> {
  if (cachedPickupLocation) {
    return cachedPickupLocation
  }

  try {
    const locations = await getShiprocketPickupLocations()
    if (locations.length > 0) {
      cachedPickupLocation = locations[0].pickup_location
      console.log(`📍 Using pickup location: ${cachedPickupLocation} (ID: ${locations[0].id})`)
      process.stdout.write(`📍 Using pickup location: ${cachedPickupLocation} (ID: ${locations[0].id})\n`)
      return cachedPickupLocation
    }
    
    // Fallback to "Primary" if no locations found
    console.warn("⚠️ No pickup locations found, using 'Primary' as fallback")
    process.stdout.write("⚠️ No pickup locations found, using 'Primary' as fallback\n")
    return "Primary"
  } catch (error) {
    console.error("⚠️ Failed to fetch pickup locations, using 'Primary' as fallback:", error)
    process.stdout.write(`⚠️ Failed to fetch pickup locations, using 'Primary' as fallback: ${String(error)}\n`)
    return "Primary"
  }
}

export async function getShiprocketToken(): Promise<string> {
  // If token exists and is valid (giving 1-hour buffer), return it
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 3600000) {
    return cachedToken
  }

  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured in environment variables")
  }

  try {
    const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to authenticate with Shiprocket: ${errorText}`)
    }

    const data = await response.json()
    cachedToken = data.token
    // Token is usually valid for 10 days (240 hours)
    tokenExpiry = Date.now() + 240 * 60 * 60 * 1000

    return cachedToken as string
  } catch (error) {
    console.error("Error fetching Shiprocket token:", error)
    throw error
  }
}

export type ShiprocketOrderParams = {
  orderId: string
  orderDate: Date
  channelId?: string
  paymentMethod: "cod" | "razorpay" | "prepaid" | string
  subtotal: number
  totalAmount: number
  shippingCost?: number
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  shippingCountry: string
  items: Array<{
    name: string
    productId?: string
    sku?: string
    quantity: number
    price: number
  }>
}

export async function createShiprocketOrder(params: ShiprocketOrderParams) {
  const startMsg = `📦📦📦 STARTING SHIPROCKET ORDER CREATION FOR ORDER: ${params.orderId} 📦📦📦\n`
  console.log(startMsg)
  process.stdout.write(startMsg)
  
  try {
    // Check if credentials are configured
    const hasEmail = !!process.env.SHIPROCKET_EMAIL
    const hasPassword = !!process.env.SHIPROCKET_PASSWORD
    const credCheckMsg = `🔑 Checking Shiprocket credentials - Email: ${hasEmail ? 'SET' : 'MISSING'}, Password: ${hasPassword ? 'SET' : 'MISSING'}\n`
    console.log(credCheckMsg)
    process.stdout.write(credCheckMsg)
    
    if (!hasEmail || !hasPassword) {
      const error = "Shiprocket credentials not configured (SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing)"
      const errorMsg = `❌❌❌ ${error} ❌❌❌\n`
      console.error(errorMsg)
      process.stdout.write(errorMsg)
      return { success: false, error: new Error(error) }
    }

    const authMsg = "🔐 Authenticating with Shiprocket...\n"
    console.log(authMsg)
    process.stdout.write(authMsg)
    
    const token = await getShiprocketToken()
    
    const authSuccessMsg = "✅ Shiprocket authentication successful\n"
    console.log(authSuccessMsg)
    process.stdout.write(authSuccessMsg)

    // Get the correct pickup location
    const pickupLocationMsg = "📍 Fetching pickup location...\n"
    console.log(pickupLocationMsg)
    process.stdout.write(pickupLocationMsg)
    const pickupLocation = await getPickupLocation()
    const pickupLocationSetMsg = `📍 Using pickup location: ${pickupLocation}\n`
    console.log(pickupLocationSetMsg)
    process.stdout.write(pickupLocationSetMsg)

    // Format order date to "YYYY-MM-DD HH:mm"
    const formattedDate = params.orderDate.toISOString().replace("T", " ").substring(0, 16)

    // Parse names
    const nameParts = params.customerName.trim().split(" ")
    const firstName = nameParts[0] || "Customer"
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstName

    // Format phone number - remove spaces, dashes, and ensure it starts with country code
    let formattedPhone = params.customerPhone.replace(/[\s\-\(\)]/g, "")
    // If phone doesn't start with country code, assume it's Indian (+91)
    if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("91")) {
      // Remove leading 0 if present
      if (formattedPhone.startsWith("0")) {
        formattedPhone = formattedPhone.substring(1)
      }
      // Add +91 if not present
      if (!formattedPhone.startsWith("91")) {
        formattedPhone = `91${formattedPhone}`
      }
    }
    // Remove + if present (Shiprocket might not like it)
    formattedPhone = formattedPhone.replace(/^\+/, "")

    const shiprocketOrderData = {
      order_id: params.orderId,
      order_date: formattedDate,
      pickup_location: pickupLocation, // Use the fetched pickup location
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: params.shippingAddress || "Address not provided",
      billing_address_2: "",
      billing_city: params.shippingCity || "City not provided",
      billing_pincode: params.shippingPincode,
      billing_state: params.shippingState || "State not provided",
      billing_country: params.shippingCountry || "India",
      billing_email: params.customerEmail,
      billing_phone: formattedPhone,
      shipping_is_billing: true,
      
      order_items: params.items.map((item) => ({
        name: item.name,
        sku: item.sku || item.productId || "SKU-UNKNOWN",
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: "",
      })),

      payment_method: params.paymentMethod === "cod" ? "COD" : "Prepaid",
      shipping_charges: params.shippingCost || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: params.subtotal,
      
      // Default dummy dimensions (required by Shiprocket, adjust or calculate dynamically if needed)
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1, // 1 kg
    }

    const sendMsg = "📤 Sending order to Shiprocket API...\n"
    console.log(sendMsg)
    process.stdout.write(sendMsg)
    
    const orderDataMsg = `📋 Order data: ${JSON.stringify({
      order_id: shiprocketOrderData.order_id,
      customer_name: shiprocketOrderData.billing_customer_name,
      items_count: shiprocketOrderData.order_items.length,
      total_amount: params.totalAmount,
      payment_method: shiprocketOrderData.payment_method,
    }, null, 2)}\n`
    console.log(orderDataMsg)
    process.stdout.write(orderDataMsg)

    const response = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketOrderData),
    })

    const responseData = await response.json()

    // Check if response has an error message (even if status is 200)
    const message = responseData?.message?.toLowerCase() || ""
    const hasErrorMessage = message && 
      (message.includes("wrong") || 
       message.includes("error") ||
       message.includes("invalid") ||
       message.includes("failed") ||
       message.includes("pickup location"))

    if (!response.ok || hasErrorMessage) {
      const errorMsg = `❌❌❌ SHIPROCKET API ERROR RESPONSE ❌❌❌\n`
      console.error(errorMsg)
      process.stdout.write(errorMsg)
      console.error("   Status:", response.status, response.statusText)
      console.error("   Response:", JSON.stringify(responseData, null, 2))
      process.stdout.write(`   Status: ${response.status} ${response.statusText}\n`)
      process.stdout.write(`   Response: ${JSON.stringify(responseData, null, 2)}\n`)
      
      // If it's a pickup location error, extract and cache the correct location, then retry
      if (message.includes("pickup") && responseData?.data?.data && Array.isArray(responseData.data.data)) {
        const locationsMsg = `   Available pickup locations:\n`
        console.error(locationsMsg)
        process.stdout.write(locationsMsg)
        
        responseData.data.data.forEach((loc: any) => {
          const locMsg = `     - ${loc.pickup_location} (ID: ${loc.id})\n`
          console.error(locMsg)
          process.stdout.write(locMsg)
        })
        
        // Use the first available location and cache it, then retry
        if (responseData.data.data.length > 0) {
          const correctLocation = responseData.data.data[0].pickup_location
          cachedPickupLocation = correctLocation
          console.log(`   🔄 Cached correct pickup location: ${correctLocation}`)
          process.stdout.write(`   🔄 Cached correct pickup location: ${correctLocation}\n`)
          
          // Retry with correct pickup location
          console.log(`   🔄 Retrying order creation with correct pickup location: ${correctLocation}...`)
          process.stdout.write(`   🔄 Retrying order creation with correct pickup location: ${correctLocation}...\n`)
          
          // Update the order data with correct pickup location and retry
          const retryOrderData = {
            ...shiprocketOrderData,
            pickup_location: correctLocation,
          }
          
          const retryResponse = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(retryOrderData),
          })
          
          const retryResponseData = await retryResponse.json()
          
          if (!retryResponse.ok || (retryResponseData?.message && 
            (retryResponseData.message.toLowerCase().includes("wrong") || 
             retryResponseData.message.toLowerCase().includes("error")))) {
            const retryErrorMsg = `❌❌❌ RETRY ALSO FAILED ❌❌❌\n`
            console.error(retryErrorMsg)
            process.stdout.write(retryErrorMsg)
            console.error("   Retry response:", JSON.stringify(retryResponseData, null, 2))
            process.stdout.write(`   Retry response: ${JSON.stringify(retryResponseData, null, 2)}\n`)
            
            const errorMessage = retryResponseData?.message || responseData?.message || "Unknown error"
            const error = new Error(`Failed to create order on Shiprocket after retry: ${errorMessage}`)
            return { success: false, error, responseData: retryResponseData }
          }
          
          // Retry succeeded
          const retrySuccessMsg = `✅✅✅ RETRY SUCCESSFUL WITH CORRECT PICKUP LOCATION! ✅✅✅\n`
          console.log(retrySuccessMsg)
          process.stdout.write(retrySuccessMsg)
          console.log("   Shiprocket Order ID:", retryResponseData.order_id || retryResponseData.id)
          console.log("   Shipment ID:", retryResponseData.shipment_id)
          process.stdout.write(`   Shiprocket Order ID: ${retryResponseData.order_id || retryResponseData.id || 'N/A'}\n`)
          process.stdout.write(`   Shipment ID: ${retryResponseData.shipment_id || 'N/A'}\n`)
          
          return { success: true, data: retryResponseData }
        }
      }
      
      const errorMessage = responseData?.message || responseData?.error || JSON.stringify(responseData)
      const error = new Error(`Failed to create order on Shiprocket (${response.status}): ${errorMessage}`)
      console.error("   Full error:", error.message)
      process.stdout.write(`   Full error: ${error.message}\n`)
      return { success: false, error, responseData }
    }

    // Check if order was actually created (should have order_id or shipment_id)
    if (!responseData.order_id && !responseData.id && !responseData.shipment_id) {
      const errorMsg = `❌❌❌ SHIPROCKET ORDER NOT CREATED - MISSING ORDER ID ❌❌❌\n`
      console.error(errorMsg)
      process.stdout.write(errorMsg)
      console.error("   Response:", JSON.stringify(responseData, null, 2))
      process.stdout.write(`   Response: ${JSON.stringify(responseData, null, 2)}\n`)
      
      // Treat as error if no order ID
      const error = new Error(`Shiprocket response missing order_id: ${responseData?.message || 'Unknown error'}`)
      return { success: false, error, responseData }
    }

    const successMsg = `✅✅✅ SUCCESSFULLY CREATED ORDER IN SHIPROCKET! ✅✅✅\n`
    console.log(successMsg)
    process.stdout.write(successMsg)
    console.log("   Shiprocket Order ID:", responseData.order_id || responseData.id)
    console.log("   Shipment ID:", responseData.shipment_id)
    console.log("   Full response:", JSON.stringify(responseData, null, 2))
    process.stdout.write(`   Shiprocket Order ID: ${responseData.order_id || responseData.id || 'N/A'}\n`)
    process.stdout.write(`   Shipment ID: ${responseData.shipment_id || 'N/A'}\n`)
    process.stdout.write(`   Full response: ${JSON.stringify(responseData, null, 2)}\n`)
    
    return { success: true, data: responseData }
  } catch (error: unknown) {
    const catchMsg = `❌❌❌ EXCEPTION IN createShiprocketOrder ❌❌❌\n`
    console.error(catchMsg)
    process.stdout.write(catchMsg)
    console.error("   Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("   Error message:", error instanceof Error ? error.message : String(error))
    console.error("   Full error:", error)
    process.stdout.write(`   Error type: ${error instanceof Error ? error.constructor.name : typeof error}\n`)
    process.stdout.write(`   Error message: ${error instanceof Error ? error.message : String(error)}\n`)
    
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)),
      errorDetails: error
    }
  }
}

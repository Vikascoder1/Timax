import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Load saved address
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch user profile with saved address
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        { error: "Failed to fetch address", details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      address: profile,
    })
  } catch (error: unknown) {
    console.error("Error in address API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: (error as { message?: string })?.message },
      { status: 500 }
    )
  }
}

// POST - Save address
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      pinCode,
      phone,
      country = "India",
    } = body

    // Update profile with saved address
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        saved_first_name: firstName,
        saved_last_name: lastName,
        saved_address: address,
        saved_apartment: apartment || null,
        saved_city: city,
        saved_state: state,
        saved_pincode: pinCode,
        saved_phone: phone,
        saved_country: country,
        phone: phone, // Also update main phone field
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error saving address:", updateError)
      return NextResponse.json(
        { error: "Failed to save address", details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
    })
  } catch (error: unknown) {
    console.error("Error in save address API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: (error as { message?: string })?.message },
      { status: 500 }
    )
  }
}


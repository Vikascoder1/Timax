import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Fetch orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json(
        { error: "Failed to fetch orders", details: ordersError.message },
        { status: 500 }
      )
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true })

        return {
          ...order,
          items: items || [],
        }
      })
    )

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    })
  } catch (error: unknown) {
    console.error("Error in my-orders API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: (error as { message?: string })?.message },
      { status: 500 }
    )
  }
}


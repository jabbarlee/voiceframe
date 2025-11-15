import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserUsage } from "@/lib/usage";

const PLAN_CONFIGS = {
  free: { allowed_minutes: 30 },
  starter: { allowed_minutes: 600 },
  pro: { allowed_minutes: 1500 },
};

export async function POST(request: NextRequest) {
  try {
    const { newPlan } = await request.json();

    // Validate plan
    if (!newPlan || !PLAN_CONFIGS[newPlan as keyof typeof PLAN_CONFIGS]) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Invalid ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Get current user usage (this will create one if it doesn't exist)
    const currentUsage = await getUserUsage(uid);

    if (!currentUsage) {
      console.error("❌ Error fetching or creating current usage");
      return NextResponse.json(
        { success: false, error: "Failed to fetch current usage" },
        { status: 500 }
      );
    }

    // Check if user is trying to "upgrade" to the same plan
    if (currentUsage.plan === newPlan) {
      return NextResponse.json(
        { success: false, error: "You are already on this plan" },
        { status: 400 }
      );
    }

    // Update user plan while preserving current usage
    const newAllowedMinutes =
      PLAN_CONFIGS[newPlan as keyof typeof PLAN_CONFIGS].allowed_minutes;

    const { data: updatedUsage, error: updateError } = await supabaseAdmin
      .from("user_usage")
      .update({
        plan: newPlan,
        allowed_minutes: newAllowedMinutes,
        updated_at: new Date().toISOString(),
        // Keep current used_minutes and cycle_start unchanged
      })
      .eq("uid", uid)
      .select()
      .maybeSingle(); // Use maybeSingle() for more robust error handling

    if (updateError) {
      console.error("❌ Error updating plan:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update plan" },
        { status: 500 }
      );
    }

    if (!updatedUsage) {
      console.error("❌ No usage record found to update");
      return NextResponse.json(
        { success: false, error: "Usage record not found" },
        { status: 404 }
      );
    }

    // Calculate remaining minutes and over limit status
    const remaining_minutes = Math.max(
      0,
      updatedUsage.allowed_minutes - updatedUsage.used_minutes
    );
    const is_over_limit =
      updatedUsage.used_minutes >= updatedUsage.allowed_minutes;

    const responseData = {
      ...updatedUsage,
      remaining_minutes,
      is_over_limit,
    };

    console.log(
      `✅ Plan updated successfully: ${currentUsage.plan} → ${newPlan} for user ${uid}`
    );

    return NextResponse.json({
      success: true,
      message: `Plan updated to ${newPlan} successfully`,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Upgrade plan API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

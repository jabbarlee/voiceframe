import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserUsage } from "@/lib/usage";

export async function GET(request: NextRequest) {
  try {
    console.log("📊 GET /api/usage - Starting request");

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing authorization header");
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      console.log("🔐 Verifying Firebase ID token...");
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Invalid ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;
    console.log("✅ Authenticated user:", uid);

    // Get user usage
    console.log("📊 Fetching user usage data...");
    const usage = await getUserUsage(uid);

    if (!usage) {
      console.log("❌ No usage data returned");
      return NextResponse.json(
        { success: false, error: "Unable to fetch usage data" },
        { status: 500 }
      );
    }

    console.log("✅ Usage data fetched successfully");
    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error: any) {
    console.error("❌ Usage API error:", {
      message: error.message,
      details: error.stack,
      hint: "Check network connectivity to Supabase and Firebase",
      code: error.code || ""
    });
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        debug: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          type: error.constructor.name
        } : undefined
      },
      { status: 500 }
    );
  }
}

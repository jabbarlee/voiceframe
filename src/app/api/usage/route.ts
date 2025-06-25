import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserUsage } from "@/lib/usage";

export async function GET(request: NextRequest) {
  try {
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

    // Get user usage
    const usage = await getUserUsage(uid);

    if (!usage) {
      return NextResponse.json(
        { success: false, error: "Unable to fetch usage data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error("❌ Usage API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

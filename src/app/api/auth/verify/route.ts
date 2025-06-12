import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No session cookie found" },
        { status: 401 }
      );
    }

    console.log("🔧 Verifying session cookie...");

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    console.log("✅ Session cookie verified for user:", decodedClaims.uid);

    return NextResponse.json({
      message: "Session verified successfully",
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
      },
    });
  } catch (error: any) {
    console.error("❌ Session verification error:", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  // Same logic for GET requests
  return POST(req);
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const cookieStore = await cookies();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    console.log("🔧 Creating session cookie...");

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie that expires in 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    console.log("✅ Session cookie created successfully");

    // Create response first
    const response = NextResponse.json(
      {
        message: "Session created successfully",
        uid: decodedToken.uid,
        success: true,
      },
      { status: 200 }
    );

    // Set the session cookie with explicit options
    cookieStore.set("session", sessionCookie, {
      httpOnly: true, // Temporarily set to false for debugging
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(expiresIn / 1000),
      path: "/",
    });

    console.log("✅ Session cookie set with options:", {
      httpOnly: true, // Updated for debugging
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(expiresIn / 1000),
      path: "/",
      cookieValue: sessionCookie.substring(0, 50) + "...",
    });

    return response;
  } catch (error: any) {
    console.error("❌ Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session", success: false },
      { status: 401 }
    );
  }
}

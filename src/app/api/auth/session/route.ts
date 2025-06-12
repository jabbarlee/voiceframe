import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

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
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set the session cookie
    const response = NextResponse.json(
      { message: "Session created successfully", uid: decodedToken.uid },
      { status: 200 }
    );

    response.cookies.set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    console.log("✅ Session cookie created and set");
    return response;
  } catch (error: any) {
    console.error("❌ Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Use client-side Supabase for user operations

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const cookieStore = await cookies();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token is required" },
        { status: 400 }
      );
    }

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

    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in Supabase, create if not (fallback safety)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("uid")
      .eq("uid", uid)
      .single();

    if (checkError && checkError.code === "PGRST116") {
      // User doesn't exist, create them
      console.log("🔄 Creating user in database (fallback)");
      const { error: insertError } = await supabaseAdmin.from("users").insert({
        uid,
        email,
        full_name: name || null,
        avatar_url: picture || null,
      });

      if (insertError && insertError.code !== "23505") {
        // Ignore duplicate key errors, log others
        console.error("❌ Error creating user:", insertError);
      }
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({
      success: true,
      message: "Session created successfully",
    });

    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Session creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}

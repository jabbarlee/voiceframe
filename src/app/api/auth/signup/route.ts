import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken, fullName } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token is required" },
        { status: 400 }
      );
    }

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

    const { uid, email, picture } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("uid")
      .eq("uid", uid)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      console.error("❌ Error checking existing user:", checkError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (existingUser) {
      // User already exists, just return success
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: { uid, email },
      });
    }

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        uid,
        email,
        full_name: fullName, // Use fullName from request body
        avatar_url: picture || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error creating user in Supabase:", insertError);

      // Handle unique constraint violations
      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "User already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    console.log("✅ User created successfully in Supabase:", newUser);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        uid: newUser.uid,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
      },
    });
  } catch (error) {
    console.error("❌ Signup API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

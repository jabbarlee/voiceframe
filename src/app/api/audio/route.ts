import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    // Fetch all audio files for the user
    const { data: audioFiles, error } = await supabaseAdmin
      .from("audio_files")
      .select("*")
      .eq("uid", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch audio files" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audioFiles || [],
    });
  } catch (error) {
    console.error("❌ Audio files API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

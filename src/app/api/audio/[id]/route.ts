import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: audioId } = await params;

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

    // Fetch audio file metadata from database
    const { data: audioFile, error } = await supabaseAdmin
      .from("audio_files")
      .select("*")
      .eq("id", audioId)
      .eq("uid", uid) // Ensure user owns this file
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { success: false, error: "Audio file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audioFile,
    });
  } catch (error) {
    console.error("❌ Audio API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

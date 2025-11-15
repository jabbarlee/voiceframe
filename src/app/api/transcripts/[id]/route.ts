import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminAuth } from "@/lib/firebase-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "📖 GET /api/transcripts/[id] - Fetching transcript:",
      params.id
    );

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Fetch transcript with audio file info
    const { data, error } = await supabase
      .from("transcripts")
      .select(
        `
        id,
        audio_file_id,
        content,
        language,
        word_count,
        created_at,
        updated_at,
        audio_files (
          id,
          original_filename,
          file_size_bytes,
          mime_type,
          created_at
        )
      `
      )
      .eq("id", params.id)
      .eq("uid", uid)
      .maybeSingle(); // Use maybeSingle() to handle potential issues

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in GET /api/transcripts/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "✏️ PUT /api/transcripts/[id] - Updating transcript:",
      params.id
    );

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { content, language } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Calculate word count
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word: any) => word.length > 0).length;

    // Update transcript
    const { data, error } = await supabase
      .from("transcripts")
      .update({
        content,
        language: language || undefined,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("uid", uid)
      .select()
      .maybeSingle(); // Use maybeSingle() for more robust error handling

    if (error) {
      console.log("❌ Error updating transcript:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update transcript" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in PUT /api/transcripts/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "🗑️ DELETE /api/transcripts/[id] - Deleting transcript:",
      params.id
    );

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Delete transcript
    const { error } = await supabase
      .from("transcripts")
      .delete()
      .eq("id", params.id)
      .eq("uid", uid);

    if (error) {
      console.log("❌ Error deleting transcript:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete transcript" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Transcript deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error in DELETE /api/transcripts/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

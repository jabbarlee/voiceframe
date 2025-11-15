import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminAuth } from "@/lib/firebase-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log("📝 POST /api/transcripts - Starting transcript creation");

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid authorization header");
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken) {
      console.log("❌ Invalid token");
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    console.log("✅ Authenticated user:", uid);

    // Parse request body
    const body = await request.json();
    const { audio_file_id, content, language = "en" } = body;

    // Validate required fields
    if (!audio_file_id || !content) {
      console.log("❌ Missing required fields:", {
        audio_file_id: !!audio_file_id,
        content: !!content,
      });
      return NextResponse.json(
        { success: false, error: "audio_file_id and content are required" },
        { status: 400 }
      );
    }

    // Verify the audio file belongs to the user
    console.log("🔍 Verifying audio file ownership for:", audio_file_id);
    const { data: audioFile, error: audioError } = await supabase
      .from("audio_files")
      .select("id, uid")
      .eq("id", audio_file_id)
      .eq("uid", uid)
      .maybeSingle(); // Use maybeSingle() to handle potential issues

    if (audioError) {
      console.log("❌ Database error checking audio file:", audioError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!audioFile) {
      console.log("❌ Audio file not found or not owned by user");
      return NextResponse.json(
        { success: false, error: "Audio file not found or access denied" },
        { status: 404 }
      );
    }

    // Calculate word count
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word: any) => word.length > 0).length;
    console.log("📊 Calculated word count:", wordCount);

    // Check if transcript already exists for this audio file
    const { data: existingTranscript, error: checkError } = await supabase
      .from("transcripts")
      .select("id")
      .eq("audio_file_id", audio_file_id)
      .maybeSingle(); // Use maybeSingle() for cleaner handling

    if (checkError) {
      console.log("❌ Error checking existing transcript:", checkError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    let result;

    if (existingTranscript) {
      // Update existing transcript
      console.log("🔄 Updating existing transcript:", existingTranscript.id);
      const { data, error } = await supabase
        .from("transcripts")
        .update({
          content,
          language,
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTranscript.id)
        .select()
        .single();

      if (error) {
        console.log("❌ Error updating transcript:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update transcript" },
          { status: 500 }
        );
      }

      result = data;
      console.log("✅ Transcript updated successfully");
    } else {
      // Create new transcript
      console.log("📝 Creating new transcript");
      const { data, error } = await supabase
        .from("transcripts")
        .insert({
          audio_file_id,
          uid,
          content,
          language,
          word_count: wordCount,
        })
        .select()
        .single();

      if (error) {
        console.log("❌ Error creating transcript:", error);
        return NextResponse.json(
          { success: false, error: "Failed to create transcript" },
          { status: 500 }
        );
      }

      result = data;
      console.log("✅ Transcript created successfully");
    }

    // Update audio file status to completed
    console.log("🔄 Updating audio file status to completed");
    const { error: updateError } = await supabase
      .from("audio_files")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", audio_file_id);

    if (updateError) {
      console.log(
        "⚠️ Warning: Failed to update audio file status:",
        updateError
      );
      // Don't fail the entire request for this
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: existingTranscript
          ? "Transcript updated successfully"
          : "Transcript created successfully",
      },
      { status: existingTranscript ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("❌ Error in POST /api/transcripts:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📖 GET /api/transcripts - Fetching user transcripts");

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const audioFileId = searchParams.get("audio_file_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
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
      .eq("uid", uid)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (audioFileId) {
      query = query.eq("audio_file_id", audioFileId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("❌ Error fetching transcripts:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch transcripts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in GET /api/transcripts:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

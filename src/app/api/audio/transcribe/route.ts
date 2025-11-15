import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { 
  transcribeAudio, 
  validateFileForTranscription, 
  estimateTranscriptionCost,
  TRANSCRIPTION_MODELS,
  getRecommendedModel,
  type TranscriptionOptions 
} from "@/lib/openai-transcription";
import { 
  checkCostLimit, 
  updateCostTracking, 
  getUserPlan,
  logCostEntry 
} from "@/lib/cost-tracking";

/**
 * POST /api/audio/transcribe
 * Transcribe an audio file using OpenAI's Speech-to-Text API
 */
export async function POST(request: NextRequest) {
  try {
    console.log(
      "🎙️ POST /api/audio/transcribe - Starting transcription request"
    );

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
    const { audio_file_id, options = {} } = body;

    console.log("📝 Transcription request body:", {
      audio_file_id,
      options: {
        ...options,
        prompt: options.prompt ? "[PROMPT_SET]" : undefined,
      },
    });

    // Validate required fields
    if (!audio_file_id) {
      console.log("❌ Missing required field: audio_file_id");
      return NextResponse.json(
        { success: false, error: "audio_file_id is required" },
        { status: 400 }
      );
    }

    // Verify the audio file belongs to the user and get file info
    console.log("🔍 Verifying audio file ownership for:", audio_file_id);
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("*")
      .eq("id", audio_file_id)
      .eq("uid", uid)
      .maybeSingle();

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

    // Check if file is suitable for transcription
    console.log("📊 Audio file info:", {
      id: audioFile.id,
      filename: audioFile.original_filename,
      size: audioFile.file_size_bytes,
      mimeType: audioFile.mime_type,
      status: audioFile.status,
    });

    const validation = validateFileForTranscription(
      audioFile.file_size_bytes,
      audioFile.mime_type
    );

    if (!validation.isValid) {
      console.log("❌ File validation failed:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check if transcription already exists
    const { data: existingTranscript, error: checkError } = await supabaseAdmin
      .from("transcripts")
      .select("*")
      .eq("audio_file_id", audio_file_id)
      .maybeSingle();

    if (checkError) {
      console.log("❌ Error checking existing transcript:", checkError);
    }

    if (existingTranscript) {
      console.log(
        "✅ Transcript already exists, returning existing:",
        existingTranscript.id
      );
      return NextResponse.json({
        success: true,
        data: {
          id: existingTranscript.id,
          text: existingTranscript.content,
          audio_file_id: existingTranscript.audio_file_id,
          language: existingTranscript.language,
          word_count: existingTranscript.word_count,
          created_at: existingTranscript.created_at,
        },
        message: "Transcript already exists",
      });
    }

    // Estimate cost before processing
    const model = getRecommendedModel({
      prioritizeCost: true,
      needsHighQuality: options.high_quality || false,
      needsSpeakerDiarization: options.speaker_diarization || false,
    });

    const costEstimate = estimateTranscriptionCost(
      audioFile.file_size_bytes,
      audioFile.mime_type,
      model
    );

    console.log("💰 Cost estimate:", costEstimate);

    // Download the audio file from storage
    console.log("📥 Downloading audio file from storage...");

    if (!audioFile.public_url) {
      console.log("❌ No public URL available for audio file");
      return NextResponse.json(
        { success: false, error: "Audio file not accessible" },
        { status: 400 }
      );
    }

    const audioResponse = await fetch(audioFile.public_url);
    if (!audioResponse.ok) {
      console.log("❌ Failed to download audio file:", audioResponse.status);
      return NextResponse.json(
        { success: false, error: "Failed to download audio file" },
        { status: 500 }
      );
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    console.log(`📁 Downloaded audio file: ${audioBuffer.length} bytes`);

    // Update audio file status to processing
    await supabaseAdmin
      .from("audio_files")
      .update({ status: "processing" })
      .eq("id", audio_file_id);

    // Prepare transcription options
    const transcriptionOptions: TranscriptionOptions = {
      model,
      language: options.language,
      prompt: options.prompt,
      response_format: "verbose_json", // Always use verbose to get metadata
      temperature: options.temperature,
      timestamp_granularities: options.include_timestamps
        ? ["word", "segment"]
        : undefined,
    };

    console.log(`🚀 Starting transcription with model: ${model}`);

    // Perform transcription
    const startTime = Date.now();
    const result = await transcribeAudio(
      audioBuffer,
      audioFile.original_filename,
      transcriptionOptions
    );
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`✅ Transcription completed in ${processingTime}ms`);
    console.log(`📊 Result preview: "${result.text.substring(0, 100)}..."`);

    // Calculate word count
    const wordCount = result.text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    console.log(`📊 Word count: ${wordCount}`);

    // Save transcript to database
    console.log("💾 Saving transcript to database...");
    const { data: savedTranscript, error: saveError } = await supabaseAdmin
      .from("transcripts")
      .insert({
        audio_file_id,
        uid,
        content: result.text,
        language: result.language || options.language || "en",
        word_count: wordCount,
        processing_time_ms: processingTime,
        model_used: model,
        cost_estimate_usd: costEstimate.estimatedCostUSD,
      })
      .select()
      .single();

    if (saveError) {
      console.log("❌ Error saving transcript:", saveError);
      // Update audio file status back to uploaded
      await supabaseAdmin
        .from("audio_files")
        .update({ status: "uploaded" })
        .eq("id", audio_file_id);

      return NextResponse.json(
        { success: false, error: "Failed to save transcript" },
        { status: 500 }
      );
    }

    // Update audio file status to completed
    await supabaseAdmin
      .from("audio_files")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", audio_file_id);

    console.log("✅ Transcript saved successfully:", savedTranscript.id);

    // Return the result
    return NextResponse.json({
      success: true,
      data: {
        id: savedTranscript.id,
        text: result.text,
        audio_file_id,
        language: result.language || savedTranscript.language,
        word_count: wordCount,
        duration: result.duration,
        segments: result.segments,
        words: result.words,
        processing_time_ms: processingTime,
        model_used: model,
        cost_estimate: costEstimate,
        created_at: savedTranscript.created_at,
      },
      message: "Transcription completed successfully",
    });
  } catch (error: any) {
    console.error("❌ Error in POST /api/audio/transcribe:", error);

    // Try to extract audio_file_id from request to update status
    try {
      const body = await request.json();
      if (body.audio_file_id) {
        await supabaseAdmin
          .from("audio_files")
          .update({ status: "failed" })
          .eq("id", body.audio_file_id);
      }
    } catch {
      // Ignore errors when trying to update status
    }

    // Return appropriate error
    if (error.message.includes("rate limit")) {
      return NextResponse.json(
        {
          success: false,
          error: "API rate limit exceeded. Please try again in a moment.",
          errorType: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    if (error.message.includes("insufficient_quota")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "API quota exceeded. Please check your OpenAI account billing.",
          errorType: "QUOTA_EXCEEDED",
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        errorType: "UNKNOWN",
      },
      { status: 500 }
    );
  }
}

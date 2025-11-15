import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  transcribeAudioStreaming,
  validateFileForTranscription,
  estimateTranscriptionCost,
  getRecommendedModel,
  type TranscriptionOptions,
} from "@/lib/openai-transcription";
import { downloadAudioFile } from "@/lib/storage-utils";

/**
 * POST /api/audio/transcribe/stream
 * Transcribe an audio file using OpenAI's Speech-to-Text API with streaming support
 */
export async function POST(request: NextRequest) {
  try {
    console.log(
      "🎙️ POST /api/audio/transcribe/stream - Starting streaming transcription"
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

    // Validate required fields
    if (!audio_file_id) {
      console.log("❌ Missing required field: audio_file_id");
      return NextResponse.json(
        { success: false, error: "audio_file_id is required" },
        { status: 400 }
      );
    }

    // Verify the audio file belongs to the user and get file info
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("*")
      .eq("id", audio_file_id)
      .eq("uid", uid)
      .maybeSingle();

    if (audioError || !audioFile) {
      console.log("❌ Audio file not found or not owned by user");
      return NextResponse.json(
        { success: false, error: "Audio file not found or access denied" },
        { status: 404 }
      );
    }

    // Validate file for transcription
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

    // Download the audio file from storage using Supabase API
    console.log("📥 Downloading audio file from storage...");

    let audioBuffer: Buffer;
    try {
      audioBuffer = await downloadAudioFile(audioFile);
      console.log(`📁 Downloaded audio file: ${audioBuffer.length} bytes`);
    } catch (downloadError) {
      console.log("❌ Failed to download audio file:", downloadError);
      return NextResponse.json(
        { success: false, error: "Failed to access audio file from storage" },
        { status: 500 }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from("audio_files")
      .update({ status: "processing" })
      .eq("id", audio_file_id);

    // Set up Server-Sent Events
    const encoder = new TextEncoder();

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress event
          const progressData = JSON.stringify({
            type: "progress",
            progress: 0,
            message: "Starting transcription...",
          });
          controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));

          // Get recommended model
          const model = getRecommendedModel({
            prioritizeCost: true,
            needsHighQuality: options.high_quality || false,
            needsStreaming: true,
          });

          // Prepare transcription options
          const transcriptionOptions: TranscriptionOptions = {
            model,
            language: options.language,
            prompt: options.prompt,
            response_format: "text",
            temperature: options.temperature,
          };

          console.log(
            `🚀 Starting streaming transcription with model: ${model}`
          );

          const startTime = Date.now();
          let chunkCount = 0;

          // Progress callback for streaming
          const onProgress = (chunk: string) => {
            chunkCount++;
            const progressEvent = JSON.stringify({
              type: "chunk",
              chunk,
              chunkNumber: chunkCount,
            });
            controller.enqueue(encoder.encode(`data: ${progressEvent}\n\n`));

            // Send progress update
            const progressPercent = Math.min(90, chunkCount * 5);
            const progressData = JSON.stringify({
              type: "progress",
              progress: progressPercent,
              message: "Processing transcription...",
            });
            controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
          };

          // Perform streaming transcription
          const result = await transcribeAudioStreaming(
            audioBuffer,
            audioFile.original_filename,
            transcriptionOptions,
            onProgress
          );

          const endTime = Date.now();
          const processingTime = endTime - startTime;

          // Calculate word count
          const wordCount = result.text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;

          // Save transcript to database
          const { data: savedTranscript, error: saveError } =
            await supabaseAdmin
              .from("transcripts")
              .insert({
                audio_file_id,
                uid,
                content: result.text,
                language: result.language || options.language || "en",
                word_count: wordCount,
                processing_time_ms: processingTime,
                model_used: model,
                cost_estimate_usd: estimateTranscriptionCost(
                  audioFile.file_size_bytes,
                  audioFile.mime_type,
                  model
                ).estimatedCostUSD,
              })
              .select()
              .single();

          if (saveError) {
            console.error("❌ Error saving transcript:", saveError);
            const errorEvent = JSON.stringify({
              type: "error",
              error: "Failed to save transcript",
            });
            controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
          } else {
            // Update audio file status to completed
            await supabaseAdmin
              .from("audio_files")
              .update({ status: "completed" })
              .eq("id", audio_file_id);

            // Send completion event
            const completionEvent = JSON.stringify({
              type: "complete",
              transcript: {
                id: savedTranscript.id,
                text: result.text,
                word_count: wordCount,
                processing_time_ms: processingTime,
                model_used: model,
              },
            });
            controller.enqueue(encoder.encode(`data: ${completionEvent}\n\n`));
          }

          // Close the stream
          controller.close();
        } catch (error: any) {
          console.error("❌ Streaming transcription error:", error);

          // Update status to failed
          await supabaseAdmin
            .from("audio_files")
            .update({ status: "failed" })
            .eq("id", audio_file_id);

          const errorEvent = JSON.stringify({
            type: "error",
            error: error.message || "Transcription failed",
          });
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  } catch (error: any) {
    console.error("❌ Error in streaming transcription endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

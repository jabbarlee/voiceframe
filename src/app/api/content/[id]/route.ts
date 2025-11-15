import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generateContentFromTranscript,
  estimateContentGenerationCost,
} from "@/lib/content-generation";

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

    // First, verify the audio file exists and belongs to the user
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("id, uid, original_filename, status")
      .eq("id", audioId)
      .eq("uid", uid)
      .maybeSingle(); // Use maybeSingle() to handle potential issues

    if (audioError) {
      console.error("❌ Database error checking audio file:", audioError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!audioFile) {
      console.error("❌ Audio file not found or access denied");
      return NextResponse.json(
        { success: false, error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Check if learning content already exists for this audio file
    const { data: existingContent, error: contentError } = await supabaseAdmin
      .from("learning_content")
      .select("content")
      .eq("audio_file_id", audioId)
      .eq("uid", uid)
      .maybeSingle(); // Use maybeSingle() to handle potential issues

    if (contentError) {
      console.error(
        "❌ Database error checking existing content:",
        contentError
      );
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (existingContent) {
      // Return existing content from database
      console.log("✅ Returning existing learning content from database");
      return NextResponse.json({
        success: true,
        data: existingContent.content,
        source: "database",
      });
    }

    // If no existing content, generate new content using AI
    console.log("🎯 No existing content found, generating new content");

    // Get audio file details for content generation
    const audioTitle = audioFile.original_filename.replace(/\.[^/.]+$/, ""); // Remove file extension

    // Get the transcript for this audio file
    const { data: transcriptData, error: transcriptError } = await supabaseAdmin
      .from("transcripts")
      .select("content, created_at, word_count")
      .eq("audio_file_id", audioId)
      .eq("uid", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (transcriptError) {
      console.error("❌ Error fetching transcript:", transcriptError);
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    if (!transcriptData) {
      console.error("❌ No transcript found for this audio file");
      return NextResponse.json(
        {
          success: false,
          error: "Transcript not found. Please transcribe the audio first.",
        },
        { status: 404 }
      );
    }

    // Estimate content generation cost
    const estimatedCost = estimateContentGenerationCost(
      transcriptData.content.length
    );
    console.log(
      `💰 Estimated content generation cost: $${estimatedCost.toFixed(4)}`
    );

    try {
      // Generate content from transcript using AI
      const contentData = await generateContentFromTranscript({
        audioId,
        audioTitle: audioTitle || "Audio Content",
        transcript: transcriptData.content,
        duration: "Unknown", // Duration not available in current schema
        processedAt: new Date().toISOString(),
        transcriptMetadata: {
          wordCount: transcriptData.word_count,
          model: "whisper-1", // Default model used for transcription
        },
      });

      console.log("✅ AI content generation completed successfully");

      // Store the generated content in the database for future use
      // Double-check if content was created by another request while we were generating
      const { data: doubleCheckContent, error: doubleCheckError } =
        await supabaseAdmin
          .from("learning_content")
          .select("content")
          .eq("audio_file_id", audioId)
          .eq("uid", uid)
          .maybeSingle(); // Use maybeSingle() to handle potential issues

      if (doubleCheckError) {
        console.error(
          "❌ Database error during double-check:",
          doubleCheckError
        );
        // Continue with insertion attempt despite error
      } else if (doubleCheckContent) {
        // Another request already created the content, return that instead
        console.log(
          "✅ Content was created by another request, returning existing content"
        );
        return NextResponse.json({
          success: true,
          data: doubleCheckContent.content,
          source: "database",
        });
      }

      // Try to insert the content
      try {
        const { error: insertError } = await supabaseAdmin
          .from("learning_content")
          .insert({
            uid,
            audio_file_id: audioId,
            content: contentData,
          });

        if (insertError) {
          // Check if it's a duplicate key error (someone else inserted while we were working)
          if (insertError.code === "23505") {
            // Unique constraint violation
            console.log("🔄 Duplicate detected, fetching existing content");
            const { data: existingAfterError } = await supabaseAdmin
              .from("learning_content")
              .select("content")
              .eq("audio_file_id", audioId)
              .eq("uid", uid)
              .maybeSingle(); // Use maybeSingle() to handle potential issues

            if (existingAfterError) {
              // Also update audio file status to completed if not already
              await supabaseAdmin
                .from("audio_files")
                .update({
                  status: "completed",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", audioId)
                .eq("uid", uid);

              return NextResponse.json({
                success: true,
                data: existingAfterError.content,
                source: "database",
              });
            }
          }

          console.error("❌ Error saving content to database:", insertError);
          // Return the generated content even if we couldn't save it
          return NextResponse.json({
            success: true,
            data: contentData,
            source: "generated",
            warning: "Content generated but not saved to database",
          });
        }

        // Successfully saved content to database
        console.log("✅ Content saved to database successfully");

        // Also update audio file status to completed if not already
        await supabaseAdmin
          .from("audio_files")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", audioId)
          .eq("uid", uid);

        return NextResponse.json({
          success: true,
          data: contentData,
          source: "generated",
        });
      } catch (dbError) {
        console.error("❌ Unexpected database error:", dbError);
        // Return the generated content even if we couldn't save it
        return NextResponse.json({
          success: true,
          data: contentData,
          source: "generated",
          warning: "Content generated but not saved to database",
        });
      }
    } catch (generationError) {
      console.error("❌ Content generation failed:", generationError);
      return NextResponse.json(
        {
          success: false,
          error: `Content generation failed: ${
            generationError instanceof Error
              ? generationError.message
              : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Content API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

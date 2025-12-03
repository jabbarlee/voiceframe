import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ============================================================================
// Constants
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 15000;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Delays execution for a specified number of milliseconds
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks if an error is a network/timeout error that should be retried
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch failed") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnreset") ||
      message.includes("econnrefused")
    );
  }
  return false;
}

/**
 * Wraps a database operation with timeout and retry logic
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`${operationName} timed out after ${REQUEST_TIMEOUT_MS}ms`)),
          REQUEST_TIMEOUT_MS
        );
      });

      // Race between the operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(
        `⚠️ ${operationName} attempt ${attempt}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error
      );

      // Only retry on network/timeout errors
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        console.log(`🔄 Retrying ${operationName} in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Verifies the Firebase ID token and returns the decoded token
 */
async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Authorization token required", status: 401 };
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { decodedToken };
  } catch (error) {
    console.error("❌ Invalid ID token:", error);
    return { error: "Invalid authentication token", status: 401 };
  }
}

/**
 * Fetches an audio file by ID, ensuring the user owns it
 */
async function getAudioFileByIdAndUser(audioId: string, uid: string) {
  try {
    const { data: audioFile, error } = await withRetry(
      () =>
        supabaseAdmin
          .from("audio_files")
          .select("*")
          .eq("id", audioId)
          .eq("uid", uid)
          .maybeSingle(),
      "Fetch audio file"
    );

    if (error) {
      console.error("❌ Database error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        error: "Database error. Please check your connection and try again.",
        status: 500,
      };
    }

    if (!audioFile) {
      return { error: "Audio file not found", status: 404 };
    }

    return { audioFile };
  } catch (error) {
    console.error("❌ Failed to fetch audio file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("timed out")) {
      return {
        error: "Request timed out. Please check your connection and try again.",
        status: 504,
      };
    }

    return {
      error: "Failed to connect to database. Please try again later.",
      status: 503,
    };
  }
}

/**
 * Deletes related records from the database (transcripts, learning_content)
 * These should cascade automatically due to ON DELETE CASCADE, but we do it explicitly for safety
 */
async function deleteRelatedRecords(audioId: string, uid: string) {
  try {
    // Delete transcripts associated with this audio file
    const { error: transcriptError } = await withRetry(
      () =>
        supabaseAdmin
          .from("transcripts")
          .delete()
          .eq("audio_file_id", audioId)
          .eq("uid", uid),
      "Delete transcripts"
    );

    if (transcriptError) {
      console.error("❌ Error deleting transcripts:", transcriptError);
      // Continue with deletion even if transcripts fail (might not exist)
    }
  } catch (error) {
    console.warn("⚠️ Could not delete transcripts:", error);
    // Continue anyway - transcripts might not exist
  }

  try {
    // Delete learning content associated with this audio file
    const { error: contentError } = await withRetry(
      () =>
        supabaseAdmin
          .from("learning_content")
          .delete()
          .eq("audio_file_id", audioId)
          .eq("uid", uid),
      "Delete learning content"
    );

    if (contentError) {
      console.error("❌ Error deleting learning content:", contentError);
      // Continue with deletion even if content fails (might not exist)
    }
  } catch (error) {
    console.warn("⚠️ Could not delete learning content:", error);
    // Continue anyway - learning content might not exist
  }

  return { success: true };
}

/**
 * Deletes the audio file from Supabase Storage
 */
async function deleteFromStorage(filePath: string) {
  try {
    const { error } = await withRetry(
      () => supabaseAdmin.storage.from("audio-files").remove([filePath]),
      "Delete from storage"
    );

    if (error) {
      console.error("❌ Storage deletion error:", error);
      return { error: "Failed to delete file from storage", status: 500 };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Storage deletion failed:", error);
    // Return success anyway - file might already be deleted
    return { success: true, warning: "Could not verify storage deletion" };
  }
}

/**
 * Deletes the audio file record from the database
 */
async function deleteAudioFileRecord(audioId: string, uid: string) {
  try {
    const { error } = await withRetry(
      () =>
        supabaseAdmin
          .from("audio_files")
          .delete()
          .eq("id", audioId)
          .eq("uid", uid),
      "Delete audio file record"
    );

    if (error) {
      console.error("❌ Database deletion error:", error);
      return { error: "Failed to delete audio file record", status: 500 };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to delete audio file record:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("timed out")) {
      return {
        error: "Request timed out. Please try again.",
        status: 504,
      };
    }

    return {
      error: "Failed to delete audio file. Please try again later.",
      status: 503,
    };
  }
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * GET /api/audio/[id]
 * Fetches a single audio file by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: audioId } = await params;

    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult.decodedToken;

    // Fetch the audio file
    const fileResult = await getAudioFileByIdAndUser(audioId, uid);
    if ("error" in fileResult) {
      return NextResponse.json(
        { success: false, error: fileResult.error },
        { status: fileResult.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: fileResult.audioFile,
    });
  } catch (error) {
    console.error("❌ Audio GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audio/[id]
 * Updates an audio file's metadata (e.g., rename)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: audioId } = await params;

    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult.decodedToken;

    // Parse request body
    const body = await request.json();
    const { original_filename } = body;

    if (!original_filename || typeof original_filename !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid filename provided" },
        { status: 400 }
      );
    }

    // Validate filename (basic sanitization)
    const sanitizedFilename = original_filename.trim();
    if (sanitizedFilename.length === 0 || sanitizedFilename.length > 255) {
      return NextResponse.json(
        { success: false, error: "Filename must be between 1 and 255 characters" },
        { status: 400 }
      );
    }

    // Verify the audio file exists and belongs to the user
    const fileResult = await getAudioFileByIdAndUser(audioId, uid);
    if ("error" in fileResult) {
      return NextResponse.json(
        { success: false, error: fileResult.error },
        { status: fileResult.status }
      );
    }

    // Update the filename in the database
    const { data: updatedFile, error } = await withRetry(
      () =>
        supabaseAdmin
          .from("audio_files")
          .update({ original_filename: sanitizedFilename, updated_at: new Date().toISOString() })
          .eq("id", audioId)
          .eq("uid", uid)
          .select()
          .single(),
      "Update audio file"
    );

    if (error) {
      console.error("❌ Database update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update audio file" },
        { status: 500 }
      );
    }

    console.log(`✅ Audio file renamed: ${audioId} -> ${sanitizedFilename}`);

    return NextResponse.json({
      success: true,
      message: "Audio file renamed successfully",
      data: updatedFile,
    });
  } catch (error) {
    console.error("❌ Audio PATCH API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audio/[id]
 * Deletes an audio file and all associated data
 *
 * This endpoint will:
 * 1. Verify the user owns the file
 * 2. Delete related transcripts from the database
 * 3. Delete related learning content from the database
 * 4. Delete the audio file from Supabase Storage
 * 5. Delete the audio file record from the database
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: audioId } = await params;

    console.log(`🗑️ Processing delete request for audio file: ${audioId}`);

    // Step 1: Verify authentication
    const authResult = await verifyAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult.decodedToken;
    console.log(`✅ User authenticated: ${uid}`);

    // Step 2: Verify the audio file exists and belongs to the user
    const fileResult = await getAudioFileByIdAndUser(audioId, uid);
    if ("error" in fileResult) {
      return NextResponse.json(
        { success: false, error: fileResult.error },
        { status: fileResult.status }
      );
    }

    const { audioFile } = fileResult;
    console.log(`✅ Audio file found: ${audioFile.original_filename}`);

    // Step 3: Delete related records (transcripts, learning_content)
    console.log("🔄 Deleting related records...");
    await deleteRelatedRecords(audioId, uid);
    console.log("✅ Related records deleted");

    // Step 4: Delete from storage
    if (audioFile.file_path) {
      console.log(`🔄 Deleting from storage: ${audioFile.file_path}`);
      const storageResult = await deleteFromStorage(audioFile.file_path);
      if ("error" in storageResult) {
        // Log but don't fail - the file might already be deleted or path invalid
        console.warn("⚠️ Storage deletion warning:", storageResult.error);
      } else {
        console.log("✅ File deleted from storage");
      }
    }

    // Step 5: Delete the audio file record
    console.log("🔄 Deleting audio file record...");
    const deleteResult = await deleteAudioFileRecord(audioId, uid);
    if ("error" in deleteResult) {
      return NextResponse.json(
        { success: false, error: deleteResult.error },
        { status: deleteResult.status }
      );
    }

    console.log(`✅ Audio file deleted successfully: ${audioId}`);

    return NextResponse.json({
      success: true,
      message: "Audio file and all associated data deleted successfully",
      data: {
        id: audioId,
        filename: audioFile.original_filename,
      },
    });
  } catch (error) {
    console.error("❌ Audio DELETE API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Provide user-friendly error messages based on error type
    if (
      errorMessage.includes("timed out") ||
      errorMessage.includes("timeout")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Request timed out. Please check your connection and try again.",
          errorType: "TIMEOUT",
        },
        { status: 504 }
      );
    }

    if (
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("network")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Network error. Please check your connection and try again.",
          errorType: "NETWORK_ERROR",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete audio file. Please try again later.",
        errorType: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

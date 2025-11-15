import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { downloadAudioFile } from "@/lib/storage-utils";

/**
 * GET /api/audio/[id]/debug
 * Debug endpoint to test audio file access from Supabase Storage
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 DEBUG: Checking audio file access for ID:", params.id);

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

    // Get audio file info
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("*")
      .eq("id", params.id)
      .eq("uid", uid)
      .maybeSingle();

    if (audioError || !audioFile) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio file not found",
          debug: { audioError, params: params.id, uid },
        },
        { status: 404 }
      );
    }

    console.log("📊 Audio file details:", {
      id: audioFile.id,
      file_path: audioFile.file_path,
      public_url: audioFile.public_url,
      file_size: audioFile.file_size_bytes,
      status: audioFile.status,
    });

    // Test bucket access
    console.log("🔍 Testing bucket access...");
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage
      .from("audio-files")
      .list();

    console.log("📂 Bucket root listing:", bucketData?.slice(0, 5)); // First 5 items
    console.log("❌ Bucket error:", bucketError);

    // Test file existence
    const pathParts = audioFile.file_path.split("/");
    const folderPath =
      pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
    const fileName = pathParts[pathParts.length - 1];

    console.log("🔍 Checking folder:", folderPath, "for file:", fileName);

    const { data: folderData, error: folderError } = await supabaseAdmin.storage
      .from("audio-files")
      .list(folderPath);

    console.log(
      "📂 Folder contents:",
      folderData?.map((f) => f.name)
    );
    console.log("❌ Folder error:", folderError);

    // Test direct download
    console.log("🔍 Testing direct download...");
    let downloadResult = null;
    let downloadError = null;

    try {
      const buffer = await downloadAudioFile(audioFile);
      downloadResult = {
        success: true,
        bufferSize: buffer.length,
        message: "Download successful",
      };
    } catch (error) {
      downloadError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      debug: {
        audioFile: {
          id: audioFile.id,
          file_path: audioFile.file_path,
          public_url: audioFile.public_url,
          file_size_bytes: audioFile.file_size_bytes,
          mime_type: audioFile.mime_type,
          status: audioFile.status,
        },
        bucket: {
          rootListing: bucketData?.slice(0, 5),
          bucketError: bucketError?.message,
        },
        folder: {
          path: folderPath,
          fileName: fileName,
          contents: folderData?.map((f) => f.name),
          folderError: folderError?.message,
        },
        download: {
          result: downloadResult,
          error: downloadError,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        debug: { error: error.toString() },
      },
      { status: 500 }
    );
  }
}

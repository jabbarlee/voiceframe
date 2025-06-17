import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Processing audio upload request");

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    console.log("🔑 Auth header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header");
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    console.log("🔑 Extracted token:", idToken ? "Present" : "Missing");

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log("✅ Token verified for user:", decodedToken.uid);
    } catch (error) {
      console.error("❌ Invalid ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Parse multipart form data
    let formData;
    try {
      formData = await request.formData();
      console.log("📋 FormData parsed successfully");
    } catch (error) {
      console.error("❌ Failed to parse FormData:", error);
      return NextResponse.json(
        { success: false, error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("audio") as File;
    console.log(
      "📁 File from FormData:",
      file ? `${file.name} (${file.size} bytes)` : "Missing"
    );

    if (!file) {
      console.log("❌ No audio file provided");
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload an audio file.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      console.log("❌ File too large:", file.size);
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    console.log("✅ File validation passed");

    // Generate unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "audio";
    const fileName = `${uid}/${timestamp}-${crypto.randomUUID()}.${fileExtension}`;

    console.log("📁 Generated file path:", fileName);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("🔄 Uploading to Supabase storage...");

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("audio-files")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded to storage:", uploadData.path);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("audio-files")
      .getPublicUrl(fileName);

    console.log("🔄 Saving metadata to database...");

    // Insert metadata into database
    const { data: audioFile, error: dbError } = await supabaseAdmin
      .from("audio_files")
      .insert({
        uid,
        original_filename: file.name,
        file_path: uploadData.path,
        file_size_bytes: file.size,
        mime_type: file.type,
        public_url: urlData.publicUrl,
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database insert error:", dbError);

      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from("audio-files").remove([fileName]);

      return NextResponse.json(
        { success: false, error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    console.log("✅ Upload completed successfully. File ID:", audioFile.id);

    return NextResponse.json({
      success: true,
      data: {
        id: audioFile.id,
        filename: audioFile.original_filename,
        size: audioFile.file_size_bytes,
        mimeType: audioFile.mime_type,
        publicUrl: audioFile.public_url,
        status: audioFile.status,
        createdAt: audioFile.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Audio upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

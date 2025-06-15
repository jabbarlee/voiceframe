import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const idToken = formData.get("idToken") as string;

    if (!file || !idToken) {
      return NextResponse.json(
        { success: false, error: "File and authentication token are required" },
        { status: 400 }
      );
    }

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

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${timestamp}-${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExtension}`;
    const filePath = `${uid}/${uniqueFilename}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("audio-files")
      .upload(filePath, buffer, {
        contentType: file.type,
        duplex: "half",
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("audio-files").getPublicUrl(filePath);

    // Store file metadata in database
    const { data: audioFileRecord, error: dbError } = await supabaseAdmin
      .from("audio_files")
      .insert({
        uid,
        original_filename: file.name,
        file_path: filePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        public_url: publicUrl,
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database insert error:", dbError);

      // Try to clean up the uploaded file if database insert fails
      await supabaseAdmin.storage.from("audio-files").remove([filePath]);

      return NextResponse.json(
        { success: false, error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded and saved successfully:", {
      id: audioFileRecord.id,
      filename: file.name,
      path: filePath,
      size: file.size,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: audioFileRecord.id,
        filename: file.name,
        path: filePath,
        size: file.size,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error("❌ Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

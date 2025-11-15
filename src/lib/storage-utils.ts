import { supabaseAdmin } from "./supabase-admin";

/**
 * Download an audio file from Supabase Storage
 * Handles both public URLs and signed URLs for secure access
 */
export async function downloadAudioFile(audioFile: {
  id: string;
  file_path: string;
  public_url: string | null;
  original_filename: string;
}): Promise<Buffer> {
  try {
    console.log("📥 Downloading audio file:", audioFile.id);
    console.log("📁 File path:", audioFile.file_path);
    console.log("🔗 Public URL:", audioFile.public_url);

    // Method 1: Try direct download from Supabase Storage
    console.log("🔄 Attempting direct storage download...");
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("audio-files")
      .download(audioFile.file_path);

    if (!downloadError && fileData) {
      console.log(
        "✅ Downloaded via Supabase storage API, size:",
        fileData.size
      );
      const arrayBuffer = await fileData.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    console.log("⚠️ Storage download failed:", downloadError?.message);
    console.log("📊 Full error details:", downloadError);

    // Method 2: Try using signed URL if storage download fails
    console.log("🔄 Attempting signed URL creation...");
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseAdmin.storage
        .from("audio-files")
        .createSignedUrl(audioFile.file_path, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.log("❌ Failed to create signed URL:", signedUrlError?.message);
      console.log("📊 Signed URL error details:", signedUrlError);

      // Method 3: List files to debug bucket access
      console.log("🔍 Debugging: Checking bucket contents...");
      const pathParts = audioFile.file_path.split("/");
      const folderPath =
        pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
      const fileName = pathParts[pathParts.length - 1];

      const { data: listData, error: listError } = await supabaseAdmin.storage
        .from("audio-files")
        .list(folderPath);

      console.log("📂 Folder contents:", listData?.map((f) => f.name) || []);
      console.log("🔍 Looking for file:", fileName);
      console.log("📊 List error:", listError);

      throw new Error(
        `Cannot access audio file from storage. Download error: ${downloadError?.message}, Signed URL error: ${signedUrlError?.message}`
      );
    }

    console.log("🔗 Using signed URL for download:", signedUrlData.signedUrl);
    const response = await fetch(signedUrlData.signedUrl);

    if (!response.ok) {
      console.log(
        "❌ Signed URL fetch failed:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.log("📊 Response body:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("✅ Downloaded via signed URL, size:", arrayBuffer.byteLength);
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("❌ Error downloading audio file:", error);
    throw new Error(
      `Failed to download audio file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get a signed URL for an audio file that's valid for a specific duration
 */
export async function getAudioFileSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("audio-files")
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error("❌ Error creating signed URL:", error);
    throw error;
  }
}

/**
 * Check if an audio file exists in storage
 */
export async function checkAudioFileExists(filePath: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("audio-files")
      .list(filePath.split("/").slice(0, -1).join("/"), {
        search: filePath.split("/").pop(),
      });

    return !error && data && data.length > 0;
  } catch (error) {
    console.error("❌ Error checking file existence:", error);
    return false;
  }
}

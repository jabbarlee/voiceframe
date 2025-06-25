import { supabaseAdmin } from "@/lib/supabase-admin";

export interface UserUsage {
  id: string;
  uid: string;
  plan: string;
  allowed_minutes: number;
  used_minutes: number;
  cycle_start: string;
  remaining_minutes: number;
  is_over_limit: boolean;
}

export async function getUserUsage(uid: string): Promise<UserUsage | null> {
  try {
    const { data: usage, error } = await supabaseAdmin
      .from("user_usage")
      .select("*")
      .eq("uid", uid)
      .single();

    if (error || !usage) {
      console.error("❌ Error fetching user usage:", error);
      return null;
    }

    const remaining_minutes = Math.max(
      0,
      usage.allowed_minutes - usage.used_minutes
    );
    const is_over_limit = usage.used_minutes >= usage.allowed_minutes;

    return {
      ...usage,
      remaining_minutes,
      is_over_limit,
    };
  } catch (error) {
    console.error("❌ Error in getUserUsage:", error);
    return null;
  }
}

export async function checkUsageLimit(
  uid: string,
  estimatedMinutes: number = 0
): Promise<{
  allowed: boolean;
  usage: UserUsage | null;
  message?: string;
}> {
  const usage = await getUserUsage(uid);

  if (!usage) {
    return {
      allowed: false,
      usage: null,
      message: "Unable to verify usage limits. Please try again.",
    };
  }

  if (usage.is_over_limit) {
    return {
      allowed: false,
      usage,
      message: `You've exceeded your monthly limit of ${usage.allowed_minutes} minutes. Please upgrade your plan to continue.`,
    };
  }

  if (
    estimatedMinutes > 0 &&
    usage.used_minutes + estimatedMinutes > usage.allowed_minutes
  ) {
    return {
      allowed: false,
      usage,
      message: `This file would exceed your monthly limit. You have ${usage.remaining_minutes} minutes remaining.`,
    };
  }

  return {
    allowed: true,
    usage,
  };
}

export function estimateAudioDuration(
  fileSizeBytes: number,
  mimeType?: string
): number {
  // More accurate estimation based on file type and typical bitrates
  const megabytes = fileSizeBytes / (1024 * 1024);

  // Typical bitrates (kbps) for different formats
  let estimatedBitrate = 128; // Default for MP3

  if (mimeType) {
    switch (mimeType.toLowerCase()) {
      case "audio/wav":
        estimatedBitrate = 1411; // Uncompressed WAV
        break;
      case "audio/m4a":
      case "audio/aac":
        estimatedBitrate = 128; // AAC compression
        break;
      case "audio/ogg":
        estimatedBitrate = 112; // OGG Vorbis
        break;
      case "audio/webm":
        estimatedBitrate = 128; // WebM audio
        break;
      case "audio/mpeg":
      case "audio/mp3":
      default:
        estimatedBitrate = 128; // MP3
        break;
    }
  }

  // Calculate duration: (file size in bits) / (bitrate in bits per second) / 60 seconds
  const fileSizeBits = fileSizeBytes * 8;
  const bitratePerSecond = estimatedBitrate * 1000;
  const durationMinutes = fileSizeBits / bitratePerSecond / 60;

  // Round up to be conservative and add small buffer
  return Math.ceil(durationMinutes * 1.1); // 10% buffer for estimation error
}

export async function updateUserUsage(
  uid: string,
  minutesToAdd: number
): Promise<boolean> {
  try {
    const { data: currentUsage, error: fetchError } = await supabaseAdmin
      .from("user_usage")
      .select("used_minutes")
      .eq("uid", uid)
      .single();

    if (fetchError || !currentUsage) {
      console.error("❌ Error fetching current usage:", fetchError);
      return false;
    }

    const newUsedMinutes = currentUsage.used_minutes + minutesToAdd;

    const { error: updateError } = await supabaseAdmin
      .from("user_usage")
      .update({
        used_minutes: newUsedMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid);

    if (updateError) {
      console.error("❌ Error updating usage:", updateError);
      return false;
    }

    console.log(
      `✅ Updated user usage: +${minutesToAdd} minutes (total: ${newUsedMinutes})`
    );
    return true;
  } catch (error) {
    console.error("❌ Error in updateUserUsage:", error);
    return false;
  }
}

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
    console.log("📊 Getting usage for user:", uid);

    // Validate Supabase connection first
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("❌ Missing Supabase environment variables");
      return null;
    }

    // Get all usage records for this user, ordered by created_at desc
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase request timeout")), 10000)
    );

    const queryPromise = supabaseAdmin
      .from("user_usage")
      .select("*")
      .eq("uid", uid)
      .order("created_at", { ascending: false });

    const { data: usageRecords, error } = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ])) as any;

    if (error) {
      console.error("❌ Supabase error fetching user usage:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log(`📊 Found ${usageRecords?.length || 0} usage records`);

    let usage = null;

    if (!usageRecords || usageRecords.length === 0) {
      // No usage record exists, create one with default values
      console.log("🔄 Creating default usage record for user:", uid);
      const defaultUsage = {
        uid,
        plan: "free",
        allowed_minutes: 30,
        used_minutes: 0,
        cycle_start: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString(),
      };

      const { data: newUsage, error: insertError } = await supabaseAdmin
        .from("user_usage")
        .insert(defaultUsage)
        .select("*")
        .single();

      if (insertError) {
        console.error("❌ Error creating default usage record:", insertError);
        return null;
      }

      usage = newUsage;
    } else {
      // Use the most recent record
      usage = usageRecords[0];

      // If there are duplicates, clean them up (keep the most recent)
      if (usageRecords.length > 1) {
        console.log(
          `🔄 Found ${usageRecords.length} duplicate usage records for user ${uid}, cleaning up...`
        );
        const duplicateIds = usageRecords
          .slice(1)
          .map((record: any) => record.id);

        const { error: deleteError } = await supabaseAdmin
          .from("user_usage")
          .delete()
          .in("id", duplicateIds);

        if (deleteError) {
          console.error(
            "❌ Error cleaning up duplicate usage records:",
            deleteError
          );
        } else {
          console.log(
            `✅ Cleaned up ${duplicateIds.length} duplicate usage records`
          );
        }
      }
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
    // First ensure the user has a usage record (this will create one if it doesn't exist)
    const usage = await getUserUsage(uid);

    if (!usage) {
      console.error("❌ Unable to get or create usage record for user:", uid);
      return false;
    }

    const newUsedMinutes = usage.used_minutes + minutesToAdd;

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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan limits configuration
const PLAN_LIMITS = {
  free: { minutes: 30, storage: 1 },
  starter: { minutes: 120, storage: 5 },
  pro: { minutes: 600, storage: 25 },
  enterprise: { minutes: 3000, storage: 100 },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authorization header
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (await params).id;

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userId)
      .maybeSingle();

    if (userError) {
      console.error("❌ Error fetching user:", userError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user_usage data from the database
    let { data: usageData, error: usageError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("uid", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (usageError) {
      console.error("❌ Error fetching user usage:", usageError);
    }

    // If no usage record exists, create one with default values
    if (!usageData) {
      const defaultUsage = {
        uid: userId,
        plan: "free",
        allowed_minutes: 30,
        used_minutes: 0,
        cycle_start: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString(),
      };

      const { data: newUsage, error: insertError } = await supabase
        .from("user_usage")
        .insert(defaultUsage)
        .select("*")
        .single();

      if (insertError) {
        console.error("❌ Error creating default usage record:", insertError);
      } else {
        usageData = newUsage;
      }
    }

    // Fetch audio files with related data
    const { data: audioFiles, error: audioError } = await supabase
      .from("audio_files")
      .select(
        `
        id,
        original_filename,
        file_size_bytes,
        mime_type,
        status,
        created_at,
        transcripts (
          id,
          content,
          word_count,
          created_at
        )
      `
      )
      .eq("uid", userId)
      .order("created_at", { ascending: false });

    if (audioError) {
      console.error("Error fetching audio files:", audioError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch audio files" },
        { status: 500 }
      );
    }

    const files = audioFiles || [];

    // Calculate storage usage (in GB)
    const totalStorageBytes = files.reduce((total, file) => {
      return total + (file.file_size_bytes || 0);
    }, 0);
    const storageUsedGB = totalStorageBytes / (1024 * 1024 * 1024);

    // Get plan from user_usage table
    const plan = usageData?.plan || "free";
    const planKey = plan.toLowerCase() as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.free;

    // Get used minutes from user_usage table
    const usedMinutes = usageData?.used_minutes || 0;
    const allowedMinutes = usageData?.allowed_minutes || limits.minutes;

    // Calculate statistics from real data
    const totalTranscriptions = files.reduce((total, file) => {
      return total + (file.transcripts?.length || 0);
    }, 0);

    // Estimate total minutes processed from file sizes
    const totalMinutesProcessed = usedMinutes;

    const averageFileSize =
      files.length > 0 ? totalStorageBytes / files.length : 0;

    // Get last activity date
    const lastActivity =
      files.length > 0
        ? new Date(
            Math.max(
              ...files.map((file) => new Date(file.created_at).getTime())
            )
          ).toISOString()
        : userData.created_at;

    // Calculate cycle renewal date (next month from cycle_start)
    const cycleStart = usageData?.cycle_start
      ? new Date(usageData.cycle_start)
      : new Date();
    const renewsOn = new Date(cycleStart);
    renewsOn.setMonth(renewsOn.getMonth() + 1);

    // Format plan name for display
    const formatPlanName = (planName: string) => {
      return planName.charAt(0).toUpperCase() + planName.slice(1);
    };

    const profile = {
      id: userId,
      name: userData.full_name || "",
      email: userData.email || "",
      avatarUrl: userData.avatar_url || null,
      createdAt: userData.created_at,
      subscription: {
        plan: formatPlanName(plan),
        status: "Active",
        renewsOn: renewsOn.toISOString(),
        cycleStart: cycleStart.toISOString(),
      },
      usage: {
        transcription: {
          used: usedMinutes,
          limit: allowedMinutes,
        },
        storage: {
          used: Math.round(storageUsedGB * 100) / 100, // Round to 2 decimals
          limit: limits.storage,
        },
        audioFiles: files.length,
      },
      apiKey: "", // Placeholder - API keys feature is coming soon
      preferences: {
        notifications: {
          productUpdates: true,
          weeklySummary: false,
          transcriptionComplete: true,
        },
        privacy: {
          dataRetention: "1year",
          analytics: true,
        },
      },
      stats: {
        totalTranscriptions,
        totalMinutesProcessed,
        averageFileSize: Math.round(averageFileSize),
        lastActivity,
      },
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

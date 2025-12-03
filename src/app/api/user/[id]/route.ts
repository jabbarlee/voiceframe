import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const userId = await params.id;

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userId)
      .maybeSingle(); // Use maybeSingle() to handle potential duplicates or missing records

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

    // Fetch audio files with related data
    const { data: audioFiles, error: audioError } = await supabase
      .from("audio_files")
      .select(
        `
        id,
        original_filename,
        file_size_bytes,
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

    // Calculate current month usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthFiles = files.filter((file) => {
      const createdAt = new Date(file.created_at);
      return createdAt >= currentMonth;
    });

    // Calculate transcription usage (count of transcripts this month)
    const transcriptionUsed = thisMonthFiles.reduce((total, file) => {
      return total + (file.transcripts?.length || 0);
    }, 0);

    // Calculate storage usage (in GB)
    const totalStorageBytes = files.reduce((total, file) => {
      return total + (file.file_size_bytes || 0);
    }, 0);
    const storageUsed = totalStorageBytes / (1024 * 1024 * 1024); // Convert to GB

    // Get subscription info (you might want to add this to your schema)
    // For now, using default values - in production you'd have a subscriptions table
    const subscriptionPlan = "Premium"; // Would come from subscriptions table
    const subscriptionLimits = {
      Free: { transcription: 60, storage: 1 },
      Premium: { transcription: 600, storage: 10 },
      Pro: { transcription: 1800, storage: 50 },
    };

    const limits =
      subscriptionLimits[subscriptionPlan as keyof typeof subscriptionLimits] ||
      subscriptionLimits.Free;

    // Calculate statistics from real data
    const totalTranscriptions = files.reduce((total, file) => {
      return total + (file.transcripts?.length || 0);
    }, 0);

    const totalWordsProcessed = files.reduce((total, file) => {
      return (
        total +
        (file.transcripts?.reduce((wordTotal, transcript) => {
          return wordTotal + (transcript.word_count || 0);
        }, 0) || 0)
      );
    }, 0);

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

    const profile = {
      id: userId,
      name: userData.full_name || "",
      email: userData.email || "",
      createdAt: userData.created_at,
      subscription: {
        plan: subscriptionPlan,
        status: "Active",
        renewsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeCustomerId: "cus_example123", // Would come from subscriptions table
      },
      usage: {
        transcription: {
          used: transcriptionUsed,
          limit: limits.transcription,
        },
        storage: {
          used: Math.round(storageUsed * 10) / 10, // Round to 1 decimal
          limit: limits.storage,
        },
        audioFiles: files.length,
      },
      apiKey: "vf_live_sk_******************1234", // Would be stored in users table
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
        totalWordsProcessed,
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
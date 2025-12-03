import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminAuth } from "@/lib/firebase-admin";

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

// Helper function to verify the user token and check authorization
async function verifyUserAuthorization(
  request: NextRequest,
  targetUserId: string
): Promise<{ authorized: boolean; uid?: string; error?: string }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { authorized: false, error: "Unauthorized" };
  }

  const token = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // Users can only modify their own data
    if (decodedToken.uid !== targetUserId) {
      return { authorized: false, error: "Forbidden" };
    }
    return { authorized: true, uid: decodedToken.uid };
  } catch {
    return { authorized: false, error: "Invalid token" };
  }
}

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

// PATCH - Update user profile (full_name)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = (await params).id;

    // Verify authorization
    const auth = await verifyUserAuthorization(request, userId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.error === "Forbidden" ? 403 : 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { name, full_name } = body;

    // Use either 'name' or 'full_name' from the request
    const newName = name ?? full_name;

    if (newName === undefined) {
      return NextResponse.json(
        { success: false, error: "No update data provided" },
        { status: 400 }
      );
    }

    // Validate the name
    if (typeof newName !== "string") {
      return NextResponse.json(
        { success: false, error: "Name must be a string" },
        { status: 400 }
      );
    }

    const trimmedName = newName.trim();
    if (trimmedName.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Update the user's full_name in the database
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        full_name: trimmedName,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", userId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating user profile:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log("✅ User profile updated successfully:", userId);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.uid,
        name: updatedUser.full_name,
        email: updatedUser.email,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = (await params).id;

    // Verify authorization
    const auth = await verifyUserAuthorization(request, userId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.error === "Forbidden" ? 403 : 401 }
      );
    }

    console.log("🗑️ Starting account deletion for user:", userId);

    // Get user's audio files to delete from storage
    const { data: audioFiles, error: audioError } = await supabase
      .from("audio_files")
      .select("id, file_path")
      .eq("uid", userId);

    if (audioError) {
      console.error("❌ Error fetching audio files for deletion:", audioError);
    }

    // Delete files from Supabase Storage if they exist
    if (audioFiles && audioFiles.length > 0) {
      const filePaths = audioFiles
        .map((f) => f.file_path)
        .filter((p) => p && p.length > 0);

      if (filePaths.length > 0) {
        console.log(`🗑️ Deleting ${filePaths.length} files from storage...`);
        const { error: storageError } = await supabase.storage
          .from("audio-files")
          .remove(filePaths);

        if (storageError) {
          console.error("❌ Error deleting files from storage:", storageError);
          // Continue with deletion even if storage deletion fails
        } else {
          console.log("✅ Storage files deleted successfully");
        }
      }
    }

    // Delete user from Supabase database
    // Due to CASCADE constraints, this will automatically delete:
    // - audio_files (and their transcripts via cascade)
    // - transcripts
    // - learning_content
    // - user_usage
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("uid", userId);

    if (deleteError) {
      console.error("❌ Error deleting user from database:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete user data" },
        { status: 500 }
      );
    }

    console.log("✅ User data deleted from database");

    // Delete the user from Firebase Authentication
    try {
      await adminAuth.deleteUser(userId);
      console.log("✅ User deleted from Firebase Auth");
    } catch (firebaseError: any) {
      // If the user doesn't exist in Firebase, that's okay
      if (firebaseError.code !== "auth/user-not-found") {
        console.error("❌ Error deleting user from Firebase:", firebaseError);
        // We've already deleted the database records, so log but don't fail
      }
    }

    console.log("✅ Account deletion completed for user:", userId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

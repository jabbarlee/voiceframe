import { supabaseAdmin } from "@/lib/supabase-admin";
import { UserUsage } from "@/lib/usage";

export interface UserCostTracking {
  id: string;
  uid: string;
  total_cost_usd: number;
  monthly_cost_usd: number;
  api_calls_count: number;
  monthly_api_calls: number;
  last_api_call: string;
  cycle_start: string;
  created_at: string;
  updated_at: string;
}

export interface CostLimits {
  monthlyLimit: number; // USD
  dailyLimit: number; // USD  
  perCallLimit: number; // USD
}

// Default cost limits based on plan type
export const COST_LIMITS: Record<string, CostLimits> = {
  free: {
    monthlyLimit: 5.00, // $5/month for free tier
    dailyLimit: 1.00,   // $1/day
    perCallLimit: 0.50, // $0.50 per transcription
  },
  pro: {
    monthlyLimit: 50.00, // $50/month for pro tier  
    dailyLimit: 5.00,    // $5/day
    perCallLimit: 2.00,  // $2 per transcription
  },
  enterprise: {
    monthlyLimit: 500.00, // $500/month for enterprise
    dailyLimit: 50.00,    // $50/day
    perCallLimit: 10.00,  // $10 per transcription
  },
};

/**
 * Get user's current cost tracking information
 */
export async function getUserCostTracking(uid: string): Promise<UserCostTracking | null> {
  try {
    const { data: costRecord, error } = await supabaseAdmin
      .from("user_cost_tracking")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching cost tracking:", error);
      return null;
    }

    if (!costRecord) {
      // Create default cost tracking record
      console.log("🔄 Creating default cost tracking record for user:", uid);
      
      const cycleStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();

      const defaultRecord = {
        uid,
        total_cost_usd: 0,
        monthly_cost_usd: 0,
        api_calls_count: 0,
        monthly_api_calls: 0,
        last_api_call: new Date().toISOString(),
        cycle_start: cycleStart,
      };

      const { data: newRecord, error: insertError } = await supabaseAdmin
        .from("user_cost_tracking")
        .insert(defaultRecord)
        .select("*")
        .single();

      if (insertError) {
        console.error("❌ Error creating cost tracking record:", insertError);
        return null;
      }

      return newRecord;
    }

    // Check if we need to reset monthly costs (new billing cycle)
    const cycleStart = new Date(costRecord.cycle_start);
    const now = new Date();
    const shouldReset = now.getMonth() !== cycleStart.getMonth() || 
                       now.getFullYear() !== cycleStart.getFullYear();

    if (shouldReset) {
      console.log("🔄 Resetting monthly cost tracking for new billing cycle");
      
      const newCycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: updatedRecord, error: updateError } = await supabaseAdmin
        .from("user_cost_tracking")
        .update({
          monthly_cost_usd: 0,
          monthly_api_calls: 0,
          cycle_start: newCycleStart.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("uid", uid)
        .select("*")
        .single();

      if (updateError) {
        console.error("❌ Error resetting monthly costs:", updateError);
        return costRecord;
      }

      return updatedRecord;
    }

    return costRecord;

  } catch (error) {
    console.error("❌ Error in getUserCostTracking:", error);
    return null;
  }
}

/**
 * Check if user can afford the estimated cost for transcription
 */
export async function checkCostLimit(
  uid: string, 
  estimatedCostUSD: number,
  userPlan = "free"
): Promise<{
  allowed: boolean;
  costTracking: UserCostTracking | null;
  message?: string;
}> {
  try {
    const costTracking = await getUserCostTracking(uid);
    
    if (!costTracking) {
      return {
        allowed: false,
        costTracking: null,
        message: "Unable to verify cost limits. Please try again.",
      };
    }

    const limits = COST_LIMITS[userPlan] || COST_LIMITS.free;

    // Check per-call limit
    if (estimatedCostUSD > limits.perCallLimit) {
      return {
        allowed: false,
        costTracking,
        message: `This transcription would cost $${estimatedCostUSD.toFixed(4)}, which exceeds the per-request limit of $${limits.perCallLimit} for your plan.`,
      };
    }

    // Check monthly limit
    if (costTracking.monthly_cost_usd + estimatedCostUSD > limits.monthlyLimit) {
      return {
        allowed: false,
        costTracking,
        message: `This would exceed your monthly cost limit of $${limits.monthlyLimit}. Current usage: $${costTracking.monthly_cost_usd.toFixed(4)}`,
      };
    }

    // Check daily limit (rough approximation - would need daily tracking for precise check)
    const estimatedDailyCost = costTracking.monthly_cost_usd / new Date().getDate() + estimatedCostUSD;
    if (estimatedDailyCost > limits.dailyLimit) {
      return {
        allowed: false,
        costTracking,
        message: `This might exceed your daily cost limit of $${limits.dailyLimit}. Consider upgrading your plan.`,
      };
    }

    return {
      allowed: true,
      costTracking,
    };

  } catch (error) {
    console.error("❌ Error in checkCostLimit:", error);
    return {
      allowed: false,
      costTracking: null,
      message: "Error checking cost limits. Please try again.",
    };
  }
}

/**
 * Update user's cost tracking after a successful transcription
 */
export async function updateCostTracking(
  uid: string,
  actualCostUSD: number,
  transcriptionId?: string
): Promise<boolean> {
  try {
    const costTracking = await getUserCostTracking(uid);
    
    if (!costTracking) {
      console.error("❌ Cannot update cost tracking - no record found");
      return false;
    }

    // Update the cost tracking record
    const { error: updateError } = await supabaseAdmin
      .from("user_cost_tracking")
      .update({
        total_cost_usd: costTracking.total_cost_usd + actualCostUSD,
        monthly_cost_usd: costTracking.monthly_cost_usd + actualCostUSD,
        api_calls_count: costTracking.api_calls_count + 1,
        monthly_api_calls: costTracking.monthly_api_calls + 1,
        last_api_call: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid);

    if (updateError) {
      console.error("❌ Error updating cost tracking:", updateError);
      return false;
    }

    // Optionally log the cost entry for detailed tracking
    if (transcriptionId) {
      await logCostEntry(uid, actualCostUSD, "transcription", transcriptionId);
    }

    console.log(`✅ Updated cost tracking: +$${actualCostUSD.toFixed(4)} (monthly: $${(costTracking.monthly_cost_usd + actualCostUSD).toFixed(4)})`);
    return true;

  } catch (error) {
    console.error("❌ Error in updateCostTracking:", error);
    return false;
  }
}

/**
 * Log detailed cost entry for audit trail
 */
export async function logCostEntry(
  uid: string,
  costUSD: number,
  service: string,
  referenceId?: string,
  metadata?: any
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("cost_log")
      .insert({
        uid,
        cost_usd: costUSD,
        service,
        reference_id: referenceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("❌ Error logging cost entry:", error);
      return false;
    }

    return true;

  } catch (error) {
    console.error("❌ Error in logCostEntry:", error);
    return false;
  }
}

/**
 * Get user's plan from usage table
 */
export async function getUserPlan(uid: string): Promise<string> {
  try {
    const { data: usage, error } = await supabaseAdmin
      .from("user_usage")
      .select("plan")
      .eq("uid", uid)
      .maybeSingle();

    if (error || !usage) {
      console.warn("⚠️ Could not get user plan, defaulting to 'free'");
      return "free";
    }

    return usage.plan || "free";

  } catch (error) {
    console.error("❌ Error getting user plan:", error);
    return "free";
  }
}

/**
 * Generate cost summary for user dashboard
 */
export async function getCostSummary(uid: string): Promise<{
  currentMonth: number;
  totalAllTime: number;
  apiCalls: number;
  plan: string;
  limits: CostLimits;
  utilizationPercent: number;
}> {
  try {
    const [costTracking, userPlan] = await Promise.all([
      getUserCostTracking(uid),
      getUserPlan(uid)
    ]);

    const limits = COST_LIMITS[userPlan] || COST_LIMITS.free;
    const currentMonth = costTracking?.monthly_cost_usd || 0;
    const utilizationPercent = (currentMonth / limits.monthlyLimit) * 100;

    return {
      currentMonth,
      totalAllTime: costTracking?.total_cost_usd || 0,
      apiCalls: costTracking?.monthly_api_calls || 0,
      plan: userPlan,
      limits,
      utilizationPercent: Math.min(utilizationPercent, 100),
    };

  } catch (error) {
    console.error("❌ Error generating cost summary:", error);
    return {
      currentMonth: 0,
      totalAllTime: 0,
      apiCalls: 0,
      plan: "free",
      limits: COST_LIMITS.free,
      utilizationPercent: 0,
    };
  }
}
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/test/supabase
 * Test Supabase connection
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("uid")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection error:", error);
      return NextResponse.json({
        success: false,
        error: "Supabase connection failed",
        details: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      }, { status: 500 });
    }

    console.log("✅ Supabase connection test successful");

    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    };

    return NextResponse.json({
      success: true,
      message: "Supabase connection test passed",
      data: {
        recordCount: data?.length || 0,
        environment: envCheck
      }
    });

  } catch (error: any) {
    console.error("❌ Test endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      }
    }, { status: 500 });
  }
}
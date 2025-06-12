import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🔧 Logging out user...");

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.set({
      name: "session",
      value: "",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    console.log("✅ Session cookie cleared");
    return response;
  } catch (error: any) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

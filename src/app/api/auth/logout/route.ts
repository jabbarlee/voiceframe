import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // ✅ Delete the httpOnly session cookie
    (await cookieStore).delete("session");

    console.log("✅ Session cookie cleared");
    return response;
  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session cookie" }, { status: 401 });
    }

    // Verify the session cookie
    await adminAuth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json({ message: "Session valid" }, { status: 200 });
  } catch (error: any) {
    console.error("Session verification error:", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

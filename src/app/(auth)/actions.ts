"use server";

import { adminAuth, createSessionCookie } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSession(idToken: string) {
  try {
    console.log(
      "🔧 Creating session with token:",
      idToken.substring(0, 20) + "..."
    );

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("✅ Token verified for user:", decodedToken.uid);

    // Create session cookie that expires in 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await createSessionCookie(idToken, expiresIn);

    const cookieStore = cookies();

    // Set the session cookie
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    console.log("✅ Session cookie set successfully");

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      },
    };
  } catch (error: any) {
    console.error("❌ Session creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return { success: true };
  } catch (error: any) {
    console.error("Session destruction error:", error);
    return { success: false, error: error.message };
  }
}

export async function redirectToDashboard() {
  redirect("/dashboard");
}

export async function redirectToLogin() {
  redirect("/login");
}

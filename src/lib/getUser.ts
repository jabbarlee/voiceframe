import { cookies } from "next/headers";
import { verifySessionCookie } from "./firebase-admin";

export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
}

export const getUserFromRequest = async (): Promise<AuthUser | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      console.log("No session cookie found");
      return null;
    }

    console.log("🔧 Verifying session cookie...");
    // Verify the session cookie
    const decodedClaims = await verifySessionCookie(sessionCookie, true);

    console.log("✅ Session verified for user:", decodedClaims.uid);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      emailVerified: decodedClaims.email_verified || false,
    };
  } catch (error) {
    console.error("❌ Error getting user from request:", error);
    return null;
  }
};

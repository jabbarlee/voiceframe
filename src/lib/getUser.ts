import { cookies } from "next/headers";

export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
}

export const getUserFromRequest = async (): Promise<AuthUser | null> => {
  try {
    // Call the verify API endpoint
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/auth/verify`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("❌ Error getting user from request:", error);
    return null;
  }
};

import { auth } from "@/lib/firebase";

export const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user");
    }
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
};

import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

import { auth } from "@/lib/firebase";

export const getCurrentUserToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    // If user is already available, get token immediately
    if (auth.currentUser) {
      auth.currentUser
        .getIdToken()
        .then(resolve)
        .catch((error) => {
          console.error("Error getting user token:", error);
          resolve(null);
        });
      return;
    }

    // Otherwise, wait for auth state to be determined
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Clean up listener
      if (user) {
        user
          .getIdToken()
          .then(resolve)
          .catch((error) => {
            console.error("Error getting user token:", error);
            resolve(null);
          });
      } else {
        resolve(null);
      }
    });
  });
};

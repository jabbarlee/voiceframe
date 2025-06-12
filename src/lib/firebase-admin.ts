import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

// Define types for better type safety
export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}

export interface DecodedToken {
  uid: string;
  email?: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  firebase: {
    identities: {
      email?: string[];
    };
    sign_in_provider: string;
  };
}

// Initialize Firebase Admin SDK
let adminApp: App;
let adminAuth: Auth;

/**
 * Validates and formats the private key
 */
const validateAndFormatPrivateKey = (privateKey: string): string => {
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is required");
  }

  // Handle different private key formats
  let formattedKey = privateKey;

  // If the key is base64 encoded, decode it
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    try {
      formattedKey = Buffer.from(privateKey, "base64").toString("utf8");
    } catch (error) {
      // If base64 decoding fails, assume it's already in the correct format
      console.warn("Private key is not base64 encoded, using as-is");
    }
  }

  // Replace escaped newlines with actual newlines
  formattedKey = formattedKey.replace(/\\n/g, "\n");

  // Ensure proper formatting
  if (!formattedKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error(
      "Invalid private key format. Must be a valid PEM format private key."
    );
  }

  // Validate the key structure
  const keyRegex =
    /-----BEGIN PRIVATE KEY-----[\s\S]*-----END PRIVATE KEY-----/;
  if (!keyRegex.test(formattedKey)) {
    throw new Error("Private key does not match expected PEM format");
  }

  return formattedKey;
};

/**
 * Initialize Firebase Admin with enhanced error handling
 */
const initializeFirebaseAdmin = (): void => {
  try {
    // Check if Firebase Admin is already initialized
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      adminAuth = getAuth(adminApp);
      console.log("✅ Firebase Admin already initialized");
      return;
    }

    // Validate required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is required");
    }

    if (!clientEmail) {
      throw new Error("FIREBASE_CLIENT_EMAIL environment variable is required");
    }

    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      throw new Error("FIREBASE_CLIENT_EMAIL must be a valid email address");
    }

    // Validate and format private key
    const formattedPrivateKey = validateAndFormatPrivateKey(privateKey);

    console.log("🔧 Initializing Firebase Admin with:");
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Client Email: ${clientEmail}`);
    console.log(`   Private Key: ${formattedPrivateKey.substring(0, 50)}...`);

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      // Optional: Add other configuration options
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    // Initialize Auth service
    adminAuth = getAuth(adminApp);

    console.log("✅ Firebase Admin initialized successfully");

    // Test the connection by trying to get a user (this will fail but validates credentials)
    adminAuth
      .listUsers(1)
      .then(() => {
        console.log("✅ Firebase Admin credentials validated");
      })
      .catch((error) => {
        if (error.code === "auth/insufficient-permission") {
          console.log(
            "✅ Firebase Admin credentials are valid (insufficient permission is expected for test)"
          );
        } else {
          console.error(
            "❌ Firebase Admin credential validation failed:",
            error
          );
        }
      });
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error);

    // Provide helpful error messages
    if (error.message.includes("DECODER routines")) {
      console.error(
        "💡 This error usually indicates an issue with the private key format."
      );
      console.error(
        "💡 Make sure your FIREBASE_PRIVATE_KEY is properly formatted and not corrupted."
      );
      console.error(
        "💡 Try downloading a fresh service account key from the Firebase Console."
      );
    }

    throw error;
  }
};

// Initialize Firebase Admin
initializeFirebaseAdmin();

/**
 * Verify Firebase ID token and return decoded token
 * @param token - Firebase ID token
 * @returns Promise<DecodedToken>
 */
export const verifyToken = async (token: string): Promise<DecodedToken> => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    if (!adminAuth) {
      throw new Error("Firebase Admin not initialized");
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(token, true);

    console.log("✅ Token verified successfully for user:", decodedToken.uid);
    return decodedToken as DecodedToken;
  } catch (error: any) {
    console.error("❌ Token verification failed:", error);

    // Provide more specific error messages
    if (error.code === "auth/id-token-expired") {
      throw new Error("Token has expired. Please sign in again.");
    } else if (error.code === "auth/id-token-revoked") {
      throw new Error("Token has been revoked. Please sign in again.");
    } else if (error.code === "auth/invalid-id-token") {
      throw new Error("Invalid token format.");
    } else if (error.code === "auth/project-not-found") {
      throw new Error("Firebase project not found. Check your configuration.");
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Get user information by UID
 * @param uid - User ID
 * @returns Promise<AuthUser>
 */
export const getUserByUID = async (uid: string): Promise<AuthUser> => {
  try {
    const userRecord = await adminAuth.getUser(uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
    };
  } catch (error: any) {
    console.error("❌ Failed to get user by UID:", error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

/**
 * Create a session cookie
 * @param idToken - Firebase ID token
 * @param expiresIn - Expiration time in milliseconds
 * @returns Promise<string>
 */
export const createSessionCookie = async (
  idToken: string,
  expiresIn: number
): Promise<string> => {
  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin not initialized");
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    console.log("✅ Session cookie created successfully");
    return sessionCookie;
  } catch (error: any) {
    console.error("❌ Failed to create session cookie:", error);
    throw new Error(`Failed to create session cookie: ${error.message}`);
  }
};

/**
 * Verify session cookie
 * @param sessionCookie - Session cookie to verify
 * @param checkRevoked - Whether to check if the token has been revoked
 * @returns Promise<DecodedToken>
 */
export const verifySessionCookie = async (
  sessionCookie: string,
  checkRevoked: boolean = false
): Promise<DecodedToken> => {
  try {
    if (!sessionCookie) {
      throw new Error("No session cookie provided");
    }

    if (!adminAuth) {
      throw new Error("Firebase Admin not initialized");
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      checkRevoked
    );
    console.log(
      "✅ Session cookie verified successfully for user:",
      decodedClaims.uid
    );
    return decodedClaims as DecodedToken;
  } catch (error: any) {
    console.error("❌ Session cookie verification failed:", error);

    if (error.code === "auth/session-cookie-expired") {
      throw new Error("Session has expired. Please sign in again.");
    } else if (error.code === "auth/session-cookie-revoked") {
      throw new Error("Session has been revoked. Please sign in again.");
    } else if (error.code === "auth/invalid-session-cookie") {
      throw new Error("Invalid session cookie.");
    } else {
      throw new Error(`Session verification failed: ${error.message}`);
    }
  }
};

// Export the admin auth instance and app for direct use
export { adminAuth, adminApp };

// Export a simple function to check if admin is initialized
export const isAdminInitialized = (): boolean => {
  return getApps().length > 0;
};

// Export environment check function with enhanced validation
export const checkEnvironment = (): {
  isValid: boolean;
  missingVars: string[];
  nodeEnv: string;
  validation: {
    projectId: boolean;
    clientEmail: boolean;
    privateKey: boolean;
  };
} => {
  const requiredVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  // Validate individual components
  const validation = {
    projectId: !!process.env.FIREBASE_PROJECT_ID,
    clientEmail: !!(
      process.env.FIREBASE_CLIENT_EMAIL &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.FIREBASE_CLIENT_EMAIL)
    ),
    privateKey: !!(
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY.includes("-----BEGIN PRIVATE KEY-----")
    ),
  };

  return {
    isValid:
      missingVars.length === 0 && Object.values(validation).every(Boolean),
    missingVars,
    nodeEnv: process.env.NODE_ENV || "development",
    validation,
  };
};

/**
 * Debug function to help troubleshoot configuration issues
 */
export const debugFirebaseConfig = (): void => {
  console.log("🔍 Firebase Admin Configuration Debug:");

  const envCheck = checkEnvironment();
  console.log("Environment Check:", envCheck);

  if (process.env.FIREBASE_PRIVATE_KEY) {
    const key = process.env.FIREBASE_PRIVATE_KEY;
    console.log("Private Key Info:");
    console.log(`  Length: ${key.length}`);
    console.log(
      `  Starts with BEGIN: ${key.includes("-----BEGIN PRIVATE KEY-----")}`
    );
    console.log(
      `  Ends with END: ${key.includes("-----END PRIVATE KEY-----")}`
    );
    console.log(`  Contains \\n: ${key.includes("\\n")}`);
    console.log(`  First 100 chars: ${key.substring(0, 100)}`);
  }

  console.log(`Admin Apps: ${getApps().length}`);
  console.log(`Admin Auth initialized: ${!!adminAuth}`);
};

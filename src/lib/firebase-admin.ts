import * as admin from 'firebase-admin';
import path from 'path';

// Load the service account key JSON file from disk
const serviceAccount = require(path.resolve('./serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();

export const verifySessionCookie = async (sessionCookie: string) => {
  try {
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    throw new Error('Invalid session cookie');
  }
}
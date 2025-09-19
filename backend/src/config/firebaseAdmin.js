import admin from 'firebase-admin';

let initialized = false;

export const getFirebaseAdmin = () => {
  if (initialized) return admin;
  try {
    const credJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!credJson) return null;
    const credential = admin.credential.cert(JSON.parse(credJson));
    admin.initializeApp({ credential });
    initialized = true;
    return admin;
  } catch {
    return null;
  }
};

export default getFirebaseAdmin;


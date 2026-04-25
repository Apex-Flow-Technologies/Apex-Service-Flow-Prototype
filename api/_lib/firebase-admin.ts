import admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountRaw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    }

    let serviceAccount;
    try {
      // Handle potential double-escaping or formatting issues
      serviceAccount = JSON.parse(serviceAccountRaw);
    } catch (e) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON. Check your Vercel settings.');
      throw new Error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT');
    }

    if (serviceAccount) {
      // Fix for private key newlines if they were escaped during copy-paste
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;

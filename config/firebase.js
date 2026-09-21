const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const apps = admin.apps || (admin.getApps ? admin.getApps() : []);
let hasRealCerts = false;

if (!apps || !apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      hasRealCerts = true;
      console.log('🔥 Firebase Admin SDK initialized with Service Account credentials');
    } catch (err) {
      console.warn('⚠️ Firebase Admin Cert Initialization note:', err.message);
      admin.initializeApp({ projectId: projectId || 'kisan-connect-demo' });
    }
  } else {
    console.log('ℹ️ Firebase Admin SDK running in project mode');
    admin.initializeApp({
      projectId: projectId || 'kisan-connect-demo'
    });
  }
}

let db = null;
if (hasRealCerts) {
  try {
    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    console.warn('Firestore initialization note:', e.message);
  }
}

let auth = null;
try {
  auth = admin.auth();
} catch (e) {}

module.exports = { admin, auth, db, hasRealCerts };


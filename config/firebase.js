const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

let app;
let hasRealCerts = false;

const apps = admin.apps || [];
if (!apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        }),
        projectId
      });
      hasRealCerts = true;
      console.log('🔥 Firebase Admin SDK initialized with Service Account credentials');
    } catch (err) {
      console.warn('⚠️ Firebase Admin Cert Initialization note:', err.message);
      app = admin.initializeApp({ projectId: projectId || 'kisan-connect-demo' });
    }
  } else {
    console.log('ℹ️ Firebase Admin SDK running in project mode');
    app = admin.initializeApp({
      projectId: projectId || 'kisan-connect-demo'
    });
  }
} else {
  app = apps[0];
}

let authInstance = null;
const getFirebaseAuth = async () => {
  if (authInstance) return authInstance;
  try {
    const { getAuth } = await import('firebase-admin/auth');
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('Firebase Auth initialization note:', err.message);
    return null;
  }
};

const auth = {
  verifyIdToken: async (idToken) => {
    const realAuth = await getFirebaseAuth();
    if (!realAuth || typeof realAuth.verifyIdToken !== 'function') {
      throw new Error('Firebase Auth not available');
    }
    return realAuth.verifyIdToken(idToken);
  }
};

let dbInstance = null;
const getFirebaseDb = async () => {
  if (dbInstance) return dbInstance;
  if (!hasRealCerts) return null;
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    dbInstance = getFirestore(app);
    dbInstance.settings({ ignoreUndefinedProperties: true });
    return dbInstance;
  } catch (err) {
    console.warn('Firestore initialization note:', err.message);
    return null;
  }
};

const db = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      get: async () => {
        const realDb = await getFirebaseDb();
        if (!realDb) return { exists: false, data: () => null };
        return realDb.collection(collectionName).doc(docId).get();
      },
      set: async (data, opts) => {
        const realDb = await getFirebaseDb();
        if (!realDb) return null;
        return realDb.collection(collectionName).doc(docId).set(data, opts);
      }
    })
  })
};

module.exports = { admin, app, auth, db, hasRealCerts };

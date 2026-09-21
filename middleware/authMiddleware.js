const { auth, db } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No Firebase ID token provided.' });
  }

  const idToken = authHeader.split(' ')[1];
  try {
    let decodedToken;
    try {
      if (auth && auth.verifyIdToken) {
        decodedToken = await auth.verifyIdToken(idToken);
      } else {
        throw new Error('Firebase Auth not initialized with certs');
      }
    } catch (verifyErr) {
      // Prototype test token fallback
      if (idToken.startsWith('mock_firebase_token_') || idToken.startsWith('demo_token_')) {
        const uid = idToken.replace('mock_firebase_token_', '').replace('demo_token_', '');
        if (!uid) {
          return res.status(401).json({ success: false, message: 'Invalid or missing user ID in token.' });
        }
        const { getDb } = require('../config/db');
        const localDb = getDb();
        const foundUser = localDb.users.find((u) => u.id === uid);
        const rawDigits = uid.replace(/\D/g, '');
        const phone = foundUser && foundUser.phone
          ? `+91${foundUser.phone.replace(/\D/g, '')}`
          : (uid.includes('admin') ? '+919000000000' : (rawDigits.length >= 10 ? `+91${rawDigits.slice(-10)}` : ''));
        decodedToken = { uid, phone_number: phone };
      } else {
        return res.status(401).json({ success: false, message: 'Invalid or expired Firebase ID token.' });
      }
    }

    const uid = decodedToken.uid;
    req.user = {
      ...decodedToken,
      id: uid,
      uid
    };

    // Retrieve verified User Role from Cloud Firestore users/{uid}
    try {
      const { hasRealCerts } = require('../config/firebase');
      if (hasRealCerts && db) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          req.user.role = userData.role || 'farmer';
          req.user.name = userData.name || decodedToken.name || 'Farmer';
          req.user.farmerId = userData.farmerId || 'KC-F-8821';
          req.user.phone = userData.phone || decodedToken.phone_number || '';
          req.user.district = userData.district || 'Nashik';
        } else {
          req.user.role = 'farmer';
        }
      } else {
        // Fallback for local store users
        const { getDb } = require('../config/db');
        const localDb = getDb();
        const targetDigits = decodedToken.phone_number ? decodedToken.phone_number.slice(-10) : '';
        const localUser = localDb.users.find((u) => u.id === uid) ||
                          (targetDigits ? localDb.users.find((u) => u.phone && u.phone.slice(-10) === targetDigits) : null);
        if (localUser) {
          req.user.id = localUser.id;
          req.user.uid = localUser.id;
          req.user.role = localUser.role;
          req.user.name = localUser.name;
          req.user.farmerId = localUser.farmerId;
          req.user.district = localUser.district;
          req.user.phone = localUser.phone || req.user.phone || '';
        } else {
          req.user.role = req.user.role || 'farmer';
        }
      }
    } catch (dbErr) {
      req.user.role = req.user.role || 'farmer';
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication verification failed.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin authorization required.' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };

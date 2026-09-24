const { getDb, saveDb } = require('../config/db');
const { db: firestore, hasRealCerts } = require('../config/firebase');

exports.syncProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, phone, district, language, role: requestedRole } = req.body;

    const db = getDb();
    let existingUser = db.users.find((u) => u.id === uid) || (phone ? db.users.find((u) => u.phone === phone && u.id === uid) : null);

    // Try Cloud Firestore lookup if credentials configured
    if (hasRealCerts && firestore) {
      try {
        const docRef = firestore.collection('users').doc(uid);
        const doc = await docRef.get();

        if (doc.exists) {
          const data = doc.data();
          return res.json({
            success: true,
            message: 'Profile retrieved from Firestore.',
            user: data
          });
        }
      } catch (fsErr) {
        console.warn('Firestore sync note:', fsErr.message);
      }
    }

    if (existingUser) {
      let updated = false;
      if (name && name !== existingUser.name) {
        existingUser.name = name;
        updated = true;
      }
      if (phone && phone !== existingUser.phone) {
        existingUser.phone = phone;
        updated = true;
      }
      if (district && district !== existingUser.district) {
        existingUser.district = district;
        updated = true;
      }
      if (language && language !== existingUser.language) {
        existingUser.language = language;
        updated = true;
      }
      if (updated) {
        saveDb(db);
      }

      return res.json({
        success: true,
        message: 'Profile retrieved.',
        user: {
          id: existingUser.id,
          uid: existingUser.id,
          name: existingUser.name,
          phone: existingUser.phone,
          email: existingUser.email || '',
          role: existingUser.role,
          farmerId: existingUser.farmerId,
          district: existingUser.district,
          language: existingUser.language
        }
      });
    }

    // Security check: Normal farmer cannot make themselves admin
    const role = requestedRole === 'admin' && (uid.includes('admin') || req.user.role === 'admin') ? 'admin' : 'farmer';
    const farmerSeq = db.users.filter((u) => u.role === 'farmer').length + 8824;
    const farmerId = role === 'admin' ? 'ADMIN-01' : `KC-F-${farmerSeq}`;

    const newUser = {
      id: uid,
      uid,
      name: name || (role === 'admin' ? 'Aditya Sharma (Procurement Officer)' : (phone ? `Farmer (${phone.slice(-4)})` : 'Registered Farmer')),
      phone: phone || req.user.phone_number || '',
      email: `${uid}@kisanconnect.org`,
      role,
      farmerId,
      district: district || 'Nashik',
      language: language || 'en',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    // Persist to Cloud Firestore users/{uid} collection if credentials present
    if (hasRealCerts && firestore) {
      try {
        await firestore.collection('users').doc(uid).set(newUser, { merge: true });
      } catch (fsWriteErr) {
        console.warn('Firestore set note:', fsWriteErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'New user profile created.',
      user: newUser
    });
  } catch (err) {
    console.error('Sync Profile Error:', err);
    return res.status(500).json({ success: false, message: 'Server error syncing Firebase profile.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = getDb();

    // Check Cloud Firestore users collection if credentials present
    if (hasRealCerts && firestore) {
      try {
        const doc = await firestore.collection('users').doc(uid).get();
        if (doc.exists) {
          return res.json({ success: true, user: doc.data() });
        }
      } catch (e) {}
    }

    const user = db.users.find((u) => u.id === uid) || db.users.find((u) => u.farmerId === req.user.farmerId);
    if (user) {
      return res.json({
        success: true,
        user: {
          id: user.id,
          uid: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          farmerId: user.farmerId,
          district: user.district,
          language: user.language
        }
      });
    }

    return res.status(404).json({ success: false, message: 'User profile not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};

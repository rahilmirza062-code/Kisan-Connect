const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

const todayStr = new Date().toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const initialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const farmerPasswordHash = bcrypt.hashSync('farmer123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  return {
    users: [
      {
        id: 'usr_f1',
        name: 'Ramesh Patil',
        phone: '9876543210',
        email: 'ramesh@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8821',
        district: 'Nashik',
        language: 'en',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f2',
        name: 'Suresh Deshmukh',
        phone: '9876543211',
        email: 'suresh@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8822',
        district: 'Pune',
        language: 'mr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f3',
        name: 'Mahesh Shinde',
        phone: '9876543212',
        email: 'mahesh@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8823',
        district: 'Nagpur',
        language: 'hi',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f4',
        name: 'Priya Gupta',
        phone: '9876543213',
        email: 'priya@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8824',
        district: 'Nashik',
        language: 'en',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f5',
        name: 'Kavita Pawar',
        phone: '9876543214',
        email: 'kavita@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8825',
        district: 'Pune',
        language: 'mr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f6',
        name: 'Amit Joshi',
        phone: '9876543215',
        email: 'amit@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8826',
        district: 'Nagpur',
        language: 'hi',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f7',
        name: 'Sunita Deshmukh',
        phone: '9876543216',
        email: 'sunita@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8827',
        district: 'Nashik',
        language: 'mr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f8',
        name: 'Rahul Verma',
        phone: '9876543217',
        email: 'rahul@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8828',
        district: 'Pune',
        language: 'hi',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f9',
        name: 'Ganesh Patil',
        phone: '9876543218',
        email: 'ganesh@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8829',
        district: 'Nagpur',
        language: 'mr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_f10',
        name: 'Anita Kulkarni',
        phone: '9876543219',
        email: 'anita@kisanconnect.org',
        passwordHash: farmerPasswordHash,
        role: 'farmer',
        farmerId: 'KC-F-8830',
        district: 'Nashik',
        language: 'en',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_admin',
        name: 'Aditya Sharma (Procurement Officer)',
        phone: '9000000000',
        email: 'admin@kisanconnect.org',
        passwordHash: adminPasswordHash,
        role: 'admin',
        farmerId: 'ADMIN-01',
        district: 'Nashik',
        language: 'en',
        createdAt: new Date().toISOString()
      }
    ],
    procurementCentres: [
      {
        id: 'pc_1',
        name: 'Nashik APMC Main Market',
        location: 'Panchavati, Nashik',
        address: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        district: 'Nashik',
        contactPhone: '+91 94220 12345',
        cropType: 'Wheat',
        mspPrice: 2425,
        status: 'Active'
      },
      {
        id: 'pc_2',
        name: 'Pune Krishi Utpadan Mandi',
        location: 'Market Yard, Pune',
        address: 'Krishi Utpadan Mandi Samiti, Market Yard Road, Gultekdi, Pune, Maharashtra 411037',
        district: 'Pune',
        contactPhone: '+91 94220 54321',
        cropType: 'Soybean',
        mspPrice: 4950,
        status: 'Active'
      },
      {
        id: 'pc_3',
        name: 'Nagpur Cotton & Pulses Hub',
        location: 'Kalamna Market, Nagpur',
        address: 'Kalamna Market, Cotton & Pulses Section, Nagpur, Maharashtra 440035',
        district: 'Nagpur',
        contactPhone: '+91 94220 98765',
        cropType: 'Cotton',
        mspPrice: 7121,
        status: 'Active'
      }
    ],
    schedules: [
      {
        id: 'sch_1',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        date: todayStr,
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        cropType: 'Wheat',
        mspPrice: 2425,
        capacity: 20,
        bookedCount: 15,
        status: 'Available'
      },
      {
        id: 'sch_2',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        date: todayStr,
        startTime: '11:00 AM',
        endTime: '01:00 PM',
        cropType: 'Wheat',
        mspPrice: 2425,
        capacity: 20,
        bookedCount: 19,
        status: 'Available'
      },
      {
        id: 'sch_3',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        date: todayStr,
        startTime: '01:00 PM',
        endTime: '03:00 PM',
        cropType: 'Wheat',
        mspPrice: 2425,
        capacity: 15,
        bookedCount: 15,
        status: 'Full'
      },
      {
        id: 'sch_4',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        date: tomorrowStr,
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        cropType: 'Wheat',
        mspPrice: 2425,
        capacity: 25,
        bookedCount: 8,
        status: 'Available'
      },
      {
        id: 'sch_5',
        centreId: 'pc_2',
        centreName: 'Pune Krishi Utpadan Mandi',
        centreLocation: 'Market Yard, Pune',
        centreAddress: 'Krishi Utpadan Mandi Samiti, Market Yard Road, Gultekdi, Pune, Maharashtra 411037',
        date: todayStr,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        cropType: 'Soybean',
        mspPrice: 4950,
        capacity: 30,
        bookedCount: 12,
        status: 'Available'
      }
    ],
    bookings: [
      {
        id: 'bk_97',
        farmerId: 'usr_other1',
        farmerName: 'Ganesh Pawar',
        farmerPhone: '9123456701',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        scheduleId: 'sch_1',
        date: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        cropType: 'Soybean',
        quantity: '40 Quintals',
        approxQuantity: 40,
        actualQuantity: 38.5,
        mspPerQuintal: 4950,
        totalAmount: 190575,
        tokenNumber: 'KC-097',
        queueNumber: 97,
        status: 'Procurement In Progress',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'bk_98',
        farmerId: 'usr_other2',
        farmerName: 'Eknath Shinde',
        farmerPhone: '9123456702',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        scheduleId: 'sch_1',
        date: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        cropType: 'Wheat',
        quantity: '25 Quintals',
        approxQuantity: 25,
        tokenNumber: 'KC-098',
        queueNumber: 98,
        status: 'Your Turn Soon',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 6500000).toISOString()
      },
      {
        id: 'bk_99',
        farmerId: 'usr_other3',
        farmerName: 'Sanjay Raut',
        farmerPhone: '9123456703',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        scheduleId: 'sch_1',
        date: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        cropType: 'Gram (Chana)',
        quantity: '30 Quintals',
        approxQuantity: 30,
        tokenNumber: 'KC-099',
        queueNumber: 99,
        status: 'Waiting',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 5000000).toISOString()
      },
      {
        id: 'bk_104',
        farmerId: 'usr_f1',
        farmerName: 'Ramesh Patil',
        farmerPhone: '9876543210',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        scheduleId: 'sch_1',
        date: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        cropType: 'Wheat',
        quantity: '30 Quintals',
        approxQuantity: 30,
        actualQuantity: 28.5,
        mspPerQuintal: 2425,
        totalAmount: 69112.5,
        tokenNumber: 'KC-104',
        queueNumber: 104,
        status: 'Paid',
        paymentStatus: 'paid',
        paymentId: 'PAY-104',
        amount: 69112.5,
        createdAt: new Date(Date.now() - 600000).toISOString()
      }
    ],
    payments: [
      {
        id: 'PAY-104',
        bookingId: 'bk_104',
        farmerId: 'usr_f1',
        farmerName: 'Ramesh Patil',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        cropType: 'Wheat',
        approxQuantity: '30 Quintals',
        actualQuantity: 28.5,
        mspPerQuintal: 2425,
        totalAmount: 69112.5,
        amount: 69112.5,
        currency: 'INR',
        status: 'paid',
        paymentStatus: 'PAID',
        paymentDate: todayStr,
        transactionReference: 'KC-PAY-20260906-001',
        paymentMethod: 'Government Direct Benefit Transfer (Demo)',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        verifiedAt: new Date(Date.now() - 590000).toISOString()
      }
    ],
    notifications: [
      {
        id: 'ntf_1',
        userId: 'usr_f1',
        title: 'Booking Confirmed',
        message: 'Your slot at Nashik APMC for 09:00 AM - 11:00 AM has been confirmed.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'ntf_2',
        userId: 'usr_f1',
        title: 'Digital Token Issued',
        message: 'Token KC-104 generated successfully. Estimated wait time: 35 minutes.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 590000).toISOString()
      }
    ],
    settings: {
      averageProcessingTimeMinutes: 5,
      currentTokenProcessed: 'KC-097',
      lastTokenSeq: 104,
      bookingFeeAmount: 50
    }
  };
};

// Ensure data folder exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Reset or populate if not existing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2));
}

const getDb = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.payments) data.payments = [];
    if (!data.settings) data.settings = {};
    if (!data.settings.bookingFeeAmount) data.settings.bookingFeeAmount = 50;
    return data;
  } catch (err) {
    const data = initialData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return data;
  }
};

const saveDb = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Asynchronous background sync to Cloud Firestore collections
  try {
    const { db: firestore } = require('./firebase');
    if (firestore) {
      // Sync users (without password hashes)
      data.users.forEach((u) => {
        const { passwordHash, ...userClean } = u;
        firestore.collection('users').doc(u.id).set(userClean, { merge: true }).catch(() => {});
      });

      // Sync procurementCentres
      data.procurementCentres.forEach((pc) => {
        firestore.collection('procurementCentres').doc(pc.id).set(pc, { merge: true }).catch(() => {});
      });

      // Sync schedules
      data.schedules.forEach((sch) => {
        firestore.collection('schedules').doc(sch.id).set(sch, { merge: true }).catch(() => {});
      });

      // Sync bookings
      data.bookings.forEach((b) => {
        firestore.collection('bookings').doc(b.id).set(b, { merge: true }).catch(() => {});
      });

      // Sync payments
      data.payments.forEach((p) => {
        firestore.collection('payments').doc(p.id).set(p, { merge: true }).catch(() => {});
      });

      // Sync notifications
      data.notifications.forEach((ntf) => {
        firestore.collection('notifications').doc(ntf.id).set(ntf, { merge: true }).catch(() => {});
      });

      // Sync settings
      firestore.collection('settings').doc('config').set(data.settings, { merge: true }).catch(() => {});
    }
  } catch (e) {
    // Silent catch if Firestore credentials not initialized yet
  }
};

// Seed Cloud Firestore collections from store.json
const seedFirestoreFromStore = async () => {
  try {
    const { db: firestore } = require('./firebase');
    if (!firestore || !process.env.FIREBASE_PROJECT_ID) return;
    const data = getDb();

    data.users.forEach((u) => {
      const { passwordHash, ...userClean } = u;
      firestore.collection('users').doc(u.id).set(userClean, { merge: true }).catch(() => {});
    });

    data.procurementCentres.forEach((pc) => {
      firestore.collection('procurementCentres').doc(pc.id).set(pc, { merge: true }).catch(() => {});
    });

    data.schedules.forEach((sch) => {
      firestore.collection('schedules').doc(sch.id).set(sch, { merge: true }).catch(() => {});
    });

    data.bookings.forEach((b) => {
      firestore.collection('bookings').doc(b.id).set(b, { merge: true }).catch(() => {});
    });

    data.payments.forEach((p) => {
      firestore.collection('payments').doc(p.id).set(p, { merge: true }).catch(() => {});
    });

    firestore.collection('settings').doc('config').set(data.settings, { merge: true }).catch(() => {});
    console.log('✅ Cloud Firestore collections sync initialized');
  } catch (err) {
    // Graceful catch when running without GCP credentials
  }
};

// Initial Firestore Seeding call
seedFirestoreFromStore();

module.exports = { getDb, saveDb, seedFirestoreFromStore };

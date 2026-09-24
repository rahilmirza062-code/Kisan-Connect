const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const isServerless = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT);
const DEFAULT_DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');
const DATA_FILE = isServerless ? path.join('/tmp', 'store.json') : DEFAULT_DATA_FILE;

const todayStr = new Date().toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const initialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const farmerPasswordHash = bcrypt.hashSync('farmer123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  // Use authoritative MSP values from mspConfig
  const { getCropMspPrice } = require('./mspConfig');
  const wheatMsp = getCropMspPrice('Wheat');         // 2585
  const soybeanMsp = getCropMspPrice('Soybean');     // 5708
  const cottonMsp = getCropMspPrice('Cotton');        // 8267
  const gramMsp = getCropMspPrice('Gram (Chana)');   // 5875
  const riceMsp = getCropMspPrice('Rice (Paddy - Grade A)'); // 2461

  const dateCompact = todayStr.replace(/-/g, '');

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
        mspPrice: wheatMsp,
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
        mspPrice: soybeanMsp,
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
        mspPrice: cottonMsp,
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
        mspPrice: wheatMsp,
        capacity: 25,
        bookedCount: 5,
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
        mspPrice: wheatMsp,
        capacity: 20,
        bookedCount: 3,
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
        mspPrice: wheatMsp,
        capacity: 15,
        bookedCount: 2,
        status: 'Available'
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
        mspPrice: wheatMsp,
        capacity: 25,
        bookedCount: 0,
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
        mspPrice: soybeanMsp,
        capacity: 30,
        bookedCount: 2,
        status: 'Available'
      },
      {
        id: 'sch_6',
        centreId: 'pc_3',
        centreName: 'Nagpur Cotton & Pulses Hub',
        centreLocation: 'Kalamna Market, Nagpur',
        centreAddress: 'Kalamna Market, Cotton & Pulses Section, Nagpur, Maharashtra 440035',
        date: todayStr,
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        cropType: 'Cotton',
        mspPrice: cottonMsp,
        capacity: 20,
        bookedCount: 1,
        status: 'Available'
      },
      {
        id: 'sch_7',
        centreId: 'pc_2',
        centreName: 'Pune Krishi Utpadan Mandi',
        centreLocation: 'Market Yard, Pune',
        centreAddress: 'Krishi Utpadan Mandi Samiti, Market Yard Road, Gultekdi, Pune, Maharashtra 411037',
        date: tomorrowStr,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        cropType: 'Soybean',
        mspPrice: soybeanMsp,
        capacity: 30,
        bookedCount: 0,
        status: 'Available'
      }
    ],
    bookings: [
      // Booking that already went through full pipeline (Paid) — for Farmer 3 (Mahesh Shinde)
      {
        id: 'bk_97',
        farmerId: 'usr_f3',
        farmerName: 'Mahesh Shinde',
        farmerPhone: '9876543212',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        scheduleId: 'sch_1',
        date: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        cropType: 'Wheat',
        quantity: '35 Quintals',
        approxQuantity: 35,
        actualQuantity: 33.5,
        mspPerQuintal: wheatMsp,
        totalAmount: Math.round(33.5 * wheatMsp * 100) / 100,
        tokenNumber: 'KC-097',
        queueNumber: 97,
        status: 'Paid',
        paymentStatus: 'paid',
        paymentId: 'PAY-097',
        amount: Math.round(33.5 * wheatMsp * 100) / 100,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      // Booking in Procurement In Progress — for other farmer (queue demo)
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
        mspPerQuintal: wheatMsp,
        tokenNumber: 'KC-098',
        queueNumber: 98,
        status: 'Procurement In Progress',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 6500000).toISOString()
      },
      // Waiting — for another farmer (queue demo)
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
        mspPerQuintal: gramMsp,
        tokenNumber: 'KC-099',
        queueNumber: 99,
        status: 'Waiting',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 5000000).toISOString()
      },
      // Paid booking for Suresh Deshmukh (usr_f2) so he has payment history
      {
        id: 'bk_100',
        farmerId: 'usr_f2',
        farmerName: 'Suresh Deshmukh',
        farmerPhone: '9876543211',
        centreId: 'pc_2',
        centreName: 'Pune Krishi Utpadan Mandi',
        centreLocation: 'Market Yard, Pune',
        centreAddress: 'Krishi Utpadan Mandi Samiti, Market Yard Road, Gultekdi, Pune, Maharashtra 411037',
        scheduleId: 'sch_5',
        date: todayStr,
        timeSlot: '10:00 AM - 12:00 PM',
        cropType: 'Soybean (Yellow)',
        quantity: '22 Quintals',
        approxQuantity: 22,
        actualQuantity: 21.5,
        mspPerQuintal: soybeanMsp,
        totalAmount: Math.round(21.5 * soybeanMsp * 100) / 100,
        tokenNumber: 'KC-100',
        queueNumber: 100,
        status: 'Paid',
        paymentStatus: 'paid',
        paymentId: 'PAY-100',
        amount: Math.round(21.5 * soybeanMsp * 100) / 100,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      // Active booking for Amit Joshi (usr_f6) — waiting in queue at Nagpur
      {
        id: 'bk_101',
        farmerId: 'usr_f6',
        farmerName: 'Amit Joshi',
        farmerPhone: '9876543215',
        centreId: 'pc_3',
        centreName: 'Nagpur Cotton & Pulses Hub',
        centreLocation: 'Kalamna Market, Nagpur',
        centreAddress: 'Kalamna Market, Cotton & Pulses Section, Nagpur, Maharashtra 440035',
        scheduleId: 'sch_6',
        date: todayStr,
        timeSlot: '09:00 AM - 12:00 PM',
        cropType: 'Cotton (Medium Staple)',
        quantity: '18 Quintals',
        approxQuantity: 18,
        mspPerQuintal: cottonMsp,
        tokenNumber: 'KC-101',
        queueNumber: 101,
        status: 'Booking Confirmed',
        paymentStatus: 'pending_procurement',
        amount: 0,
        createdAt: new Date(Date.now() - 2400000).toISOString()
      }
    ],
    payments: [
      {
        id: 'PAY-097',
        bookingId: 'bk_97',
        farmerId: 'usr_f3',
        farmerName: 'Mahesh Shinde',
        centreId: 'pc_1',
        centreName: 'Nashik APMC Main Market',
        centreLocation: 'Panchavati, Nashik',
        centreAddress: 'APMC Market Yard, Panchavati Road, Nashik, Maharashtra 422003',
        cropType: 'Wheat',
        approxQuantity: 35,
        actualQuantity: 33.5,
        mspPerQuintal: wheatMsp,
        totalAmount: Math.round(33.5 * wheatMsp * 100) / 100,
        amount: Math.round(33.5 * wheatMsp * 100) / 100,
        currency: 'INR',
        status: 'paid',
        paymentStatus: 'PAID',
        paymentDate: todayStr,
        transactionReference: `KC-PAY-${dateCompact}-001`,
        paymentMethod: 'Government Direct Benefit Transfer (Demo)',
        createdAt: new Date(Date.now() - 7000000).toISOString(),
        verifiedAt: new Date(Date.now() - 6900000).toISOString(),
        scheduleDate: todayStr,
        timeSlot: '09:00 AM - 11:00 AM',
        tokenNumber: 'KC-097'
      },
      {
        id: 'PAY-100',
        bookingId: 'bk_100',
        farmerId: 'usr_f2',
        farmerName: 'Suresh Deshmukh',
        centreId: 'pc_2',
        centreName: 'Pune Krishi Utpadan Mandi',
        centreLocation: 'Market Yard, Pune',
        centreAddress: 'Krishi Utpadan Mandi Samiti, Market Yard Road, Gultekdi, Pune, Maharashtra 411037',
        cropType: 'Soybean (Yellow)',
        approxQuantity: 22,
        actualQuantity: 21.5,
        mspPerQuintal: soybeanMsp,
        totalAmount: Math.round(21.5 * soybeanMsp * 100) / 100,
        amount: Math.round(21.5 * soybeanMsp * 100) / 100,
        currency: 'INR',
        status: 'paid',
        paymentStatus: 'PAID',
        paymentDate: todayStr,
        transactionReference: `KC-PAY-${dateCompact}-002`,
        paymentMethod: 'Government Direct Benefit Transfer (Demo)',
        createdAt: new Date(Date.now() - 3500000).toISOString(),
        verifiedAt: new Date(Date.now() - 3400000).toISOString(),
        scheduleDate: todayStr,
        timeSlot: '10:00 AM - 12:00 PM',
        tokenNumber: 'KC-100'
      }
    ],
    notifications: [
      {
        id: 'ntf_1',
        userId: 'usr_f3',
        title: 'Government Payment Processed!',
        message: `Government payment of ₹${(Math.round(33.5 * wheatMsp * 100) / 100).toLocaleString('en-IN')} recorded for 33.5 Quintals of Wheat (MSP: ₹${wheatMsp}/Qtl). Ref: KC-PAY-${dateCompact}-001`,
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 6900000).toISOString()
      },
      {
        id: 'ntf_2',
        userId: 'usr_f2',
        title: 'Government Payment Processed!',
        message: `Government payment of ₹${(Math.round(21.5 * soybeanMsp * 100) / 100).toLocaleString('en-IN')} recorded for 21.5 Quintals of Soybean (MSP: ₹${soybeanMsp}/Qtl). Ref: KC-PAY-${dateCompact}-002`,
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 3400000).toISOString()
      }
    ],
    settings: {
      averageProcessingTimeMinutes: 5,
      currentTokenProcessed: 'KC-098',
      lastTokenSeq: 101,
      bookingFeeAmount: 0
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
  if (isServerless && fs.existsSync(DEFAULT_DATA_FILE)) {
    try {
      fs.copyFileSync(DEFAULT_DATA_FILE, DATA_FILE);
    } catch (e) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2));
    }
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2));
  }
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

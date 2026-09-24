const request = require('supertest');
const app = require('../server');
const { getDb, saveDb } = require('../config/db');

describe('Kisan Connect Backend API Automated Test Suite', () => {
  const farmerToken = 'mock_firebase_token_usr_f1';
  const farmer2Token = 'mock_firebase_token_usr_f2';
  const adminToken = 'mock_firebase_token_usr_admin';

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    const db = getDb();
    db.bookings = db.bookings.filter((b) => b.farmerId !== 'usr_f6');
    saveDb(db);
  });

  // ==================================================
  // 1. AUTHENTICATION & SECURITY TESTS
  // ==================================================
  describe('1. Authentication & Security', () => {
    test('GET /api/auth/me - Valid farmer authentication returns user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id', 'usr_f1');
      expect(res.body.user).toHaveProperty('role', 'farmer');
    });

    test('GET /api/auth/me - Valid admin authentication returns admin profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('role', 'admin');
    });

    test('GET /api/auth/me - Missing Authorization token returns 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - Invalid Authorization token returns 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token_999');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/queue/admin/dashboard - Farmer access to Admin route returns 403 Access Denied', async () => {
      const res = await request(app)
        .get('/api/queue/admin/dashboard')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  // ==================================================
  // 2. PROCUREMENT CENTRES TESTS
  // ==================================================
  describe('2. Procurement Centres', () => {
    test('GET /api/schedules/centres - Public access returns centres list', async () => {
      const res = await request(app).get('/api/schedules/centres');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.centres)).toBe(true);
      expect(res.body.centres.length).toBeGreaterThan(0);
    });

    test('POST /api/schedules/centres - Unauthorized farmer creation returns 403', async () => {
      const res = await request(app)
        .post('/api/schedules/centres')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Unauthorized Centre',
          location: 'Location X',
          district: 'Nashik'
        });

      expect(res.status).toBe(403);
    });

    test('POST /api/schedules/centres - Admin can create a new procurement centre', async () => {
      const res = await request(app)
        .post('/api/schedules/centres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test APMC Centre',
          location: 'Test Area',
          district: 'Nashik',
          contactPhone: '+91 99999 88888',
          cropType: 'Soybean',
          mspPrice: 4950
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.centre).toHaveProperty('name', 'Test APMC Centre');
    });

    test('PUT /api/schedules/centres/:id - Admin can update centre details', async () => {
      const db = getDb();
      const firstCentre = db.procurementCentres[0];

      const res = await request(app)
        .put(`/api/schedules/centres/${firstCentre.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contactPhone: '+91 94220 99999'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('POST /api/schedules/centres - Missing required name/location returns 400', async () => {
      const res = await request(app)
        .post('/api/schedules/centres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Centre' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================================================
  // 3. SCHEDULES TESTS
  // ==================================================
  describe('3. Schedules Management', () => {
    test('GET /api/schedules - Public access returns list of operating schedules', async () => {
      const res = await request(app).get('/api/schedules');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.schedules)).toBe(true);
    });

    test('POST /api/schedules - Admin can publish new operating schedule slot', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          centreId: 'pc_1',
          date: todayStr,
          startTime: '04:00 PM',
          endTime: '06:00 PM',
          capacity: 30,
          cropType: 'Wheat',
          mspPrice: 2425
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.schedule).toHaveProperty('capacity', 30);
    });

    test('POST /api/schedules - Missing required details returns 400', async () => {
      const res = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: '2026-09-08' });

      expect(res.status).toBe(400);
    });

    test('POST /api/schedules - Farmer creation returns 403', async () => {
      const res = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          centreId: 'pc_1',
          date: '2026-09-08',
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          capacity: 10
        });

      expect(res.status).toBe(403);
    });
  });

  // ==================================================
  // 4. SLOT BOOKING & DUPLICATE PROTECTION TESTS
  // ==================================================
  describe('4. Slot Booking & Duplicate Protection', () => {
    test('POST /api/bookings - Valid slot booking reserves slot for ₹0 fee', async () => {
      const db = getDb();
      const availSch = db.schedules.find((s) => s.bookedCount < s.capacity && s.status !== 'Disabled');

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer mock_firebase_token_usr_f6')
        .send({
          scheduleId: availSch.id,
          cropType: 'Soybean',
          approxQuantity: 25
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.requiresPayment).toBe(false);
      expect(res.body.booking).toHaveProperty('tokenNumber');
      expect(res.body.booking.tokenNumber).toMatch(/^KC-\d{3,}$/);
    });

    test('POST /api/bookings - Duplicate booking for same date returns 400', async () => {
      const db = getDb();
      const farmer3Booking = db.bookings.find((b) => b.farmerId === 'usr_f3' && !['Completed', 'Cancelled', 'Paid'].includes(b.status));

      if (farmer3Booking) {
        const availSch = db.schedules.find((s) => s.date === farmer3Booking.date && s.bookedCount < s.capacity && s.status !== 'Disabled');
        if (availSch) {
          const res = await request(app)
            .post('/api/bookings')
            .set('Authorization', 'Bearer mock_firebase_token_usr_f3')
            .send({
              scheduleId: availSch.id,
              cropType: 'Wheat',
              approxQuantity: 15
            });

          expect(res.status).toBe(400);
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('already have an active booking');
        }
      }
    });

    test('POST /api/bookings - Booking full slot returns 400', async () => {
      const db = getDb();
      const fullSch = db.schedules.find((s) => s.status === 'Full' || s.bookedCount >= s.capacity);

      if (fullSch) {
        const res = await request(app)
          .post('/api/bookings')
          .set('Authorization', 'Bearer mock_firebase_token_usr_f4')
          .send({
            scheduleId: fullSch.id,
            cropType: 'Wheat',
            approxQuantity: 10
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('full');
      }
    });

    test('POST /api/bookings - Invalid quantity (<= 0 or string NaN) returns 400', async () => {
      const db = getDb();
      const availSch = db.schedules[0];

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer mock_firebase_token_usr_f5')
        .send({
          scheduleId: availSch.id,
          cropType: 'Wheat',
          approxQuantity: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Approximate quantity must be a valid positive number');
    });
  });

  // ==================================================
  // 5. DIGITAL TOKEN & FARMER DATA ISOLATION TESTS
  // ==================================================
  describe('5. Digital Token & Farmer Isolation', () => {
    test('GET /api/bookings/my-token - Returns active digital token for logged-in farmer', async () => {
      const res = await request(app)
        .get('/api/bookings/my-token')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasActiveBooking).toBe(true);
      expect(res.body.token).toHaveProperty('tokenNumber');
    });

    test('GET /api/bookings/my-bookings - Farmer only sees their own bookings (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.bookings)).toBe(true);

      // Verify data isolation: Every booking must belong to usr_f1
      res.body.bookings.forEach((b) => {
        expect(b.farmerId).toBe('usr_f1');
      });
    });
  });

  // ==================================================
  // 6. QUEUE & ADMIN CONTROLS TESTS
  // ==================================================
  describe('6. Queue & Admin Controls', () => {
    test('GET /api/queue/status - Public queue status returns current token and wait counts', async () => {
      const res = await request(app).get('/api/queue/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('currentTokenProcessed');
      expect(res.body).toHaveProperty('totalWaitingCount');
    });

    test('POST /api/queue/admin/next-token - Admin can advance queue to next waiting token', async () => {
      const res = await request(app)
        .post('/api/queue/admin/next-token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('PATCH /api/queue/admin/update-status - Admin can update booking procurement status', async () => {
      const db = getDb();
      const booking = db.bookings[0];

      const res = await request(app)
        .patch('/api/queue/admin/update-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bookingId: booking.id,
          status: 'Weighed'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================================================
  // 7. GOVERNMENT MSP PAYMENT CALCULATION & LEDGER TESTS
  // ==================================================
  describe('7. Government MSP Payment Calculation & Ledger', () => {
    test('POST /api/payments/admin/record - Calculates totalAmount = actualQuantity * mspPerQuintal on Backend', async () => {
      const db = getDb();
      const booking = db.bookings.find((b) => b.status !== 'Paid');

      if (booking) {
        const actualQty = 20.5;
        const customMsp = 2425;
        const expectedTotal = 20.5 * 2425; // 49712.5

        const res = await request(app)
          .post('/api/payments/admin/record')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            bookingId: booking.id,
            actualQuantity: actualQty,
            customMsp: customMsp
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.payment.totalAmount).toBe(expectedTotal);
        expect(res.body.booking.status).toBe('Paid');
      }
    });

    test('POST /api/payments/admin/record - Invalid zero/negative quantity returns 400', async () => {
      const db = getDb();
      const booking = db.bookings[0];

      const res = await request(app)
        .post('/api/payments/admin/record')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bookingId: booking.id,
          actualQuantity: -10,
          customMsp: 2425
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Actual quantity must be a positive number');
    });

    test('GET /api/payments/history - Farmer receives isolated payment history', async () => {
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.payments)).toBe(true);

      res.body.payments.forEach((p) => {
        expect(p.farmerId).toBe('usr_f1');
      });
    });

    test('GET /api/payments/admin/all - Admin receives full financial ledger stats', async () => {
      const res = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('totalRevenue');
      expect(Array.isArray(res.body.payments)).toBe(true);
    });
  });

  // ==================================================
  // 8. DATABASE / STORE PERSISTENCE TESTS
  // ==================================================
  describe('8. Database / Store Persistence', () => {
    test('getDb() and saveDb() correctly persist data integrity', () => {
      const db = getDb();
      expect(db).toHaveProperty('users');
      expect(db).toHaveProperty('procurementCentres');
      expect(db).toHaveProperty('schedules');
      expect(db).toHaveProperty('bookings');
      expect(db).toHaveProperty('payments');

      // Verify saveDb executes without throwing
      expect(() => saveDb(db)).not.toThrow();
    });
  });
});

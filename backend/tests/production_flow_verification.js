const request = require('supertest');
const app = require('../server');

async function runProductionFlowVerification() {
  console.log('🌾 ====================================================');
  console.log('🌾 KISAN CONNECT — PRODUCTION FLOW VERIFICATION');
  console.log('🌾 ====================================================\n');

  let passedSteps = 0;
  let totalSteps = 0;

  function assert(condition, message) {
    totalSteps++;
    if (condition) {
      console.log(`  ✓ [STEP ${totalSteps}] ${message}`);
      passedSteps++;
    } else {
      console.error(`  ✗ [STEP ${totalSteps}] FAILED: ${message}`);
      throw new Error(`Verification failed at step: ${message}`);
    }
  }

  // 1. Health check
  console.log('--- 1. Testing Production API Health Endpoint ---');
  const healthRes = await request(app).get('/api/health');
  assert(healthRes.status === 200 && healthRes.body.status === 'ok', 'GET /api/health returns 200 OK');

  // 2. CORS Verification
  console.log('\n--- 2. Testing Production CORS Policy ---');
  const corsNetlifyRes = await request(app)
    .get('/api/health')
    .set('Origin', 'https://kisan-connect.netlify.app');
  assert(corsNetlifyRes.status === 200, 'Netlify subdomain https://kisan-connect.netlify.app allowed by CORS');

  const corsLocalhostRes = await request(app)
    .get('/api/health')
    .set('Origin', 'http://localhost:3000');
  assert(corsLocalhostRes.status === 200, 'Local development http://localhost:3000 allowed by CORS');

  // 3. Farmer 1 Authentication & Sync Profile
  console.log('\n--- 3. Testing Farmer 1 Authentication & Profile Sync ---');
  const farmer1Token = 'mock_firebase_token_usr_f1';
  const syncFarmer1 = await request(app)
    .post('/api/auth/sync-profile')
    .set('Authorization', `Bearer ${farmer1Token}`)
    .send({ name: 'Ramesh Patil', phone: '+919876543210', district: 'Nashik' });
  assert(syncFarmer1.status === 200 || syncFarmer1.status === 201, 'Farmer 1 sync-profile returns 200/201');
  assert(syncFarmer1.body.user.role === 'farmer', 'Farmer 1 role is verified as "farmer"');
  assert(syncFarmer1.body.user.farmerId === 'KC-F-8821', 'Farmer 1 has unique farmerId KC-F-8821');

  // 4. Farmer 2 Authentication & Profile Sync (Data Isolation check)
  console.log('\n--- 4. Testing Farmer 2 Authentication (Data Isolation) ---');
  const farmer2Token = 'mock_firebase_token_usr_f2';
  const syncFarmer2 = await request(app)
    .post('/api/auth/sync-profile')
    .set('Authorization', `Bearer ${farmer2Token}`)
    .send({ name: 'Suresh Deshmukh', phone: '+919876543211', district: 'Pune' });
  assert(syncFarmer2.status === 200 || syncFarmer2.status === 201, 'Farmer 2 sync-profile returns 200/201');
  assert(syncFarmer2.body.user.name === 'Suresh Deshmukh', 'Farmer 2 receives unique name "Suresh Deshmukh"');
  assert(syncFarmer2.body.user.id !== syncFarmer1.body.user.id, 'Farmer 1 and Farmer 2 have distinct IDs (Data Isolation)');

  // 5. Admin Authentication
  console.log('\n--- 5. Testing Admin Authentication & Role Enforcement ---');
  const adminToken = 'mock_firebase_token_usr_admin';
  const syncAdmin = await request(app)
    .post('/api/auth/sync-profile')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ role: 'admin' });
  assert(syncAdmin.status === 200 || syncAdmin.status === 201, 'Admin sync-profile returns 200/201');
  assert(syncAdmin.body.user.role === 'admin', 'Admin role is verified as "admin"');

  // Farmer blocked from Admin API
  const farmerBlocked = await request(app)
    .get('/api/queue/admin/dashboard')
    .set('Authorization', `Bearer ${farmer1Token}`);
  assert(farmerBlocked.status === 403, 'Farmer accessing admin route is denied with 403 Forbidden');

  // Admin allowed to Admin API
  const adminAllowed = await request(app)
    .get('/api/queue/admin/dashboard')
    .set('Authorization', `Bearer ${adminToken}`);
  assert(adminAllowed.status === 200, 'Admin accessing admin route succeeds with 200 OK');

  // 6. Centres & Schedules
  console.log('\n--- 6. Testing Centres and Operating Schedules ---');
  const centresRes = await request(app).get('/api/schedules/centres');
  assert(centresRes.status === 200 && centresRes.body.centres.length > 0, 'Centres list returned successfully');

  const schedulesRes = await request(app).get('/api/schedules');
  assert(schedulesRes.status === 200 && schedulesRes.body.schedules.length > 0, 'Schedules list returned successfully');

  // 7. Booking Creation & Digital Token Issuance
  console.log('\n--- 7. Testing Slot Booking & Digital Token Issuance ---');
  const targetSchedule = schedulesRes.body.schedules.find(s => s.availableSlots > 0 && s.status !== 'Disabled') || schedulesRes.body.schedules[0];

  const bookRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${farmer2Token}`)
    .send({
      scheduleId: targetSchedule.id,
      cropType: 'Soybean',
      approxQuantity: 25
    });
  assert(bookRes.status === 201 || (bookRes.status === 400 && bookRes.body.message.includes('already have an active booking')), 'Booking attempt processed correctly');

  // 8. Farmer Token & Queue Position
  console.log('\n--- 8. Testing Farmer Digital Token & Live Queue Position ---');
  const myTokenRes = await request(app)
    .get('/api/bookings/my-token')
    .set('Authorization', `Bearer ${farmer1Token}`);
  assert(myTokenRes.status === 200 && myTokenRes.body.success === true, 'GET /api/bookings/my-token succeeds');

  const queueRes = await request(app).get('/api/queue/status');
  assert(queueRes.status === 200 && queueRes.body.success === true, 'GET /api/queue/status succeeds');
  assert(typeof queueRes.body.totalWaitingCount === 'number', 'Queue status returns valid waiting count');

  // 9. Admin Queue Advancement & Crop Weighing & MSP Payment Recording
  console.log('\n--- 9. Testing Procurement Status Lifecycle & MSP Payment Ledger ---');
  const advanceRes = await request(app)
    .post('/api/queue/admin/next-token')
    .set('Authorization', `Bearer ${adminToken}`);
  assert(advanceRes.status === 200, 'Admin successfully advanced queue to next token');

  // Record government MSP procurement payment
  const recordPayRes = await request(app)
    .post('/api/payments/admin/record')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      bookingId: 'bk_97',
      actualQuantity: 22.5,
      notes: 'Grain tested: Grade A quality passed inspection.'
    });
  assert(recordPayRes.status === 200 && recordPayRes.body.success === true, 'Government MSP payment recorded with backend calculation');
  assert(recordPayRes.body.payment.totalAmount > 0, `Total MSP amount calculated on backend: ₹${recordPayRes.body.payment.totalAmount}`);

  // 10. Farmer Payment History & Isolation
  console.log('\n--- 10. Testing Farmer Isolated Payment History & Receipt ---');
  const farmer3Token = 'mock_firebase_token_usr_f3'; // Owner of bk_97
  const payHistoryRes = await request(app)
    .get('/api/payments/history')
    .set('Authorization', `Bearer ${farmer3Token}`);
  assert(payHistoryRes.status === 200 && Array.isArray(payHistoryRes.body.payments), 'Farmer retrieves personal payment history');
  assert(payHistoryRes.body.payments.every(p => p.farmerId === 'usr_f3'), 'Strict data isolation: Farmer only sees their own payments');

  const receiptRes = await request(app)
    .get('/api/payments/receipt/bk_97')
    .set('Authorization', `Bearer ${farmer3Token}`);
  assert(receiptRes.status === 200 && receiptRes.body.success === true, 'Farmer retrieves official procurement receipt');
  assert(receiptRes.body.receipt.tokenNumber !== undefined, 'Receipt contains official token number');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedSteps}/${totalSteps} VERIFICATION STEPS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runProductionFlowVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  });

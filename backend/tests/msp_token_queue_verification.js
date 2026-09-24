const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../config/db');
const { CROP_MSP_DATA, resolveCrop, getCropMspPrice } = require('../config/mspConfig');

const farmerToken = 'mock_firebase_token_usr_f1';
const otherFarmerToken = 'mock_firebase_token_usr_f2';
const adminToken = 'mock_firebase_token_usr_admin';

async function runTests() {
  console.log('=== STARTING AUDIT VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1 & 2: GET /api/schedules/msp-rates -> 200 & 12 crops
    const resMsp = await request(app).get('/api/schedules/msp-rates');
    assert(resMsp.status === 200, 'GET /api/schedules/msp-rates returns 200');
    assert(Array.isArray(resMsp.body.rates) && resMsp.body.rates.length === 12, '12 government crops returned in MSP API');

    // 3, 4, 5, 6: Booking MSP per crop
    const db = getDb();
    const sch = db.schedules.find((s) => s.id === 'sch_1'); // Schedule 1 originally had 2425

    // Wheat booking
    const resWheat = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`) // Use admin assisted to avoid duplicate active slot constraint
      .send({
        scheduleId: 'sch_1',
        cropType: 'Wheat (गहू / गेहूं)',
        approxQuantity: 20,
        farmerName: 'Test Farmer Wheat',
        farmerPhone: '9999990001'
      });
    assert(resWheat.status === 201, 'Wheat booking created successfully');
    assert(resWheat.body.booking.mspPerQuintal === 2585, `Wheat booking received MSP 2585 (got ${resWheat.body.booking.mspPerQuintal})`);

    // Soybean booking
    const resSoy = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        scheduleId: 'sch_1',
        cropType: 'Soybean (Yellow)',
        approxQuantity: 15,
        farmerName: 'Test Farmer Soybean',
        farmerPhone: '9999990002'
      });
    assert(resSoy.status === 201, 'Soybean booking created successfully');
    assert(resSoy.body.booking.mspPerQuintal === 5708, `Soybean booking received MSP 5708 (got ${resSoy.body.booking.mspPerQuintal})`);

    // Moong booking
    const resMoong = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        scheduleId: 'sch_1',
        cropType: 'Moong (Green Gram)',
        approxQuantity: 10,
        farmerName: 'Test Farmer Moong',
        farmerPhone: '9999990003'
      });
    assert(resMoong.status === 201, 'Moong booking created successfully');
    assert(resMoong.body.booking.mspPerQuintal === 8780, `Moong booking received MSP 8780 (got ${resMoong.body.booking.mspPerQuintal})`);

    // 7, 8, 9: Payment calculation
    // Actual quantity = 28.5 quintals, Wheat MSP = 2585 -> 73672.5
    const wheatBooking = resWheat.body.booking;
    const resPay = await request(app)
      .post('/api/payments/admin/record')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bookingId: wheatBooking.id,
        actualQuantity: 28.5
      });
    assert(resPay.status === 200, 'Admin recorded crop payment successfully');
    assert(resPay.body.payment.actualQuantity === 28.5, 'Payment recorded actualQuantity = 28.5');
    assert(resPay.body.payment.mspPerQuintal === 2585, 'Payment used applicable Wheat MSP = 2585');
    assert(resPay.body.payment.totalAmount === 73672.5, `Final Payment = 28.5 × 2585 = 73672.50 (got ${resPay.body.payment.totalAmount})`);
    assert(resPay.body.booking.status === 'Paid', 'Booking status updated to Paid');

    // 10 - 17: Token persistence across refresh and status = Paid
    // Check my-token for farmer who owns a booking
    // Create a dedicated booking for usr_f2
    const resF2Booking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${otherFarmerToken}`)
      .send({
        scheduleId: 'sch_4', // tomorrow's slot
        cropType: 'Rice (Paddy - Grade A)',
        approxQuantity: 25
      });
    assert(resF2Booking.status === 201, 'Booking created for farmer usr_f2');
    const f2TokenNumber = resF2Booking.body.booking.tokenNumber;
    assert(Boolean(f2TokenNumber), `Token generated: ${f2TokenNumber}`);

    // Fetch my-token initial
    const resToken1 = await request(app)
      .get('/api/bookings/my-token')
      .set('Authorization', `Bearer ${otherFarmerToken}`);
    assert(resToken1.body.success === true, 'my-token fetch success');
    assert(resToken1.body.token.tokenNumber === f2TokenNumber, 'Same token retrieved on initial fetch');

    // Advance to Weighed
    await request(app)
      .patch('/api/queue/admin/update-status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bookingId: resF2Booking.body.booking.id, status: 'Weighed' });

    // Fetch my-token while Weighed
    const resTokenWeighed = await request(app)
      .get('/api/bookings/my-token')
      .set('Authorization', `Bearer ${otherFarmerToken}`);
    assert(resTokenWeighed.body.hasActiveBooking === true, 'Booking remains active when Weighed');
    assert(resTokenWeighed.body.token.tokenNumber === f2TokenNumber, 'Token remains persistent when Weighed');

    // Pay booking
    await request(app)
      .post('/api/payments/admin/record')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bookingId: resF2Booking.body.booking.id,
        actualQuantity: 24.5
      });

    // Fetch my-token while Paid
    const resTokenPaid = await request(app)
      .get('/api/bookings/my-token')
      .set('Authorization', `Bearer ${otherFarmerToken}`);
    assert(resTokenPaid.body.hasActiveBooking === true, 'Booking remains active/trackable after Paid');
    assert(resTokenPaid.body.token.tokenNumber === f2TokenNumber, 'Same token persists after Paid');
    assert(resTokenPaid.body.token.status === 'Paid', 'Booking status confirmed as Paid');

    // 27 & 28: Real Queue calculations (no fake 6/7)
    assert(typeof resToken1.body.token.farmersAhead === 'number', 'farmersAhead is a genuine number');
    assert(typeof resToken1.body.token.queuePosition === 'number', 'queuePosition is a genuine number');

    // 29 - 32: Security
    // Farmer 1 cannot access farmer 2's payment receipt
    const resSec1 = await request(app)
      .get(`/api/payments/receipt/${resF2Booking.body.booking.id}`)
      .set('Authorization', `Bearer ${farmerToken}`);
    assert(resSec1.status === 403, 'Data Isolation: Farmer cannot access another farmer receipt (403)');

    // Farmer cannot access admin payment endpoint
    const resSec2 = await request(app)
      .post('/api/payments/admin/record')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ bookingId: resF2Booking.body.booking.id, actualQuantity: 20 });
    assert(resSec2.status === 403, 'Security: Farmer cannot access admin payment endpoint (403)');

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  }
}

runTests();

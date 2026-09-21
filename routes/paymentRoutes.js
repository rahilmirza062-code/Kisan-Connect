const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify', verifyToken, paymentController.verifyPayment);
router.get('/history', verifyToken, paymentController.getPaymentHistory);
router.get('/admin/all', verifyToken, requireAdmin, paymentController.getAdminPayments);
router.post('/admin/record', verifyToken, requireAdmin, paymentController.recordAdminPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/receipt/:bookingId', verifyToken, paymentController.getReceipt);

module.exports = router;

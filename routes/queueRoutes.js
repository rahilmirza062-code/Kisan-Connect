const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/status', queueController.getQueueStatus);
router.get('/admin/dashboard', verifyToken, requireAdmin, queueController.getAdminDashboard);
router.patch('/admin/update-status', verifyToken, requireAdmin, queueController.updateBookingStatus);
router.post('/admin/next-token', verifyToken, requireAdmin, queueController.callNextToken);
router.put('/admin/settings', verifyToken, requireAdmin, queueController.updateSettings);

module.exports = router;

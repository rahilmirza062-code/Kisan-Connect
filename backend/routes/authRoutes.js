const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/sync-profile', verifyToken, authController.syncProfile);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;

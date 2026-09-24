const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, bookingController.createBooking);
router.get('/my-token', verifyToken, bookingController.getMyToken);
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);
router.patch('/cancel/:id', verifyToken, bookingController.cancelBooking);
router.patch('/:id/cancel', verifyToken, bookingController.cancelBooking);

module.exports = router;

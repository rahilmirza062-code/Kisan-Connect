const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/centres', scheduleController.getCentres);
router.get('/msp-rates', scheduleController.getMspRates);
router.post('/centres', verifyToken, requireAdmin, scheduleController.addCentre);
router.put('/centres/:id', verifyToken, requireAdmin, scheduleController.updateCentre);

router.get('/', scheduleController.getSchedules);
router.post('/', verifyToken, requireAdmin, scheduleController.addSchedule);
router.put('/:id', verifyToken, requireAdmin, scheduleController.updateSchedule);

module.exports = router;

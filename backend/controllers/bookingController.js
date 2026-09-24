const { getDb, saveDb } = require('../config/db');
const { getCropMspPrice, resolveCrop } = require('../config/mspConfig');

exports.createBooking = (req, res) => {
  try {
    const { scheduleId, cropType, quantity, approxQuantity, farmerId: bodyFarmerId, farmerName: bodyFarmerName, farmerPhone: bodyFarmerPhone } = req.body;

    const db = getDb();
    let isAssisted = false;
    let targetFarmerId = req.user ? req.user.id : null;
    let targetFarmerName = req.user ? req.user.name : '';
    let targetFarmerPhone = '';

    // Assisted booking check (Admin booking on behalf of farmer without smartphone)
    if (req.user && req.user.role === 'admin' && bodyFarmerName) {
      isAssisted = true;
      targetFarmerName = bodyFarmerName;
      targetFarmerPhone = bodyFarmerPhone || '';
      targetFarmerId = bodyFarmerId || `usr_assisted_${Date.now()}`;
    } else {
      const u = db.users.find((user) => user.id === req.user.id);
      if (u) {
        targetFarmerName = u.name;
        targetFarmerPhone = u.phone;
      }
    }

    if (!scheduleId || !cropType) {
      return res.status(400).json({ success: false, message: 'Schedule and Crop Type are required.' });
    }

    // Validate Approx Quantity (Must be numeric and > 0, e.g. 20 or 12.5 Quintals)
    const rawQty = approxQuantity !== undefined ? approxQuantity : quantity;
    const cleanQtyStr = typeof rawQty === 'string' ? rawQty.replace(/[^\d.]/g, '') : rawQty;
    const qtyNum = parseFloat(cleanQtyStr);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Approximate quantity must be a valid positive number (Quintals).' });
    }

    const schedule = db.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    if (schedule.bookedCount >= schedule.capacity) {
      return res.status(400).json({ success: false, message: 'Selected slot is full. Please select another time slot.' });
    }

    // Check for duplicate active booking for non-assisted farmer on same schedule date
    if (!isAssisted) {
      const existingActive = db.bookings.find(
        (b) =>
          b.farmerId === targetFarmerId &&
          b.date === schedule.date &&
          !['Completed', 'Cancelled', 'Paid'].includes(b.status)
      );

      if (existingActive) {
        return res.status(400).json({
          success: false,
          message: `You already have an active booking (${existingActive.tokenNumber}) for ${schedule.date}.`
        });
      }
    }

    const bookingId = `bk_${Date.now()}`;
    const nextSeq = (db.settings.lastTokenSeq || 104) + 1;
    db.settings.lastTokenSeq = nextSeq;
    const tokenNumber = `KC-${nextSeq.toString().padStart(3, '0')}`;

    // Look up centre for location/address
    const centre = db.procurementCentres.find((c) => c.id === schedule.centreId);

    // Resolve accurate MSP per quintal from centralized mspConfig using the selected crop
    const resolvedCrop = resolveCrop(cropType);
    const resolvedCropName = resolvedCrop ? resolvedCrop.name : cropType;
    const resolvedMsp = getCropMspPrice(cropType, 2585);

    const newBooking = {
      id: bookingId,
      farmerId: targetFarmerId,
      farmerName: targetFarmerName,
      farmerPhone: targetFarmerPhone,
      centreId: schedule.centreId,
      centreName: schedule.centreName,
      centreLocation: schedule.centreLocation || (centre ? centre.location : '') || '',
      centreAddress: schedule.centreAddress || (centre ? centre.address : '') || '',
      scheduleId: schedule.id,
      date: schedule.date,
      timeSlot: `${schedule.startTime} - ${schedule.endTime}`,
      cropType: resolvedCropName,
      quantity: `${qtyNum} Quintals`,
      approxQuantity: qtyNum,
      mspPerQuintal: resolvedMsp,
      tokenNumber,
      queueNumber: nextSeq,
      status: 'Booking Confirmed',
      paymentStatus: 'pending_procurement',
      amount: 0,
      isAssisted,
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);
    schedule.bookedCount += 1;
    if (schedule.bookedCount >= schedule.capacity) {
      schedule.status = 'Full';
    }
    saveDb(db);

    return res.status(201).json({
      success: true,
      message: 'Procurement slot booked successfully! Digital token issued.',
      booking: newBooking,
      requiresPayment: false
    });
  } catch (err) {
    console.error('Booking Error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

exports.getMyToken = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    // Get latest non-cancelled booking for tracking
    const activeBooking = db.bookings
      .filter((b) => b.farmerId === userId && b.status !== 'Cancelled')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!activeBooking) {
      const recent = db.bookings
        .filter((b) => b.farmerId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return res.json({
        success: true,
        hasActiveBooking: false,
        token: recent || null
      });
    }

    const currentToken = db.settings.currentTokenProcessed || 'KC-097';
    const currentNum = parseInt(currentToken.replace(/\D/g, '')) || 0;
    const userNum = activeBooking.queueNumber;

    const isCompletedOrPaid = ['Completed', 'Paid'].includes(activeBooking.status);
    const aheadCount = isCompletedOrPaid ? 0 : Math.max(0, userNum - currentNum - 1);
    const queuePosition = isCompletedOrPaid ? 1 : Math.max(1, aheadCount + 1);
    const avgTime = db.settings.averageProcessingTimeMinutes || 5;
    const estimatedWaitMinutes = isCompletedOrPaid ? 0 : aheadCount * avgTime;

    return res.json({
      success: true,
      hasActiveBooking: true,
      token: {
        ...activeBooking,
        currentTokenProcessed: currentToken,
        farmersAhead: aheadCount,
        queuePosition,
        estimatedWaitMinutes,
        averageProcessingTimeMinutes: avgTime
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch token.' });
  }
};

exports.getMyBookings = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const userBookings = db.bookings
      .filter((b) => b.farmerId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, bookings: userBookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

exports.cancelBooking = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const booking = db.bookings.find((b) => b.id === id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Security check: Only booking owner or admin can cancel
    if (req.user.role !== 'admin' && booking.farmerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only cancel your own bookings.' });
    }

    // Check if cancellation is allowed for current booking status
    const nonCancellableStatuses = [
      'Procurement In Progress',
      'Weighed',
      'Payment Processed',
      'Paid',
      'Completed',
      'Cancelled'
    ];

    if (nonCancellableStatuses.includes(booking.status) || booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because its current status is '${booking.status}'.`
      });
    }

    // Update booking status to Cancelled
    booking.status = 'Cancelled';

    // Release capacity slot in schedule
    const schedule = db.schedules.find((s) => s.id === booking.scheduleId);
    if (schedule && schedule.bookedCount > 0) {
      schedule.bookedCount -= 1;
      if (schedule.bookedCount < schedule.capacity && schedule.status === 'Full') {
        schedule.status = 'Available';
      }
    }

    // Push notification record to farmer
    if (!db.notifications) db.notifications = [];
    db.notifications.push({
      id: `ntf_${Date.now()}`,
      userId: booking.farmerId,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.tokenNumber}) for ${booking.centreName} on ${booking.date} has been cancelled.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Slot has been released.',
      booking
    });
  } catch (err) {
    console.error('Cancel Booking Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};

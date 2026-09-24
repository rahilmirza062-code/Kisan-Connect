const { getDb, saveDb } = require('../config/db');

exports.getQueueStatus = (req, res) => {
  try {
    const db = getDb();
    const currentToken = db.settings.currentTokenProcessed || 'KC-097';
    const avgTime = db.settings.averageProcessingTimeMinutes || 5;

    const activeBookings = db.bookings.filter(
      (b) => !['Completed', 'Cancelled'].includes(b.status)
    );

    activeBookings.sort((a, b) => a.queueNumber - b.queueNumber);

    const currentBooking = db.bookings.find((b) => b.tokenNumber === currentToken);

    return res.json({
      success: true,
      currentTokenProcessed: currentToken,
      currentFarmerName: currentBooking ? currentBooking.farmerName : 'None',
      averageProcessingTimeMinutes: avgTime,
      totalWaitingCount: activeBookings.length,
      allActiveTokens: activeBookings.map((b) => ({
        id: b.id,
        tokenNumber: b.tokenNumber,
        farmerName: b.farmerName,
        cropType: b.cropType,
        quantity: b.quantity,
        timeSlot: b.timeSlot,
        status: b.status,
        queueNumber: b.queueNumber
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch queue status.' });
  }
};

exports.getAdminDashboard = (req, res) => {
  try {
    const db = getDb();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalFarmers = db.users.filter((u) => u.role === 'farmer').length;
    const todaysBookings = db.bookings.filter((b) => b.date === todayStr);
    const activeTokens = db.bookings.filter((b) => !['Completed', 'Cancelled'].includes(b.status));
    const completedProcurements = db.bookings.filter((b) => b.status === 'Completed');
    const waitingFarmers = db.bookings.filter((b) => b.status === 'Waiting');

    const totalCapacity = db.schedules.reduce((acc, s) => acc + s.capacity, 0);
    const totalBooked = db.schedules.reduce((acc, s) => acc + s.bookedCount, 0);
    const availableSlots = Math.max(0, totalCapacity - totalBooked);

    return res.json({
      success: true,
      stats: {
        totalFarmers,
        todaysBookingsCount: todaysBookings.length,
        activeTokensCount: activeTokens.length,
        completedCount: completedProcurements.length,
        waitingCount: waitingFarmers.length,
        availableSlotsCount: availableSlots,
        totalCentresCount: db.procurementCentres.length,
        currentTokenProcessed: db.settings.currentTokenProcessed || 'KC-097',
        averageProcessingTimeMinutes: db.settings.averageProcessingTimeMinutes || 5
      },
      recentBookings: db.bookings
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .map((b) => {
          const user = db.users.find((u) => u.id === b.farmerId);
          return {
            ...b,
            farmerName: b.farmerName || (user ? user.fullName : 'Farmer'),
            farmerPhone: b.farmerPhone || (user ? user.phone : '')
          };
        })
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard stats.' });
  }
};

exports.updateBookingStatus = (req, res) => {
  try {
    const { bookingId, status, currentTokenProcessed } = req.body;
    const db = getDb();

    if (currentTokenProcessed) {
      db.settings.currentTokenProcessed = currentTokenProcessed;
    }

    if (bookingId && status) {
      const booking = db.bookings.find((b) => b.id === bookingId || b.tokenNumber === bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      booking.status = status;

      // Status Notification mapping
      const statusMessages = {
        'Booking Confirmed': 'Your procurement booking has been confirmed.',
        'Waiting': `You are currently in line. Token: ${booking.tokenNumber}`,
        'Your Turn Soon': `ATTENTION: Your turn is approaching soon! Please prepare your produce at ${booking.centreName}.`,
        'At Procurement Centre': `You have arrived at ${booking.centreName}. Token verification in progress.`,
        'Procurement In Progress': `Procurement has started for token ${booking.tokenNumber}. Moisture and quality grading under way.`,
        'Weighed': `Crop weighing completed for token ${booking.tokenNumber}. Actual quantity recorded.`,
        'Payment Processed': `Government MSP calculation completed for token ${booking.tokenNumber}.`,
        'Paid': `Government MSP payment recorded successfully for token ${booking.tokenNumber}! Check Payment History.`,
        'Completed': `Procurement completed successfully for token ${booking.tokenNumber}. Thank you for using Kisan Connect!`,
        'Cancelled': `Booking ${booking.tokenNumber} has been cancelled by administration.`
      };

      db.notifications.push({
        id: `ntf_${Date.now()}`,
        userId: booking.farmerId,
        title: `Status Update: ${status}`,
        message: statusMessages[status] || `Your booking status updated to ${status}.`,
        type: status === 'Completed' ? 'success' : status === 'Your Turn Soon' ? 'warning' : 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);

    return res.json({
      success: true,
      message: 'Status updated successfully.',
      currentTokenProcessed: db.settings.currentTokenProcessed
    });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

exports.callNextToken = (req, res) => {
  try {
    const db = getDb();
    const currentToken = db.settings.currentTokenProcessed || 'KC-097';

    // Complete current token if in progress
    const currentBooking = db.bookings.find((b) => b.tokenNumber === currentToken);
    if (currentBooking && currentBooking.status !== 'Completed') {
      currentBooking.status = 'Completed';
    }

    // Find next waiting token
    const waitingList = db.bookings
      .filter((b) => ['Waiting', 'Your Turn Soon', 'Booking Confirmed'].includes(b.status))
      .sort((a, b) => a.queueNumber - b.queueNumber);

    if (waitingList.length === 0) {
      saveDb(db);
      return res.json({
        success: true,
        message: 'No more waiting farmers in queue.',
        currentTokenProcessed: currentToken
      });
    }

    const nextBooking = waitingList[0];
    nextBooking.status = 'Procurement In Progress';
    db.settings.currentTokenProcessed = nextBooking.tokenNumber;

    // Send Notification to next farmer
    db.notifications.push({
      id: `ntf_${Date.now()}`,
      userId: nextBooking.farmerId,
      title: 'It is Your Turn Now!',
      message: `Token ${nextBooking.tokenNumber}: Please proceed immediately to Counter #1 at ${nextBooking.centreName}.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Notify the following farmer ("Your Turn Soon")
    if (waitingList.length > 1) {
      const upcomingBooking = waitingList[1];
      upcomingBooking.status = 'Your Turn Soon';
      db.notifications.push({
        id: `ntf_${Date.now()}`,
        userId: upcomingBooking.farmerId,
        title: 'Get Ready - Your Turn Soon',
        message: `Token ${upcomingBooking.tokenNumber}: You are next in queue. Please be near the entry area.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);

    return res.json({
      success: true,
      message: `Called next token: ${nextBooking.tokenNumber}`,
      currentTokenProcessed: nextBooking.tokenNumber,
      nextFarmerName: nextBooking.farmerName
    });
  } catch (err) {
    console.error('Call Next Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to advance queue.' });
  }
};

exports.updateSettings = (req, res) => {
  try {
    const { averageProcessingTimeMinutes, bookingFeeAmount } = req.body;
    const db = getDb();

    if (averageProcessingTimeMinutes !== undefined && !isNaN(averageProcessingTimeMinutes)) {
      db.settings.averageProcessingTimeMinutes = parseInt(averageProcessingTimeMinutes);
    }
    if (bookingFeeAmount !== undefined && !isNaN(bookingFeeAmount)) {
      db.settings.bookingFeeAmount = parseFloat(bookingFeeAmount);
    }

    saveDb(db);

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      averageProcessingTimeMinutes: db.settings.averageProcessingTimeMinutes,
      bookingFeeAmount: db.settings.bookingFeeAmount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

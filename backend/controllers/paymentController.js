const crypto = require('crypto');
const Razorpay = require('razorpay');
const { getDb, saveDb } = require('../config/db');
const { getCropMspPrice, resolveCrop } = require('../config/mspConfig');

const resolveMsp = (cropType, booking) => {
  if (booking && booking.mspPerQuintal && !isNaN(booking.mspPerQuintal) && booking.mspPerQuintal > 0) {
    return parseFloat(booking.mspPerQuintal);
  }
  return getCropMspPrice(cropType, 2585);
};

// Record Government Crop Payment (Admin Action upon crop weighing)
exports.recordAdminPayment = (req, res) => {
  try {
    const { bookingId, actualQuantity, customMsp } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const qty = parseFloat(actualQuantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Actual quantity must be a positive number (Quintals).' });
    }

    const db = getDb();
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated procurement booking not found.' });
    }

    const mspPerQuintal = customMsp && !isNaN(customMsp) && parseFloat(customMsp) > 0
      ? parseFloat(customMsp)
      : resolveMsp(booking.cropType, booking);

    // Final Government Payment = Actual Quantity × Applicable Crop MSP
    const totalAmount = Math.round(qty * mspPerQuintal * 100) / 100;

    const todayStr = new Date().toISOString().split('T')[0];
    const dateCompact = todayStr.replace(/-/g, '');
    const seq = (db.payments.length + 1).toString().padStart(3, '0');
    const transactionReference = `KC-PAY-${dateCompact}-${seq}`;

    let payment = db.payments.find((p) => p.bookingId === booking.id);
    if (!payment) {
      payment = {
        id: `PAY-${Date.now()}`,
        bookingId: booking.id,
        farmerId: booking.farmerId,
        farmerName: booking.farmerName,
        createdAt: new Date().toISOString()
      };
      db.payments.push(payment);
    }

    payment.centreId = booking.centreId;
    payment.centreName = booking.centreName;
    payment.centreLocation = booking.centreLocation || '';
    payment.centreAddress = booking.centreAddress || '';
    payment.cropType = booking.cropType;
    payment.approxQuantity = booking.approxQuantity || booking.quantity || `${qty} Quintals`;
    payment.actualQuantity = qty;
    payment.mspPerQuintal = mspPerQuintal;
    payment.totalAmount = totalAmount;
    payment.amount = totalAmount;
    payment.currency = 'INR';
    payment.status = 'paid';
    payment.paymentStatus = 'PAID';
    payment.paymentDate = todayStr;
    payment.transactionReference = transactionReference;
    payment.paymentMethod = 'Government Direct Benefit Transfer (Demo)';
    payment.verifiedAt = new Date().toISOString();
    payment.scheduleDate = booking.date;
    payment.timeSlot = booking.timeSlot;
    payment.tokenNumber = booking.tokenNumber;
    payment.farmerName = booking.farmerName;

    // Update Booking State
    booking.actualQuantity = qty;
    booking.mspPerQuintal = mspPerQuintal;
    booking.totalAmount = totalAmount;
    booking.status = 'Paid';
    booking.paymentStatus = 'paid';
    booking.paymentId = payment.id;

    // Send Notification to Farmer
    db.notifications.push({
      id: `ntf_${Date.now()}`,
      userId: booking.farmerId,
      title: 'Government Payment Processed!',
      message: `Government payment of ₹${totalAmount.toLocaleString('en-IN')} recorded for ${qty} Quintals of ${booking.cropType} (MSP: ₹${mspPerQuintal}/Qtl). Ref: ${transactionReference}`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);

    return res.status(200).json({
      success: true,
      message: 'Government crop payment recorded successfully!',
      payment,
      booking
    });
  } catch (err) {
    console.error('Record Government Payment Error:', err);
    return res.status(500).json({ success: false, message: 'Server error recording government payment.' });
  }
};

exports.getPaymentHistory = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const userPayments = db.payments
      .filter((p) => p.farmerId === userId)
      .map((p) => {
        const b = db.bookings.find((bk) => bk.id === p.bookingId);
        return {
          ...p,
          tokenNumber: p.tokenNumber || (b ? b.tokenNumber : 'N/A'),
          centreName: p.centreName || (b ? b.centreName : 'Procurement Centre'),
          centreLocation: p.centreLocation || (b ? b.centreLocation : '') || '',
          centreAddress: p.centreAddress || (b ? b.centreAddress : '') || '',
          cropType: p.cropType || (b ? b.cropType : 'N/A'),
          approxQuantity: p.approxQuantity || (b ? (b.approxQuantity || b.quantity) : 'N/A'),
          actualQuantity: p.actualQuantity || null,
          mspPerQuintal: p.mspPerQuintal || null,
          totalAmount: p.totalAmount || p.amount || 0,
          amount: p.totalAmount || p.amount || 0,
          date: p.paymentDate || p.date || (b ? b.date : p.createdAt.split('T')[0]),
          scheduleDate: p.scheduleDate || (b ? b.date : ''),
          timeSlot: p.timeSlot || (b ? b.timeSlot : ''),
          transactionReference: p.transactionReference || `KC-PAY-${p.id}`,
          paymentMethod: p.paymentMethod || 'Government Direct Benefit Transfer (Demo)'
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, payments: userPayments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
};

exports.getAdminPayments = (req, res) => {
  try {
    const db = getDb();
    const todayStr = new Date().toISOString().split('T')[0];

    const rawPayments = Array.isArray(db.payments) ? db.payments : [];
    const allPayments = rawPayments.map((p) => {
      const b = db.bookings.find((bk) => bk.id === p.bookingId);
      const user = db.users.find((u) => u.id === p.farmerId || (b && u.id === b.farmerId));
      return {
        ...p,
        farmerName: p.farmerName || (b ? b.farmerName : null) || (user ? user.fullName : 'Farmer'),
        tokenNumber: b ? b.tokenNumber : (p.tokenNumber || 'N/A'),
        centreName: p.centreName || (b ? b.centreName : 'Procurement Centre'),
        cropType: p.cropType || (b ? b.cropType : 'N/A'),
        approxQuantity: p.approxQuantity || (b ? b.quantity : 'N/A'),
        actualQuantity: p.actualQuantity || null,
        mspPerQuintal: p.mspPerQuintal || null,
        totalAmount: p.totalAmount || p.amount || 0,
        amount: p.totalAmount || p.amount || 0,
        date: p.paymentDate || p.date || (b ? b.date : (p.createdAt ? p.createdAt.split('T')[0] : todayStr)),
        transactionReference: p.transactionReference || `KC-PAY-${p.id}`
      };
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const todaysPayments = allPayments.filter((p) => p.date === todayStr);

    const totalRevenue = allPayments.filter((p) => p.status === 'paid').reduce((acc, p) => acc + (p.totalAmount || p.amount || 0), 0);
    const paidCount = allPayments.filter((p) => p.status === 'paid').length;
    const pendingCount = allPayments.filter((p) => p.status === 'pending').length;
    const failedCount = allPayments.filter((p) => p.status === 'failed').length;

    return res.json({
      success: true,
      stats: {
        totalPaymentsCount: allPayments.length,
        todaysPaymentsCount: todaysPayments.length,
        totalRevenue,
        paidCount,
        pendingCount,
        failedCount
      },
      payments: allPayments
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin payment records.' });
  }
};

// Disconnected Legacy Razorpay Stubs (Maintained for non-breaking API compatibility)
exports.createOrder = async (req, res) => {
  return res.json({ success: true, message: 'No farmer payment required. Government procurement mode active.' });
};

exports.verifyPayment = (req, res) => {
  return res.json({ success: true, message: 'Booking confirmed under Government MSP Procurement system.' });
};

exports.handleWebhook = (req, res) => {
  return res.json({ status: 'ok' });
};

// Receipt / Document endpoint for a specific booking
exports.getReceipt = (req, res) => {
  try {
    const { bookingId } = req.params;
    const db = getDb();
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Security: only booking owner or admin
    if (!isAdmin && booking.farmerId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only view your own receipts.' });
    }

    const payment = db.payments.find((p) => p.bookingId === bookingId);
    const schedule = db.schedules.find((s) => s.id === booking.scheduleId);
    const centre = db.procurementCentres.find((c) => c.id === booking.centreId);
    const farmer = db.users.find((u) => u.id === booking.farmerId);

    const receipt = {
      // Header
      title: 'Kisan Connect',
      subtitle: 'Digital Procurement Management Platform',
      documentType: payment ? 'Payment Receipt' : 'Booking Confirmation',
      generatedAt: new Date().toISOString(),

      // Farmer info
      farmerName: booking.farmerName || (farmer ? farmer.name : 'Farmer'),
      farmerId: farmer ? farmer.farmerId : booking.farmerId,
      farmerPhone: booking.farmerPhone || (farmer ? farmer.phone : ''),

      // Centre info
      centreName: booking.centreName,
      centreLocation: booking.centreLocation || (centre ? centre.location : ''),
      centreAddress: booking.centreAddress || (centre ? centre.address : ''),

      // Schedule info
      scheduleDate: booking.date,
      timeSlot: booking.timeSlot,
      cropType: booking.cropType,

      // Token
      tokenNumber: booking.tokenNumber,
      bookingId: booking.id,
      bookingStatus: booking.status,

      // Quantities
      approxQuantity: booking.approxQuantity || booking.quantity,
      actualQuantity: booking.actualQuantity || null,

      // Payment info
      mspPerQuintal: payment ? payment.mspPerQuintal : (booking.mspPerQuintal || (schedule ? schedule.mspPrice : null)),
      totalAmount: payment ? payment.totalAmount : (booking.totalAmount || null),
      paymentStatus: payment ? payment.paymentStatus : booking.paymentStatus,
      paymentDate: payment ? payment.paymentDate : null,
      transactionReference: payment ? payment.transactionReference : null,
      paymentMethod: payment ? payment.paymentMethod : null,
    };

    return res.json({ success: true, receipt });
  } catch (err) {
    console.error('Receipt Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate receipt.' });
  }
};

const { getDb, saveDb } = require('../config/db');
const { CROP_MSP_DATA } = require('../config/mspConfig');

exports.getMspRates = (req, res) => {
  try {
    return res.json({
      success: true,
      rates: CROP_MSP_DATA
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch MSP rates.' });
  }
};

exports.getCentres = (req, res) => {
  try {
    const db = getDb();
    return res.json({ success: true, centres: db.procurementCentres });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch centres.' });
  }
};

exports.addCentre = (req, res) => {
  try {
    const { name, location, address, district, contactPhone, cropType, mspPrice } = req.body;
    if (!name || !location || !district) {
      return res.status(400).json({ success: false, message: 'Name, location, and district required.' });
    }

    const db = getDb();
    const newCentre = {
      id: `pc_${Date.now()}`,
      name,
      location,
      address: address || `${location}, ${district}`,
      district,
      contactPhone: contactPhone || '',
      cropType: cropType || 'Wheat',
      mspPrice: mspPrice ? parseFloat(mspPrice) : 2275,
      status: 'Active'
    };

    db.procurementCentres.push(newCentre);
    saveDb(db);
    return res.status(201).json({ success: true, centre: newCentre });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add centre.' });
  }
};

exports.updateCentre = (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, address, district, contactPhone, cropType, mspPrice, status } = req.body;
    const db = getDb();
    const centre = db.procurementCentres.find((c) => c.id === id);
    if (!centre) {
      return res.status(404).json({ success: false, message: 'Procurement centre not found.' });
    }

    if (name) centre.name = name;
    if (location) centre.location = location;
    if (address !== undefined) centre.address = address;
    if (district) centre.district = district;
    if (contactPhone !== undefined) centre.contactPhone = contactPhone;
    if (cropType) centre.cropType = cropType;
    if (mspPrice !== undefined) centre.mspPrice = parseFloat(mspPrice);
    if (status) centre.status = status;

    // Auto-generate address from location + district if not explicitly set
    if ((location || district) && !address) {
      centre.address = `${centre.location}, ${centre.district}`;
    }

    // Propagate name, location, and address to existing schedules for this centre
    db.schedules.forEach((s) => {
      if (s.centreId === id) {
        if (name) s.centreName = name;
        if (centre.location) s.centreLocation = centre.location;
        if (centre.address) s.centreAddress = centre.address;
      }
    });

    saveDb(db);
    return res.json({ success: true, message: 'Procurement centre updated successfully.', centre });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update centre.' });
  }
};

exports.getSchedules = (req, res) => {
  try {
    const { centreId, date } = req.query;
    const db = getDb();

    let list = db.schedules;
    if (centreId) {
      list = list.filter((s) => s.centreId === centreId);
    }
    if (date) {
      list = list.filter((s) => s.date === date);
    }

    // Enrich with centre location/address
    const schedulesWithAvailability = list.map((sch) => {
      const available = Math.max(0, sch.capacity - sch.bookedCount);
      let status = sch.status || 'Available';
      if (available === 0 && status !== 'Disabled') status = 'Full';

      // Look up centre for location/address if not already on the schedule
      let centreLocation = sch.centreLocation || '';
      let centreAddress = sch.centreAddress || '';
      if (!centreLocation || !centreAddress) {
        const centre = db.procurementCentres.find((c) => c.id === sch.centreId);
        if (centre) {
          centreLocation = centreLocation || centre.location || '';
          centreAddress = centreAddress || centre.address || `${centre.location}, ${centre.district}`;
        }
      }

      return {
        ...sch,
        centreLocation,
        centreAddress,
        availableSlots: available,
        computedStatus: status
      };
    });

    return res.json({ success: true, schedules: schedulesWithAvailability });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch schedules.' });
  }
};

exports.addSchedule = (req, res) => {
  try {
    const { centreId, date, startTime, endTime, capacity, cropType, mspPrice } = req.body;
    if (!centreId || !date || !startTime || !endTime || !capacity) {
      return res.status(400).json({ success: false, message: 'All schedule details are required.' });
    }

    const db = getDb();
    const centre = db.procurementCentres.find((c) => c.id === centreId);
    if (!centre) {
      return res.status(404).json({ success: false, message: 'Procurement centre not found.' });
    }

    const newSchedule = {
      id: `sch_${Date.now()}`,
      centreId,
      centreName: centre.name,
      centreLocation: centre.location || '',
      centreAddress: centre.address || `${centre.location}, ${centre.district}`,
      date,
      startTime,
      endTime,
      cropType: cropType || centre.cropType || 'Wheat',
      mspPrice: mspPrice ? parseFloat(mspPrice) : (centre.mspPrice || 2275),
      capacity: parseInt(capacity),
      bookedCount: 0,
      status: 'Available'
    };

    db.schedules.push(newSchedule);
    saveDb(db);
    return res.status(201).json({ success: true, schedule: newSchedule });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add schedule.' });
  }
};

exports.updateSchedule = (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, capacity, cropType, mspPrice, status } = req.body;
    const db = getDb();
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    if (date) schedule.date = date;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (capacity !== undefined) schedule.capacity = parseInt(capacity);
    if (cropType) schedule.cropType = cropType;
    if (mspPrice !== undefined) schedule.mspPrice = parseFloat(mspPrice);
    if (status) schedule.status = status;

    saveDb(db);
    return res.json({ success: true, message: 'Schedule updated successfully.', schedule });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update schedule.' });
  }
};

# Crop-Wise MSP Fix Report

## 1. Problem Found
The Kisan Connect web application previously displayed a static or schedule-inherited rate of ₹2,425 / quintal regardless of which crop was selected by the farmer (e.g. Wheat, Soybean, Moong, Cotton). Bookings copied `schedule.mspPrice` directly into `booking.mspPerQuintal`, overriding the farmer's crop selection.

## 2. Root Cause
1. `backend/controllers/bookingController.js` assigned `mspPerQuintal: schedule.mspPrice || (centre ? centre.mspPrice : null)`, binding the booking rate to the centre schedule (which was initialized with 2425 for Nashik APMC) rather than the selected crop.
2. `frontend/src/pages/farmer/BookSlot.jsx` rendered `activeSchedule.mspPrice` instead of resolving the rate from the chosen crop.
3. Multiple duplicate and outdated MSP dictionaries existed across `paymentController.js` (`MSP_LOOKUP`) and `AdminDashboard.jsx` (`MSP_MAP`).

## 3. Files Changed
- `backend/config/mspConfig.js` (NEW): Centralized source of truth for 12 official government crop MSP rates and strict normalizer.
- `backend/controllers/scheduleController.js`: Added `getMspRates` endpoint returning the 12 crop rates.
- `backend/routes/scheduleRoutes.js`: Exposed `GET /api/schedules/msp-rates`.
- `backend/controllers/bookingController.js`: Resolved `mspPerQuintal` strictly from `mspConfig.js` using selected crop.
- `frontend/src/pages/farmer/BookSlot.jsx`: Dynamically fetched official rates from `/api/schedules/msp-rates` and displayed the real-time rate for the selected crop.
- `frontend/src/pages/admin/AdminDashboard.jsx`: Removed hardcoded `MSP_MAP` and resolved rate dynamically.

## 4. Fix Implemented
Configured the exact 12 crop-wise MSP rates:
- **Wheat**: ₹2,585 / quintal
- **Rice (Paddy - Common)**: ₹2,441 / quintal
- **Rice (Paddy - Grade A)**: ₹2,461 / quintal
- **Maize (Corn)**: ₹2,410 / quintal
- **Gram (Chana)**: ₹5,875 / quintal
- **Tur / Arhar (Pigeon Pea)**: ₹8,450 / quintal
- **Moong (Green Gram)**: ₹8,780 / quintal
- **Urad (Black Gram)**: ₹8,200 / quintal
- **Lentil (Masur)**: ₹7,000 / quintal
- **Soybean (Yellow)**: ₹5,708 / quintal
- **Cotton (Medium Staple)**: ₹8,267 / quintal
- **Cotton (Long Staple)**: ₹8,667 / quintal

Implemented strict normalization preventing confusion between Rice Common vs Grade A, and Cotton Medium Staple vs Long Staple.

## 5. Tests Performed
1. Verified `GET /api/schedules/msp-rates` returns HTTP 200 with all 12 crops.
2. Created Wheat booking → Verified `mspPerQuintal` = ₹2,585.
3. Created Soybean booking on schedule 1 → Verified `mspPerQuintal` = ₹5,708 (not overwritten by schedule's ₹2,425).
4. Created Moong booking on schedule 1 → Verified `mspPerQuintal` = ₹8,780.
5. Verified frontend build and client-side dynamic selection.

## 6. Result
**PASS**: The single source of truth governs all MSP operations. Universal hardcoded rates have been eliminated.

# Payment Calculation Fix Report

## 1. Problem Found
Government procurement payments were vulnerable to relying on schedule-based MSP rates (₹2,425) or outdated crop lookup tables. Additionally, `approxQuantity` (which is only the farmer's preliminary booking estimate) had the risk of being used for calculations even when physical crop weighing had occurred.

## 2. Root Cause
In `backend/controllers/paymentController.js`:
1. `resolveMsp` prioritized `schedule.mspPrice` over `booking.cropType`, causing Nashik schedule bookings to default to ₹2,425.
2. Outdated dictionary `MSP_LOOKUP` had stale prices (e.g. wheat: 2425, gram: 5440, rice: 2300).
3. The formula was not strictly isolated to `Actual Quantity × Applicable Crop MSP`.

## 3. Files Changed
- `backend/controllers/paymentController.js`: Replaced `MSP_LOOKUP` with centralized `mspConfig.js` integration. Strictly enforced payment calculation from physical `actualQuantity` and applicable crop MSP.
- `frontend/src/pages/admin/AdminDashboard.jsx`: Removed hardcoded `MSP_MAP`, updated payment recording modal to automatically preload the booking's `actualQuantity` and `mspPerQuintal`.

## 4. Fix Implemented
- Authoritative Backend Formula:
  $$\text{Final Government Payment} = \text{Actual Quantity (Quintals)} \times \text{Applicable Crop MSP}$$
- Calculation Example:
  - Weighed Actual Quantity: 28.5 Quintals
  - Wheat Government MSP: ₹2,585 / Quintal
  - Final Amount: $28.5 \times 2,585 = \text{₹}73,672.50$
- Backend ignores any untrusted `totalAmount` submitted by client and computes the total securely on the server.
- `approxQuantity` is preserved as historical reference only and is never used when `actualQuantity` is submitted.

## 5. Tests Performed
1. Tested admin payment endpoint with `actualQuantity = 28.5` and Wheat booking (`mspPerQuintal = 2585`):
   - Verified `payment.totalAmount` = ₹73,672.50.
   - Verified `booking.totalAmount` = ₹73,672.50.
   - Verified `booking.status` = `Paid`.
2. Verified zero or negative quantity inputs are rejected with HTTP 400.
3. Verified payment history isolation: farmers can only inspect their own financial transactions.

## 6. Result
**PASS**: Payment calculations strictly adhere to actual measured produce and official crop-wise MSP rates.

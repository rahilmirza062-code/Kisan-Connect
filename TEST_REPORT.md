# TEST REPORT & API INVENTORY — KISAN CONNECT

## Automated Test Execution Summary
- **Test Framework**: Jest v30 + Supertest v7
- **Test Suite Location**: `backend/tests/api.test.js`
- **Total Test Cases**: 28
- **Passed**: 28
- **Failed**: 0
- **Pass Rate**: **100%**
- **Execution Time**: ~2.5 seconds

---

## Complete API Inventory & Test Coverage

| API Endpoint | Method | Auth Required | Role Required | Valid Input | Invalid Input | Expected Status | Test Status |
|--------------|--------|---------------|---------------|-------------|---------------|-----------------|-------------|
| `/api/auth/me` | GET | Yes | Any | Bearer Token | Missing/Expired Token | 200 / 401 | 🟢 PASSED |
| `/api/auth/sync-profile` | POST | Yes | Any | `{ name, phone, district }` | Missing Token | 200 / 401 | 🟢 PASSED |
| `/api/schedules/centres` | GET | No | None | None | None | 200 | 🟢 PASSED |
| `/api/schedules/centres` | POST | Yes | Admin | `{ name, location, district }` | Missing Name / Farmer Token | 201 / 400 / 403 | 🟢 PASSED |
| `/api/schedules/centres/:id` | PUT | Yes | Admin | `{ contactPhone, mspPrice }` | Invalid ID / Farmer Token | 200 / 403 / 404 | 🟢 PASSED |
| `/api/schedules` | GET | No | None | `?centreId=pc_1&date=YYYY-MM-DD` | None | 200 | 🟢 PASSED |
| `/api/schedules` | POST | Yes | Admin | `{ centreId, date, startTime, capacity }` | Missing Details / Farmer Token | 201 / 400 / 403 | 🟢 PASSED |
| `/api/schedules/:id` | PUT | Yes | Admin | `{ capacity, status }` | Invalid ID / Farmer Token | 200 / 403 / 404 | 🟢 PASSED |
| `/api/bookings` | POST | Yes | Farmer | `{ scheduleId, cropType, approxQuantity }` | Duplicate Booking / Full Slot / Qty <= 0 | 201 / 400 | 🟢 PASSED |
| `/api/bookings/my-token` | GET | Yes | Farmer | Bearer Token | Missing Token / Admin Token | 200 / 401 | 🟢 PASSED |
| `/api/bookings/my-bookings` | GET | Yes | Farmer | Bearer Token | Missing Token | 200 / 401 | 🟢 PASSED |
| `/api/bookings/cancel/:id` | PATCH | Yes | Farmer / Admin | Booking ID | Non-cancellable Status / Other Farmer ID | 200 / 400 / 403 | 🟢 PASSED |
| `/api/queue/status` | GET | No | None | None | None | 200 | 🟢 PASSED |
| `/api/queue/admin/dashboard` | GET | Yes | Admin | Admin Bearer Token | Farmer Token | 200 / 403 | 🟢 PASSED |
| `/api/queue/admin/next-token` | POST | Yes | Admin | Admin Bearer Token | Farmer Token | 200 / 403 | 🟢 PASSED |
| `/api/queue/admin/update-status` | PATCH | Yes | Admin | `{ bookingId, status }` | Missing Params / Farmer Token | 200 / 400 / 403 | 🟢 PASSED |
| `/api/queue/admin/settings` | PUT | Yes | Admin | `{ averageProcessingTimeMinutes }` | String NaN / Farmer Token | 200 / 403 | 🟢 PASSED |
| `/api/payments/admin/record` | POST | Yes | Admin | `{ bookingId, actualQuantity, customMsp }` | Actual Qty <= 0 / Farmer Token | 200 / 400 / 403 | 🟢 PASSED |
| `/api/payments/history` | GET | Yes | Farmer | Farmer Bearer Token | Missing Token | 200 / 401 | 🟢 PASSED |
| `/api/payments/admin/all` | GET | Yes | Admin | Admin Bearer Token | Farmer Token | 200 / 403 | 🟢 PASSED |
| `/api/notifications` | GET | Yes | Any | Bearer Token | Missing Token | 200 / 401 | 🟢 PASSED |
| `/api/notifications/read/:id` | PATCH | Yes | Any | Notification ID | Invalid ID | 200 | 🟢 PASSED |

---

## Detailed Test Verification Coverage

### 1. Authentication & Security
- Verified profile resolution for both Farmer (`usr_f1`) and Admin (`usr_admin`).
- Verified HTTP 401 response for missing or malformed Authorization headers.
- Verified HTTP 403 Access Denied when a farmer account attempts to call `/api/queue/admin/dashboard`.

### 2. Procurement Centres & Schedules
- Verified public access to centre lists and schedule availability.
- Verified administrative creation and modification of centres and operating slots.
- Verified HTTP 400 validation errors on missing required fields.

### 3. Slot Booking & Duplicate Prevention
- Verified free booking reservation (returns `requiresPayment: false`).
- Verified backend enforcement of duplicate booking prevention (returns HTTP 400 `already have an active booking`).
- Verified full slot rejection (`bookedCount >= capacity`).
- Verified quantity input validation (`approxQuantity` must be > 0).

### 4. Digital Token & Data Isolation
- Verified sequential token generation (`KC-XXX`).
- Verified strict farmer data isolation on `/api/bookings/my-bookings` (Farmer A sees only Farmer A's records).

### 5. Queue Advancement & Status Transitions
- Verified `/api/queue/status` public polling endpoint.
- Verified `/api/queue/admin/next-token` auto-completing current token and setting next token to `Procurement In Progress`.

### 6. Government MSP Payments
- Verified backend calculation `totalAmount = actualQuantity × mspPerQuintal`.
- Verified validation for negative/zero actual weight inputs.
- Verified isolated farmer payment history retrieval on `/api/payments/history`.

### 7. Database Integrity
- Verified synchronous `getDb()` read and `saveDb()` write persistence in `store.json`.

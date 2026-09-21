# DATABASE STATUS & ARCHITECTURE — KISAN CONNECT

## Current Storage Implementation
The project currently utilizes a local file-based JSON data store located at:
`backend/data/store.json`

This store is managed by `backend/config/db.js` using synchronous file I/O operations (`fs.readFileSync` and `fs.writeFileSync`).

---

## Data Schema & Collections

### 1. `users`
- **Primary Key**: `id` (e.g. `usr_f1`, `usr_admin`)
- **Fields**: `name`, `phone`, `email`, `passwordHash`, `role` (`farmer` \| `admin`), `farmerId`, `district`, `language`, `createdAt`.
- **Pre-seeded Records**: 10 farmer accounts (`KC-F-8821` to `KC-F-8830`) and 1 procurement officer admin account (`ADMIN-01`).

### 2. `procurementCentres`
- **Primary Key**: `id` (e.g. `pc_1`)
- **Fields**: `name`, `location`, `district`, `contactPhone`, `cropType`, `mspPrice`, `status` (`Active` \| `Disabled`).

### 3. `schedules`
- **Primary Key**: `id` (e.g. `sch_1`)
- **Foreign Key**: `centreId` -> `procurementCentres.id`
- **Fields**: `centreName`, `date`, `startTime`, `endTime`, `capacity`, `bookedCount`, `cropType`, `mspPrice`, `status` (`Available` \| `Full` \| `Disabled`).

### 4. `bookings`
- **Primary Key**: `id` (e.g. `bk_104`)
- **Foreign Keys**: `farmerId` -> `users.id`, `scheduleId` -> `schedules.id`, `centreId` -> `procurementCentres.id`
- **Fields**: `farmerName`, `farmerPhone`, `date`, `timeSlot`, `cropType`, `approxQuantity`, `actualQuantity`, `mspPerQuintal`, `totalAmount`, `tokenNumber`, `queueNumber`, `status`, `paymentStatus`, `paymentId`, `createdAt`.

### 5. `payments`
- **Primary Key**: `id` (e.g. `PAY-104`)
- **Foreign Keys**: `bookingId` -> `bookings.id`, `farmerId` -> `users.id`
- **Fields**: `farmerName`, `centreId`, `centreName`, `cropType`, `approxQuantity`, `actualQuantity`, `mspPerQuintal`, `totalAmount`, `status` (`paid`), `paymentDate`, `transactionReference`, `paymentMethod`, `verifiedAt`.

### 6. `notifications`
- **Primary Key**: `id` (e.g. `ntf_1`)
- **Foreign Key**: `userId` -> `users.id`
- **Fields**: `title`, `message`, `type`, `read` (boolean), `createdAt`.

### 7. `settings`
- **Fields**: `averageProcessingTimeMinutes` (default 5), `currentTokenProcessed`, `lastTokenSeq`, `bookingFeeAmount` (default 50).

---

## Data Persistence & Safety
- **Persistence**: Data **persists across backend restarts** because `saveDb(db)` writes updated objects directly to `store.json`.
- **Cloud Sync**: `backend/config/db.js` includes background synchronization handlers (`seedFirestoreFromStore` and `saveDb` async Firestore hooks) that stream data to Cloud Firestore collections (`users`, `procurementCentres`, `schedules`, `bookings`, `payments`, `notifications`, `settings`) whenever `FIREBASE_PROJECT_ID` is present in `.env`.

---

## Current Status & Scaling Recommendations
- **Prototype Status**: `store.json` is 100% adequate and functional for college demonstration, single-server development, and prototype testing.
- **Production Scaling Requirements**: For multi-node cloud deployment (e.g. AWS Elastic Beanstalk or Kubernetes clusters with concurrent request loads), transition `backend/config/db.js` to direct database queries using:
  1. **Cloud Firestore** (NoSQL model matching current collections), OR
  2. **PostgreSQL / MongoDB** with an ORM (Prisma / Mongoose).

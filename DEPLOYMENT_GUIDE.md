# DEPLOYMENT GUIDE — KISAN CONNECT

This guide provides step-by-step instructions for deploying the Kisan Connect application to production.

---

## 1. Prerequisites
- Node.js v18+ and `npm` installed on host server.
- Firebase project created at [Firebase Console](https://console.firebase.google.com/).

---

## 2. Firebase Setup (Production Authentication)

### A. Enable Phone Authentication
1. Navigate to **Firebase Console -> Authentication -> Sign-in method**.
2. Select **Phone** and click **Enable**.
3. Under **Phone numbers for testing**, add test numbers if desired (e.g. `+91 9876543210` with test code `123456`).

### B. Generate Firebase Admin Service Account (Backend)
1. Go to **Project Settings -> Service accounts**.
2. Click **Generate new private key**.
3. Download the JSON key file. Extract `project_id`, `client_email`, and `private_key`.

---

## 3. Environment Configuration

### Backend Environment (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update values:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_production_secure_jwt_secret_2026

FIREBASE_PROJECT_ID=your-actual-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-actual-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_REAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### Frontend Environment (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env` and update values from Firebase Web App Config:
```env
VITE_FIREBASE_API_KEY=AIzaSyYourActualProductionApiKey
VITE_FIREBASE_AUTH_DOMAIN=your-actual-firebase-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-actual-firebase-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:yourwebappid
```

---

## 4. Building and Running

### Backend Deployment
```bash
cd backend
npm install --production
npm test   # Verify all 28 automated tests pass
npm start  # Runs node server.js on port 5000
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build   # Generates production assets in frontend/dist
```

Serve `frontend/dist` using Nginx, Caddy, Vercel, Netlify, or static server.

---

## 5. Production Checks & Verification

- [x] Run `npm test` in `backend/` to verify 28/28 tests pass.
- [x] Run `npm run build` in `frontend/` to verify 0 build errors.
- [x] Confirm `NODE_ENV=production` is set in backend environment so stack traces are hidden.
- [x] Test Farmer Login via SMS OTP / Quick Sandbox Login.
- [x] Test Admin Login via Officer One-Click Login or Admin SMS OTP.
- [x] Verify slot booking, token issuance, queue advancement, crop weighing, and MSP payment ledger recording.

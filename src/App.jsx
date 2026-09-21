import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { QueueProvider } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLogin } from './pages/AdminLogin';

import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { Schedules } from './pages/farmer/Schedules';
import { BookSlot } from './pages/farmer/BookSlot';
import { BookingSummary } from './pages/farmer/BookingSummary';
import { PaymentSuccess } from './pages/farmer/PaymentSuccess';
import { PaymentFailed } from './pages/farmer/PaymentFailed';
import { PaymentHistory } from './pages/farmer/PaymentHistory';
import { MyToken } from './pages/farmer/MyToken';
import { QueueStatus } from './pages/farmer/QueueStatus';
import { ProcurementStatus } from './pages/farmer/ProcurementStatus';
import { Notifications } from './pages/farmer/Notifications';
import { Receipt } from './pages/farmer/Receipt';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageSchedules } from './pages/admin/ManageSchedules';
import { ManageQueue } from './pages/admin/ManageQueue';
import { AssistedBooking } from './pages/admin/AssistedBooking';
import { AdminSettings } from './pages/admin/AdminSettings';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <QueueProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public & Auth Routes */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Farmer Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <FarmerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedules"
                    element={
                      <ProtectedRoute>
                        <Schedules />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book-slot"
                    element={
                      <ProtectedRoute>
                        <BookSlot />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-checkout/:bookingId"
                    element={
                      <ProtectedRoute>
                        <BookingSummary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-success"
                    element={
                      <ProtectedRoute>
                        <PaymentSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-failed"
                    element={
                      <ProtectedRoute>
                        <PaymentFailed />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-history"
                    element={
                      <ProtectedRoute>
                        <PaymentHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-token"
                    element={
                      <ProtectedRoute>
                        <MyToken />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/queue-status"
                    element={
                      <ProtectedRoute>
                        <QueueStatus />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement-status"
                    element={
                      <ProtectedRoute>
                        <ProcurementStatus />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/receipt/:bookingId"
                    element={
                      <ProtectedRoute>
                        <Receipt />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/schedules"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ManageSchedules />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/queue"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ManageQueue />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/assisted-booking"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AssistedBooking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<RootRedirect />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </QueueProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

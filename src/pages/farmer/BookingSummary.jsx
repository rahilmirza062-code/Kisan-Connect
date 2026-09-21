import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { Ticket, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Clock, MapPin, Wheat, Scale, RefreshCw, TrendingUp, XCircle, AlertTriangle } from 'lucide-react';

export const BookingSummary = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { refreshAll } = useQueue();
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (!booking && bookingId) {
      setLoading(true);
      fetch('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const found = data.bookings.find((b) => b.id === bookingId);
            if (found) setBooking(found);
            else setError('Booking details not found.');
          }
        })
        .catch(() => setError('Error loading booking summary.'))
        .finally(() => setLoading(false));
    }
  }, [bookingId, token, booking]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/bookings/cancel/${booking.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBooking({ ...booking, status: 'Cancelled' });
        setCancelMessage('✓ Booking cancelled successfully. Slot has been released.');
        refreshAll();
        setTimeout(() => {
          setShowCancelModal(false);
          setCancelMessage('');
        }, 1500);
      } else {
        setCancelError(data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setCancelError('Network error cancelling booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold">Loading Procurement Booking Details...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-rose-50 text-rose-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-600" />
        <p className="text-sm font-bold">{error}</p>
        <button onClick={() => navigate('/schedules')} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
          Back to Schedules
        </button>
      </div>
    );
  }

  const isCancellable = booking && ['Booking Confirmed', 'Waiting', 'BOOKED', 'Pending Payment'].includes(booking.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Booking Confirmed — No Fee Required
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('payment.summary_title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your slot is reserved. Proceed to the procurement centre with your digital token for crop weighing and MSP calculation.
        </p>
      </div>

      {/* Demo Payment Notice Banner */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-300 text-xs font-extrabold shadow-xs">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <span className="block text-sm font-black">Government Payment — Demo Mode</span>
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
            This project records procurement payments for demonstration purposes. No real government funds are transferred.
          </span>
        </div>
      </div>

      {/* Confirmed Booking Summary Box */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Booking Summary</h2>
            <span className="text-xs font-mono text-slate-400">Booking ID: {booking.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
              booking.status === 'Cancelled'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {booking.status === 'Cancelled' ? '✕ Cancelled' : '✓ Slot Reserved'}
            </span>
          </div>
        </div>

        {/* Digital Token & Queue Highlight */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block">Digital Token Issued</span>
            <span className="text-4xl font-black font-mono text-amber-300">{booking.tokenNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block">Current Status</span>
            <span className="text-base font-extrabold text-white">{booking.status || 'Booking Confirmed'}</span>
          </div>
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Farmer Name:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.farmerName}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Procurement Centre:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{booking.centreName}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Schedule Date:</span>
            <span className="text-xs font-bold text-emerald-600">{booking.date}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Time Slot:</span>
            <span className="text-xs font-bold text-emerald-600">{booking.timeSlot}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Crop Type:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.cropType}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Approx Quantity:</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              {booking.approxQuantity ? `${booking.approxQuantity} Quintals` : booking.quantity}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            to="/my-token"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" /> View My Digital Token
          </Link>

          <Link
            to="/procurement-status"
            className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Track Live Queue Status
          </Link>

          {isCancellable && (
            <button
              onClick={() => {
                setCancelError('');
                setCancelMessage('');
                setShowCancelModal(true);
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel Booking
            </button>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cancel Booking?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel this booking?
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl text-center">
                {cancelError}
              </div>
            )}

            {cancelMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                {cancelMessage}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl space-y-1 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Token Number:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{booking?.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Centre:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking?.centreName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

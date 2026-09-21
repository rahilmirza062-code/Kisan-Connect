import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { TokenCard } from '../../components/TokenCard';
import { Ticket, PlusCircle, ArrowLeft, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';

export const MyToken = () => {
  const { t } = useLanguage();
  const { token: authToken } = useAuth();
  const { myTokenData, loading, refreshAll } = useQueue();
  const location = useLocation();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelError, setCancelError] = useState('');

  const rawToken = myTokenData?.token || location.state?.newBooking || null;
  const token = rawToken && rawToken.status !== 'Cancelled' ? rawToken : null;

  const handleCancelClick = () => {
    setCancelError('');
    setCancelMessage('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!token) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/bookings/cancel/${token.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-semibold">
            <Ticket className="w-4 h-4 text-blue-600" />
            Official Pass
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('nav.my_token')}
          </h1>
        </div>

        <button
          onClick={refreshAll}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {token ? (
        <div className="space-y-6">
          <TokenCard token={token} isPrintable={true} onCancelBooking={handleCancelClick} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4 max-w-md mx-auto">
          <Ticket className="w-16 h-16 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('dashboard.no_token')}
          </h3>
          <p className="text-xs text-slate-500">
            You do not have any active procurement token right now.
          </p>
          <Link
            to="/book-slot"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4" /> Book New Slot
          </Link>
        </div>
      )}

      {/* Booking Cancellation Modal */}
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
                <span className="font-bold text-slate-900 dark:text-white font-mono">{token?.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Centre:</span>
                <span className="font-bold text-slate-900 dark:text-white">{token?.centreName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="font-bold text-emerald-600">{token?.date} ({token?.timeSlot})</span>
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

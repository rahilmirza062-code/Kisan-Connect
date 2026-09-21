import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { Users, Play, CheckCircle2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

export const ManageQueue = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { queueStatus, refreshAll } = useQueue();

  const [callingNext, setCallingNext] = useState(false);
  const [message, setMessage] = useState('');

  const currentToken = queueStatus?.currentTokenProcessed || 'KC-097';
  const activeTokens = queueStatus?.allActiveTokens || [];

  const handleCallNext = async () => {
    setCallingNext(true);
    setMessage('');
    try {
      const res = await fetch('/api/queue/admin/next-token', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Success: Called Next Token (${data.currentTokenProcessed}).`);
        refreshAll();
      } else {
        setMessage(data.message || 'Failed to call next token.');
      }
    } catch (err) {
      setMessage('Error calling next token.');
    } finally {
      setCallingNext(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch('/api/queue/admin/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-semibold">
          <Users className="w-4 h-4 text-purple-600" />
          Real-Time Queue Flow Control
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('nav.manage_queue')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Advance the queue sequence, update individual token statuses, and notify farmers instantly.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl">
          {message}
        </div>
      )}

      {/* Controller Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
            Current Token Under Process
          </span>
          <h2 className="text-5xl font-black text-amber-300 font-mono tracking-wider">
            {currentToken}
          </h2>
          <p className="text-xs text-slate-300">
            Clicking "Call Next Token" auto-completes the current token and alerts the next waiting farmer.
          </p>
        </div>

        <button
          onClick={handleCallNext}
          disabled={callingNext}
          className="px-8 py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-extrabold text-base rounded-2xl shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-slate-900" />
          {callingNext ? 'Advancing...' : t('admin.call_next_btn')}
        </button>
      </div>

      {/* Active Tokens List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Active Waiting Queue Tokens ({activeTokens.length})
        </h3>

        <div className="space-y-3">
          {activeTokens.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No active waiting tokens.</p>
          ) : (
            activeTokens.map((tItem) => (
              <div
                key={tItem.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                      {tItem.tokenNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {tItem.farmerName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tItem.cropType} ({tItem.quantity}) • {tItem.timeSlot}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={tItem.status}
                    onChange={(e) => handleStatusChange(tItem.id, e.target.value)}
                    className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Booking Confirmed">Booking Confirmed</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Your Turn Soon">Your Turn Soon</option>
                    <option value="Procurement In Progress">Procurement In Progress</option>
                    <option value="Weighed">Weighed</option>
                    <option value="Payment Processed">Payment Processed</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

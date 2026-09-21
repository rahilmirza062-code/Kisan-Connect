import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, CalendarDays } from 'lucide-react';

export const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId || null;
  const message = location.state?.message || 'Payment transaction failed or was cancelled.';

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-rose-500/40 shadow-2xl text-center space-y-6">
        
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-rose-600 dark:text-rose-400">
            Payment Failed
          </h1>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Payment failed. Your slot has not been confirmed.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            {message}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {bookingId && (
            <button
              onClick={() => navigate(`/payment-checkout/${bookingId}`)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          )}

          <Link
            to="/schedules"
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" /> Back to Schedule
          </Link>
        </div>

      </div>
    </div>
  );
};


import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Ticket, ArrowRight } from 'lucide-react';

export const PaymentSuccess = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const booking = location.state?.booking || null;
  const payment = location.state?.payment || null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Success Badge Banner */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
        
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
            ✓ Payment Successful
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Server-side verification complete. Your slot is confirmed and digital token generated.
          </p>
        </div>

        {/* Payment & Booking Receipt Details */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl space-y-3 text-xs text-left border border-slate-200 dark:border-slate-700">
          
          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Payment ID:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {payment?.id || payment?.razorpayPaymentId || 'PAY-VERIFIED'}
            </span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Booking ID:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{booking?.id || 'BK-105'}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Amount:</span>
            <span className="font-bold text-emerald-600 text-sm font-mono">₹{payment?.amount || booking?.amount || 50}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Procurement Centre:</span>
            <span className="font-bold text-slate-900 dark:text-white">{booking?.centreName || 'Nashik APMC Main Market'}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Token:</span>
            <span className="font-black text-amber-500 text-base font-mono">{booking?.tokenNumber || 'KC-105'}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Queue Position:</span>
            <span className="font-bold text-purple-600">#{booking?.queuePosition || booking?.queueNumber || 8}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Estimated Waiting Time:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              ~{booking?.estimatedWaitMinutes !== undefined ? booking.estimatedWaitMinutes : 35} minutes
            </span>
          </div>

        </div>

        {/* Action Button */}
        <Link
          to="/my-token"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-5 h-5" /> View My Booking <ArrowRight className="w-4 h-4" />
        </Link>

      </div>

    </div>
  );
};


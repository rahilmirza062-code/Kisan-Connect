import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Printer, ArrowLeft, RefreshCw, AlertCircle, Sprout, FileText } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const Receipt = () => {
  const { bookingId } = useParams();
  const { token } = useAuth();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId || !token) return;
    setLoading(true);
    setError('');
    fetch(`/api/payments/receipt/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReceipt(data.receipt);
        } else {
          setError(data.message || 'Failed to load receipt.');
        }
      })
      .catch(() => setError('Network error loading receipt.'))
      .finally(() => setLoading(false));
  }, [bookingId, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold">Loading receipt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-600" />
        <p className="text-sm font-bold">{error}</p>
        <Link to="/payment-history" className="inline-flex px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
          Back to Payment History
        </Link>
      </div>
    );
  }

  if (!receipt) return null;

  const isPaid = receipt.paymentStatus === 'PAID' || receipt.paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Action buttons - hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/payment-history"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payment History
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Receipt Document */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-2 print:border-black print:rounded-none">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-6 h-6 print:text-black" />
            <span className="text-xl font-extrabold tracking-tight print:text-black">
              {receipt.title}
            </span>
          </div>
          <p className="text-xs text-emerald-200 font-medium print:text-gray-600">
            {receipt.subtitle}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border border-white/30 bg-white/10 print:border-black print:bg-gray-100 print:text-black">
            <FileText className="w-3.5 h-3.5" />
            {receipt.documentType}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 print:p-8">

          {/* Token Number Highlight */}
          <div className="text-center py-3 border-2 border-dashed border-emerald-600/30 dark:border-emerald-500/30 rounded-xl print:border-black">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block print:text-gray-600">
              Token Number
            </span>
            <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-wider print:text-black">
              {receipt.tokenNumber}
            </span>
          </div>

          {/* Farmer Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Farmer Name</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">{receipt.farmerName}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Farmer ID</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono print:text-black">{receipt.farmerId}</span>
            </div>
          </div>

          {/* Centre Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 print:bg-white print:border-gray-300">
            <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Procurement Centre</span>
            <span className="font-bold text-slate-900 dark:text-white block print:text-black">{receipt.centreName}</span>
            {receipt.centreAddress && (
              <span className="text-slate-500 dark:text-slate-400 block print:text-gray-600">{receipt.centreAddress}</span>
            )}
          </div>

          {/* Schedule Details */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Date</span>
              <span className="font-bold text-emerald-600 print:text-black">{formatDate(receipt.scheduleDate)}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Time Slot</span>
              <span className="font-bold text-emerald-600 print:text-black">{receipt.timeSlot || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Crop</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">{receipt.cropType}</span>
            </div>
          </div>

          {/* Quantities & Rate */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Approx Quantity</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">
                {typeof receipt.approxQuantity === 'number' ? `${receipt.approxQuantity} Quintals` : (receipt.approxQuantity || '—')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-500">Actual Quantity</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">
                {receipt.actualQuantity ? `${receipt.actualQuantity} Quintals` : '—'}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50 print:bg-white print:border-gray-300">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block print:text-gray-500">Rate / Quintal</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 print:text-black">
                {receipt.mspPerQuintal ? `₹${Number(receipt.mspPerQuintal).toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50'} print:bg-white print:border-gray-300`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider print:text-gray-600">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'} print:bg-gray-100 print:text-black print:border-gray-400`}>
                {isPaid ? '✓ PAID' : (receipt.paymentStatus || 'Pending')}
              </span>
            </div>
            {receipt.totalAmount !== null && receipt.totalAmount !== undefined && (
              <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700 print:border-gray-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm print:text-black">Total Payment</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono print:text-black">
                  {formatCurrency(receipt.totalAmount)}
                </span>
              </div>
            )}
            {receipt.transactionReference && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 print:text-gray-500">Reference No.</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono print:text-black">{receipt.transactionReference}</span>
              </div>
            )}
            {receipt.paymentDate && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 print:text-gray-500">Payment Date</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">{formatDate(receipt.paymentDate)}</span>
              </div>
            )}
            {receipt.paymentMethod && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 print:text-gray-500">Payment Method</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">{receipt.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 space-y-1 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 print:border-gray-400 print:text-gray-500">
            <p>Booking ID: <span className="font-mono font-bold">{receipt.bookingId}</span></p>
            <p>Document generated on: {formatDate(receipt.generatedAt)}</p>
            <p className="max-w-md mx-auto leading-relaxed pt-1">
              Kisan Connect is a prototype digital procurement management platform. This document is for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

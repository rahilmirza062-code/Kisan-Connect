import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, CheckCircle2, Clock, XCircle, RefreshCw, Scale, IndianRupee, FileText, Landmark, AlertCircle, Download } from 'lucide-react';

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
  if (amount === null || amount === undefined || amount === 0) return '₹0.00';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'paid') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
        ✓ PAID
      </span>
    );
  }
  if (normalized === 'pending' || normalized === 'pending_procurement') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
        ◷ Pending
      </span>
    );
  }
  if (normalized === 'failed') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
        ✕ Failed
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
      {status || 'Unknown'}
    </span>
  );
};

export const PaymentHistory = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = () => {
    setLoading(true);
    setError('');
    fetch('/api/payments/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setPayments(data.payments);
        } else {
          setError(data.message || 'Failed to load payment history.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to connect to the server. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [token]);

  // Summary Metrics Calculations
  const totalPaymentsCount = payments.length;
  const totalQuantitySold = payments.reduce((acc, p) => acc + (parseFloat(p.actualQuantity) || parseFloat(p.approxQuantity) || 0), 0);
  const totalAmountReceived = payments.reduce((acc, p) => acc + (parseFloat(p.totalAmount) || parseFloat(p.amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Landmark className="w-4 h-4 text-emerald-600" />
            Government MSP Procurement Financial Records
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('payment.history_title')}
          </h1>
        </div>

        <button
          onClick={loadHistory}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs flex items-center gap-2 text-xs font-bold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span>{error}</span>
            <button onClick={loadHistory} className="ml-3 underline text-xs font-bold text-rose-700 hover:text-rose-900">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading payment records...</p>
        </div>
      )}

      {/* Content (only when not loading) */}
      {!loading && !error && (
        <>
          {/* Top Financial Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Payments</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalPaymentsCount}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">Total Quantity Sold</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">{totalQuantitySold.toFixed(2)} Quintals</span>
            </div>

            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] text-emerald-200 font-extrabold uppercase tracking-wider block">Total Amount Received</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{formatCurrency(totalAmountReceived)}</span>
            </div>
          </div>

          {/* Payment Records List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden p-6 space-y-4">
            {payments.length === 0 ? (
              <div className="py-12 text-center space-y-3 max-w-md mx-auto">
                <Landmark className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  No government payments recorded yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your payment will appear here after your crop is procured at the APMC centre and the payment is recorded by the procurement officer.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:border-emerald-500 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Transaction Reference</span>
                        <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {p.transactionReference || `KC-PAY-${p.id}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={p.paymentStatus || p.status} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Crop Type</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{p.cropType}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {p.actualQuantity ? (
                            <>
                              {p.actualQuantity} Qtl
                              {p.approxQuantity && typeof p.approxQuantity === 'number' && (
                                <span className="text-slate-400 font-normal ml-1">(approx: {p.approxQuantity})</span>
                              )}
                            </>
                          ) : (
                            typeof p.approxQuantity === 'number' ? `~${p.approxQuantity} Qtl` : (p.approxQuantity || '—')
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Rate / Quintal</span>
                        <span className="font-extrabold text-emerald-600">
                          {p.mspPerQuintal ? `₹${Number(p.mspPerQuintal).toLocaleString('en-IN')} / Qtl` : '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Date</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(p.date)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs gap-2">
                      <div className="text-slate-500 font-medium space-y-0.5">
                        <div>
                          Centre: <strong className="text-slate-800 dark:text-slate-200">{p.centreName}</strong>
                          {p.centreAddress && (
                            <span className="text-slate-400 ml-1">— {p.centreAddress}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.paymentMethod || 'Government Direct Benefit Transfer (Demo)'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Payment</span>
                          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                            {formatCurrency(p.totalAmount || p.amount)}
                          </span>
                        </div>
                        {p.bookingId && (
                          <Link
                            to={`/receipt/${p.bookingId}`}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all"
                            title="View Receipt"
                          >
                            <Download className="w-3 h-3" /> Receipt
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

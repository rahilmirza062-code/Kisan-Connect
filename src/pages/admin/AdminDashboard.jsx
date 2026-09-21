import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import {
  Users,
  CalendarDays,
  Ticket,
  CheckCircle2,
  Clock,
  Play,
  Search,
  Filter,
  UserPlus,
  Settings,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CreditCard,
  IndianRupee,
  DollarSign,
  Scale,
  Landmark,
  XCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { refreshAll } = useQueue();

  const [statsData, setStatsData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [paymentsData, setPaymentsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [callingNext, setCallingNext] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin Record Payment Modal State
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [actualQuantity, setActualQuantity] = useState('');
  const [customMsp, setCustomMsp] = useState('');
  const [mspRatesList, setMspRatesList] = useState([]);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const getMsp = (cropType) => {
    if (!cropType) return 2585;
    const lower = cropType.toLowerCase();
    const found = mspRatesList.find(
      (c) =>
        c.name.toLowerCase() === lower ||
        c.id.toLowerCase() === lower ||
        (c.bilingualLabel && c.bilingualLabel.toLowerCase().includes(lower)) ||
        lower.includes(c.name.toLowerCase())
    );
    return found ? found.mspPrice : 2585;
  };

  const loadData = () => {
    setLoading(true);
    fetch('/api/queue/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatsData(data.stats);
          setBookings(data.recentBookings);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/payments/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentsData(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetch('/api/schedules/msp-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMspRatesList(data.rates);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await fetch('/api/queue/admin/next-token', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadData();
        refreshAll();
      }
    } catch (err) {
      console.error(err);
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
        loadData();
        refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openRecordPaymentModal = (b) => {
    setSelectedBookingForPayment(b);
    const initialQty = b.actualQuantity || b.approxQuantity || parseFloat(b.quantity) || 20;
    setActualQuantity(initialQty.toString());
    const msp = b.mspPerQuintal || getMsp(b.cropType);
    setCustomMsp(msp.toString());
    setPaymentError('');
    setPaymentMessage('');
  };

  const handleRecordPaymentSubmit = async () => {
    if (!selectedBookingForPayment) return;
    const qty = parseFloat(actualQuantity);
    if (isNaN(qty) || qty <= 0) {
      setPaymentError('Please enter a valid actual quantity in Quintals (greater than 0).');
      return;
    }

    setPaymentSubmitting(true);
    setPaymentError('');
    setPaymentMessage('');

    try {
      const res = await fetch('/api/payments/admin/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBookingForPayment.id,
          actualQuantity: qty,
          customMsp: parseFloat(customMsp)
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentMessage('✓ Government payment recorded successfully!');
        loadData();
        refreshAll();
        setTimeout(() => {
          setSelectedBookingForPayment(null);
        }, 1500);
      } else {
        setPaymentError(data.message || 'Failed to record payment.');
      }
    } catch (err) {
      setPaymentError('Connection error recording payment.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.farmerName || 'Farmer').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tokenNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.farmerPhone && String(b.farmerPhone).includes(searchQuery));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allPayments = Array.isArray(paymentsData?.payments) ? paymentsData.payments : [];
  const filteredPayments = allPayments.filter((p) => {
    if (paymentFilter === 'ALL') return true;
    return p.status === paymentFilter;
  });

  const stats = statsData || {
    totalFarmers: 0,
    todaysBookingsCount: 0,
    activeTokensCount: 0,
    completedCount: 0,
    totalCentresCount: 0,
    currentTokenProcessed: 'KC-097',
    averageProcessingTimeMinutes: 5
  };

  const pStats = paymentsData?.stats || {
    totalPaymentsCount: 0,
    todaysPaymentsCount: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Procurement Officer & Government Payment Management
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">
            {t('nav.admin_dashboard')}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Control digital queue progression, record actual crop weight, compute MSP payments, and assist farmers.
          </p>
        </div>

        {/* Live Call Next Token Action Box */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">Processing Now</span>
            <p className="text-3xl font-black text-white font-mono">{stats.currentTokenProcessed}</p>
          </div>
          <button
            onClick={handleCallNext}
            disabled={callingNext}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            {callingNext ? 'Calling...' : t('admin.call_next_btn')}
          </button>
        </div>
      </div>

      {/* Queue & Centre Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">{t('admin.total_farmers')}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalFarmers}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">{t('admin.todays_bookings')}</span>
            <CalendarDays className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.todaysBookingsCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">{t('admin.active_tokens')}</span>
            <Ticket className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.activeTokensCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">{t('admin.completed')}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Centres</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.totalCentresCount}</p>
        </div>
      </div>

      {/* Payment Overview Section */}
      <div className="bg-gradient-to-br from-emerald-900/10 via-emerald-950/5 to-transparent bg-white dark:bg-slate-800 p-6 rounded-3xl border border-emerald-500/30 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Government Procurement Payment Ledger
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>Filter Status:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Payment Summary Stats Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block uppercase text-[10px]">Total Government Payments</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {pStats.totalPaymentsCount || 0}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block uppercase text-[10px]">Completed Payments</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {pStats.paidCount || 0}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block uppercase text-[10px]">Today's Recorded Payments</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {pStats.todaysPaymentsCount || 0}
            </span>
          </div>

          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-md">
            <span className="text-emerald-200 block uppercase text-[10px]">Total MSP Funds Transferred</span>
            <span className="text-2xl font-black text-amber-300 font-mono">
              ₹{(pStats.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Booking / Token</th>
                <th className="py-3 px-4">Crop & Weight</th>
                <th className="py-3 px-4">MSP Rate</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                    No procurement financial records available yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id || p.transactionReference || Math.random()} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {p.farmerName || 'Farmer'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {p.bookingId || 'N/A'} ({p.tokenNumber || 'N/A'})
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {p.cropType || 'Crop'} • <strong className="text-emerald-600">{p.actualQuantity ? `${p.actualQuantity} Qtl` : (p.approxQuantity || '-')}</strong>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      ₹{p.mspPerQuintal || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{Number(p.totalAmount || p.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {p.transactionReference || `KC-PAY-${p.id}`}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        ✓ PAID
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Procurement Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Live Queue & Crop Procurement Management
            </h2>
            <p className="text-xs text-slate-500">
              Filter by name or token number. Enter actual weighed crop quantity to record MSP payments directly to farmers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmer or token..."
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Booking Confirmed">Booking Confirmed</option>
                <option value="Waiting">Waiting</option>
                <option value="Your Turn Soon">Your Turn Soon</option>
                <option value="Procurement In Progress">In Progress</option>
                <option value="Paid">Paid / Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop & Approx Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Record Payment Action</th>
                <th className="py-3 px-4 text-right">Update Queue Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id || b.tokenNumber || Math.random()} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3.5 px-4 font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                      {b.tokenNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {b.farmerName || 'Farmer'}
                      <span className="block text-[10px] text-slate-400 font-normal">{b.farmerPhone || 'App User'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {b.cropType} ({b.approxQuantity ? `${b.approxQuantity} Qtl` : b.quantity})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'Paid' || b.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.status === 'Procurement In Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                            : b.status === 'Your Turn Soon'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openRecordPaymentModal(b)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Landmark className="w-3.5 h-3.5" /> Record Payment
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="py-1.5 px-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Booking Confirmed">Booking Confirmed</option>
                        <option value="Waiting">Waiting</option>
                        <option value="Your Turn Soon">Your Turn Soon</option>
                        <option value="Procurement In Progress">Procurement In Progress</option>
                        <option value="Paid">Paid</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Government Payment Modal */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/40 space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Record Government Payment
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl text-center">
                {paymentError}
              </div>
            )}

            {paymentMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                {paymentMessage}
              </div>
            )}

            {/* Booking Reference Box */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Farmer Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingForPayment.farmerName}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Token Number:</span>
                <span className="font-mono font-bold text-emerald-600">{selectedBookingForPayment.tokenNumber}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Crop Type:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingForPayment.cropType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Approx Quantity:</span>
                <span className="font-bold text-amber-600">
                  {selectedBookingForPayment.approxQuantity ? `${selectedBookingForPayment.approxQuantity} Quintals` : selectedBookingForPayment.quantity}
                </span>
              </div>
            </div>

            {/* Weight & MSP Entry Form */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Enter Weighed Actual Quantity (Quintals)
                </label>
                <div className="relative">
                  <Scale className="w-5 h-5 absolute left-3 top-3 text-emerald-600 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    placeholder="e.g. 18.75"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Applicable Government MSP Rate (₹ / Quintal)
                </label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 absolute left-3 top-3 text-amber-600 pointer-events-none" />
                  <input
                    type="number"
                    value={customMsp}
                    onChange={(e) => setCustomMsp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Formula & Total Calculation Preview */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-300 block">
                Automatic MSP Calculation Formula
              </span>
              <p className="text-xs font-medium text-emerald-100">
                {parseFloat(actualQuantity) || 0} Quintals × ₹{parseFloat(customMsp) || 0} / Qtl
              </p>
              <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200">Total Calculated Payment:</span>
                <span className="text-3xl font-black text-amber-300 font-mono">
                  ₹{((parseFloat(actualQuantity) || 0) * (parseFloat(customMsp) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedBookingForPayment(null)}
                className="w-1/2 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paymentSubmitting}
                onClick={handleRecordPaymentSubmit}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1"
              >
                {paymentSubmitting ? 'Recording...' : 'Confirm & Record Payment'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

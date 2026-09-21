import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import {
  CalendarDays,
  PlusCircle,
  Ticket,
  Users,
  TrendingUp,
  Bell,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { user, token: authToken } = useAuth();
  const { t } = useLanguage();
  const { myTokenData, queueStatus, loading, refreshAll } = useQueue();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelError, setCancelError] = useState('');

  const rawToken = myTokenData?.token || (myTokenData?.hasActiveBooking ? myTokenData.token : null);
  const activeToken = rawToken && rawToken.status !== 'Cancelled' ? rawToken : null;
  const isCancellable = activeToken && ['Booking Confirmed', 'Waiting', 'BOOKED', 'Pending Payment'].includes(activeToken.status);

  const handleConfirmCancel = async () => {
    if (!activeToken) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/bookings/cancel/${activeToken.id}`, {
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

  const quickActions = [
    {
      title: t('nav.schedule'),
      desc: 'Check center availability & time slots',
      path: '/schedules',
      icon: CalendarDays,
      color: 'from-emerald-500 to-teal-700',
      badge: 'Available Slots'
    },
    {
      title: t('nav.book_slot'),
      desc: 'Book your hassle-free visit slot',
      path: '/book-slot',
      icon: PlusCircle,
      color: 'from-amber-500 to-orange-600',
      badge: 'Quick Book'
    },
    {
      title: t('nav.my_token'),
      desc: 'View & print your digital entry ticket',
      path: '/my-token',
      icon: Ticket,
      color: 'from-blue-600 to-indigo-700',
      badge: activeToken ? activeToken.tokenNumber : 'No Token'
    },
    {
      title: t('nav.queue_status'),
      desc: 'Track live queue & wait time calculation',
      path: '/queue-status',
      icon: Users,
      color: 'from-purple-600 to-pink-700',
      badge: queueStatus?.currentTokenProcessed ? `Now: ${queueStatus.currentTokenProcessed}` : 'Live'
    },
    {
      title: t('nav.procurement_status'),
      desc: 'Monitor real-time procurement progress',
      path: '/procurement-status',
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-800',
      badge: activeToken ? activeToken.status : 'Timeline'
    },
    {
      title: t('nav.notifications'),
      desc: 'View alert updates from center admins',
      path: '/notifications',
      icon: Bell,
      color: 'from-rose-500 to-red-700',
      badge: 'Updates'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/30 text-xs font-semibold text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Farmer Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('dashboard.welcome')}, <span className="text-amber-300">{user?.name}</span>! 👋
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl">
              {t('app_tagline')}. Book procurement slots, track live queue positions, and avoid waiting lines.
            </p>
          </div>

          {/* Farmer Details Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-wrap gap-4 text-xs font-medium">
            <div>
              <span className="block text-emerald-300 text-[10px] uppercase font-bold">{t('dashboard.farmer_id')}</span>
              <span className="text-base font-bold text-white font-mono">{user?.farmerId}</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <span className="block text-emerald-300 text-[10px] uppercase font-bold">{t('dashboard.centre')}</span>
              <span className="text-sm font-semibold text-white truncate max-w-[150px] block">
                {user?.district || 'Nashik'} APMC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Token Highlight Card */}
      {activeToken ? (
        <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-emerald-600/30 dark:border-emerald-500/40 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t('dashboard.current_token_card')}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
              {activeToken.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{t('dashboard.token_number')}</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {activeToken.tokenNumber}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{t('dashboard.queue_position')}</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                #{activeToken.queuePosition || 1}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{t('dashboard.farmers_ahead')}</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {activeToken.farmersAhead || 0}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{t('dashboard.estimated_wait')}</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ~{activeToken.estimatedWaitMinutes || 0}m
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{activeToken.centreName}</span>
              <span>•</span>
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{activeToken.timeSlot}</span>
            </div>

            <div className="flex gap-2">
              <Link
                to="/my-token"
                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                View Ticket <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/queue-status"
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                Live Queue
              </Link>
              {isCancellable && (
                <button
                  onClick={() => {
                    setCancelError('');
                    setCancelMessage('');
                    setShowCancelModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-600" />
              {t('dashboard.no_token')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an available time slot at your local APMC centre to generate your digital entry token.
            </p>
          </div>
          <Link
            to="/book-slot"
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            {t('dashboard.book_now_btn')}
          </Link>
        </div>
      )}

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
                <span className="font-bold text-slate-900 dark:text-white font-mono">{activeToken?.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Centre:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeToken?.centreName}</span>
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

      {/* Quick Action Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {t('dashboard.quick_actions')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.path}
                className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {action.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Now</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

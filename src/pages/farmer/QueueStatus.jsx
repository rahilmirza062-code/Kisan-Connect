import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { Users, Clock, ArrowRight, Activity, Info, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

export const QueueStatus = () => {
  const { t } = useLanguage();
  const { queueStatus, myTokenData, loading, refreshAll } = useQueue();

  const activeToken = myTokenData?.token && myTokenData.token.status !== 'Cancelled' ? myTokenData.token : null;

  const currentToken = queueStatus?.currentTokenProcessed || 'None';
  const hasQueueData = Boolean(activeToken && activeToken.queuePosition !== undefined);
  const userToken = activeToken?.tokenNumber || 'No Active Token';
  const farmersAhead = hasQueueData ? activeToken.farmersAhead : null;
  const queuePos = hasQueueData ? activeToken.queuePosition : null;
  const avgTime = queueStatus?.averageProcessingTimeMinutes || 5;
  const estimatedWait = hasQueueData ? (farmersAhead * avgTime) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-semibold">
            <Users className="w-4 h-4 text-purple-600" />
            {t('queue.live_status')}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('nav.queue_status')}
          </h1>
        </div>

        <button
          onClick={refreshAll}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Live Sync</span>
        </button>
      </div>

      {/* Main Queue Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Currently Being Processed */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase">
              Now at Counter
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-emerald-200 font-medium">Processing Token</span>
            <h2 className="text-5xl font-black text-amber-300 font-mono tracking-wider">
              {currentToken}
            </h2>
            <p className="text-xs text-emerald-100/90 pt-1">
              Farmer: {queueStatus?.currentFarmerName || 'Processing'}
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-700/60 text-[11px] text-emerald-200">
            Total active farmers waiting: <span className="font-bold text-white">{queueStatus?.totalWaitingCount ?? 0}</span>
          </div>
        </div>

        {/* Farmer's Token Position */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-purple-500/30 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 tracking-wider uppercase">
              Your Booking
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
              hasQueueData
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {hasQueueData ? (activeToken.status || 'Active Token') : 'No Active Booking'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('queue.your_token')}</span>
            <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {userToken}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
            <div className="bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl">
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold block">{t('queue.queue_pos_label')}</span>
              <span className="text-lg font-black text-purple-800 dark:text-purple-200">
                {hasQueueData ? `#${queuePos}` : '—'}
              </span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl">
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold block">{t('queue.farmers_ahead_label')}</span>
              <span className="text-lg font-black text-purple-800 dark:text-purple-200">
                {hasQueueData ? farmersAhead : '—'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Transparent Wait Time Calculation Box */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {t('queue.est_wait_label')} Calculation Breakdown
          </h2>
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
              Formula
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Estimated Wait Time = Farmers Ahead × Average Processing Time
            </p>
            {hasQueueData ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
                {farmersAhead} Farmers Ahead × {avgTime} Mins/Farmer = <span className="font-bold text-amber-600 dark:text-amber-400">{estimatedWait} Minutes</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                Queue position unavailable — Reserve a slot to view live position and estimated wait time.
              </p>
            )}
          </div>

          <div className="text-center sm:text-right bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800 shrink-0">
            <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400">Estimated Wait</span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {hasQueueData ? `${estimatedWait} mins` : '—'}
            </p>
          </div>
        </div>

        {/* System Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            {t('queue.prototype_disclaimer')} Live position updates automatically as the procurement administrator calls each token.
          </p>
        </div>
      </div>

    </div>
  );
};

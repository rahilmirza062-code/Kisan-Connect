import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { Settings, Clock, Save, CheckCircle2, CreditCard } from 'lucide-react';

export const AdminSettings = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { queueStatus, refreshAll } = useQueue();

  const [avgTime, setAvgTime] = useState(queueStatus?.averageProcessingTimeMinutes || 5);
  const [feeAmount, setFeeAmount] = useState(50);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (queueStatus?.averageProcessingTimeMinutes) {
      setAvgTime(queueStatus.averageProcessingTimeMinutes);
    }
  }, [queueStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/queue/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ averageProcessingTimeMinutes: avgTime, bookingFeeAmount: feeAmount })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('System settings updated successfully!');
        refreshAll();
      } else {
        setMessage(data.message || 'Failed to save settings.');
      }
    } catch (err) {
      setMessage('Error saving settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <Settings className="w-4 h-4 text-emerald-600" />
          Queue & Financial Configuration
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Adjust processing time benchmarks and demo booking fee rates.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
            {t('admin.avg_processing_time')}
          </label>
          <div className="relative">
            <Clock className="w-5 h-5 absolute left-3 top-3.5 text-amber-500" />
            <input
              type="number"
              min={1}
              max={60}
              value={avgTime}
              onChange={(e) => setAvgTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This value is multiplied by the number of farmers ahead to show transparent wait time estimates.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
            Configurable Demo Booking Fee (₹ INR)
          </label>
          <div className="relative">
            <CreditCard className="w-5 h-5 absolute left-3 top-3.5 text-emerald-600" />
            <input
              type="number"
              min={0}
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Configurable prototype service fee charged prior to token generation.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>

      </form>

    </div>
  );
};

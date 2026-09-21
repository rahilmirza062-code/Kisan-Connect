import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, PlayCircle, Award, AlertCircle, Sparkles } from 'lucide-react';

export const StatusTimeline = ({ currentStatus }) => {
  const { t } = useLanguage();

  const steps = [
    { key: 'step_1', label: `${t('status.booking_confirmed') || 'Booking Confirmed'} / Token Generated` },
    { key: 'step_2', label: t('status.waiting') || 'Waiting in Line' },
    { key: 'step_3', label: `${t('status.your_turn_soon') || 'Your Turn Soon'} / At Centre` },
    { key: 'step_4', label: `${t('status.in_progress') || 'Procurement In Progress'} / Weighed` },
    { key: 'step_5', label: `${t('status.completed') || 'Procurement Completed'} / Paid` }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Booking Confirmed':
      case 'Token Generated':
        return 0;
      case 'Waiting':
        return 1;
      case 'Your Turn Soon':
      case 'At Procurement Centre':
        return 2;
      case 'Procurement In Progress':
      case 'Weighed':
      case 'Payment Processed':
        return 3;
      case 'Paid':
      case 'Completed':
        return 4;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isAllCompleted = currentStatus === 'Completed' || currentStatus === 'Paid';

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 p-6 rounded-2xl border border-rose-200 dark:border-rose-800 text-center space-y-2">
        <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300">{t('status.cancelled')}</h3>
        <p className="text-xs text-rose-600 dark:text-rose-400">
          This procurement booking has been cancelled by system administration. Please book a new slot if required.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {t('status.title')}
        </h3>
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
          {currentStatus}
        </span>
      </div>

      {/* Progress Line & Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || (isAllCompleted && idx === currentIndex);
          const isCurrent = idx === currentIndex && !isAllCompleted;
          const isPending = idx > currentIndex;

          return (
            <div key={step.key} className="relative flex items-center gap-4 group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-bounce'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <PlayCircle className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Content */}
              <div
                className={`flex-1 p-3.5 rounded-xl border transition-all ${isCurrent
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm'
                    : isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold ${isCurrent
                        ? 'text-amber-800 dark:text-amber-300 font-extrabold'
                        : isDone
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      IN PROGRESS NOW
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      DONE ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

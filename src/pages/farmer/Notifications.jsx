import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { Bell, CheckCheck, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';

export const Notifications = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { notifications, unreadCount, refreshAll } = useQueue();

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read/all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            <Bell className="w-4 h-4 text-rose-600" />
            Alerts & Status Updates
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('nav.notifications')}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Notifications Yet
          </h3>
          <p className="text-xs text-slate-500">
            System updates and queue alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                !n.read
                  ? 'bg-amber-50/50 dark:bg-slate-800 border-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 opacity-85'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

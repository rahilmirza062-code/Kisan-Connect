import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Ticket, Calendar, Clock, MapPin, QrCode, Printer, CheckCircle, AlertTriangle, XCircle, IndianRupee, FileText } from 'lucide-react';

export const TokenCard = ({ token, isPrintable = true, onCancelBooking = null }) => {
  const { t } = useLanguage();

  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Procurement In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 animate-pulse';
      case 'Your Turn Soon':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-600/30 dark:border-emerald-500/40 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-black max-w-md mx-auto transition-all duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5 text-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <p className="text-xs tracking-widest font-extrabold uppercase text-emerald-200">
          {t('app_name')} • DIGITAL TOKEN
        </p>
        <h2 className="text-4xl font-black text-amber-300 tracking-wider my-1 drop-shadow-sm">
          {token.tokenNumber}
        </h2>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-white bg-white/10 backdrop-blur-xs">
          <span>{token.status}</span>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200">
        
        {/* Centre info */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.centre')}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{token.centreName}</p>
            {(token.centreAddress || token.centreLocation) && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {token.centreAddress || token.centreLocation}
              </p>
            )}
          </div>
        </div>

        {/* Date & Time Slot Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('token.date')}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{token.date}</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('token.time_slot')}</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{token.timeSlot}</p>
          </div>
        </div>

        {/* Farmer Name & Crop Info */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Farmer Name</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{token.farmerName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('token.crop_type')}</p>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-bold">
              {token.cropType} {token.quantity ? `(${token.quantity})` : ''}
            </p>
          </div>
        </div>

        {/* Rate / Quintal */}
        {token.mspPerQuintal && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">Rate / Quintal</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">₹{Number(token.mspPerQuintal).toLocaleString('en-IN')} / quintal</span>
            </div>
          </div>
        )}

        {/* Queue calculation highlights */}
        {token.queuePosition !== undefined && token.status !== 'Completed' && token.status !== 'Cancelled' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-xl border border-emerald-500/20 text-center space-y-2">
            <div className="flex justify-around items-center">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  {t('dashboard.queue_position')}
                </p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  #{token.queuePosition}
                </p>
              </div>
              <div className="h-8 w-px bg-emerald-200 dark:bg-emerald-800"></div>
              <div>
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  {t('dashboard.estimated_wait')}
                </p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {token.estimatedWaitMinutes || 0} mins
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
              Farmers ahead: {token.farmersAhead || 0} • Avg ~{token.averageProcessingTimeMinutes || 5} min/farmer
            </p>
          </div>
        )}

        {/* Simulated Digital Barcode / QR Code Graphic */}
        <div className="pt-2 flex flex-col items-center justify-center border-t border-dashed border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200 text-slate-900 flex flex-col items-center">
            <QrCode className="w-24 h-24 text-slate-800" />
            <span className="text-[10px] font-mono font-bold tracking-widest mt-1 text-slate-600">
              {token.id} • {token.tokenNumber}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 px-4">
            {t('token.disclaimer')}
          </p>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 print:hidden">
        {isPrintable && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all duration-200"
          >
            <Printer className="w-4 h-4" />
            {t('token.print_token')}
          </button>
        )}
        {onCancelBooking && ['Booking Confirmed', 'Waiting', 'BOOKED', 'Pending Payment'].includes(token.status) && (
          <button
            onClick={() => onCancelBooking(token)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all duration-200"
          >
            <XCircle className="w-4 h-4" />
            Cancel Booking
          </button>
        )}
        {['Paid', 'Completed'].includes(token.status) && (
          <Link
            to={`/receipt/${token.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            View Receipt
          </Link>
        )}
      </div>
    </div>
  );
};

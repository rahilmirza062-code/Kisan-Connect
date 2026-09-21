import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CalendarDays, MapPin, Clock, Users, ArrowRight, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const Schedules = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    fetch('/api/schedules/centres')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.centres.length > 0) {
          setCentres(data.centres);
          setSelectedCentre(data.centres[0].id);
        }
      })
      .catch((err) => console.error('Centres load error:', err));
  }, []);

  useEffect(() => {
    if (!selectedCentre) return;
    setLoading(true);
    fetch(`/api/schedules?centreId=${selectedCentre}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.schedules);
        }
      })
      .catch((err) => console.error('Schedules load error:', err))
      .finally(() => setLoading(false));
  }, [selectedCentre, selectedDate]);

  const handleBook = (schedule) => {
    navigate('/book-slot', { state: { schedule } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          Operating Hours & Capacity
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('nav.schedule')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Select your local procurement centre and choose an available time slot to reserve your visit.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Centre Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Procurement Centre
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3 text-emerald-600 pointer-events-none" />
            <select
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location}){c.address ? ` — ${c.address}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Visit Date
          </label>
          <div className="relative">
            <CalendarDays className="w-5 h-5 absolute left-3 top-3 text-emerald-600 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No procurement slots found for this date.
          </h3>
          <p className="text-xs text-slate-500">
            Try selecting a different date or different procurement centre.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((sch) => {
            const isFull = sch.computedStatus === 'Full' || sch.availableSlots <= 0;
            const percentage = Math.min(100, Math.round((sch.bookedCount / sch.capacity) * 100));

            return (
              <div
                key={sch.id}
                className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isFull
                    ? 'border-slate-200 dark:border-slate-800 opacity-75'
                    : 'border-emerald-600/30 dark:border-emerald-500/40 shadow-sm hover:shadow-md hover:border-emerald-500'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span>{sch.startTime} - {sch.endTime}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isFull
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isFull ? 'Full' : `${sch.availableSlots} Available`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div>
                      <span className="block">{sch.centreName}</span>
                      {(sch.centreAddress || sch.centreLocation) && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          <MapPin className="w-3 h-3 inline mr-0.5 text-emerald-500" />
                          {sch.centreAddress || sch.centreLocation}
                        </span>
                      )}
                    </div>
                    {sch.cropType && (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        🌾 {sch.cropType}
                      </span>
                    )}
                  </div>

                  {/* Rate / Quintal - Prominent */}
                  {sch.mspPrice && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">Rate / Quintal</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">₹{Number(sch.mspPrice).toLocaleString('en-IN')} / quintal</span>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    📅 {formatDate(sch.date)}
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Booked: {sch.bookedCount} / {sch.capacity}</span>
                      <span>{percentage}% Capacity</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : percentage > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isFull}
                  onClick={() => handleBook(sch)}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isFull
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/30'
                  }`}
                >
                  {isFull ? (
                    <>
                      <XCircle className="w-4 h-4" /> Slot Full
                    </>
                  ) : (
                    <>
                      Book Slot Now <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

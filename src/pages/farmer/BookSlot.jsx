import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { PlusCircle, CalendarDays, Clock, MapPin, Wheat, Scale, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export const BookSlot = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { refreshAll } = useQueue();
  const location = useLocation();
  const navigate = useNavigate();

  const preselectedSchedule = location.state?.schedule || null;

  const [centres, setCentres] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState(preselectedSchedule?.centreId || '');
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(preselectedSchedule?.id || '');

  const [cropRates, setCropRates] = useState([]);
  const [cropType, setCropType] = useState('Wheat');
  const [approxQuantity, setApproxQuantity] = useState('20');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(preselectedSchedule?.date || todayStr);

  useEffect(() => {
    fetch('/api/schedules/centres')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.centres.length > 0) {
          setCentres(data.centres);
          if (!selectedCentreId) setSelectedCentreId(data.centres[0].id);
        }
      });

    fetch('/api/schedules/msp-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
          setCropRates(data.rates);
          if (!cropType) setCropType(data.rates[0].name);
        }
      })
      .catch((err) => console.error('Error loading MSP rates:', err));
  }, []);

  useEffect(() => {
    if (!selectedCentreId) return;
    fetch(`/api/schedules?centreId=${selectedCentreId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.schedules);
          if (!selectedScheduleId && data.schedules.length > 0) {
            const avail = data.schedules.find((s) => s.availableSlots > 0);
            if (avail) setSelectedScheduleId(avail.id);
          }
        }
      });
  }, [selectedCentreId, selectedDate]);

  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId) || preselectedSchedule;

  const selectedCropData = cropRates.find(
    (c) => c.name === cropType || c.id === cropType || (c.bilingualLabel && c.bilingualLabel.includes(cropType))
  ) || cropRates[0];

  const validateQuantity = () => {
    const qty = parseFloat(approxQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Approximate quantity must be a valid numeric value greater than 0 (e.g. 20 or 12.5 Quintals).');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedScheduleId) {
      setError('Please select an available schedule slot.');
      return;
    }
    if (!validateQuantity()) {
      setShowConfirmationModal(false);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          cropType,
          approxQuantity: parseFloat(approxQuantity)
        })
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to complete slot reservation.');
        setShowConfirmationModal(false);
      } else {
        await refreshAll();
        // Redirect directly to Booking Summary
        navigate(`/payment-checkout/${data.booking.id}`, { state: { booking: data.booking } });
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setShowConfirmationModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          Government Procurement Slot Reservation
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('nav.book_slot')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Reserve your crop procurement slot for free and receive your digital queue token instantly.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        
        {/* Step 1: Procurement Centre & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Select Procurement Centre
            </label>
            <select
              value={selectedCentreId}
              onChange={(e) => {
                setSelectedCentreId(e.target.value);
                setSelectedScheduleId('');
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.location}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Visit Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedScheduleId('');
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Step 2: Choose Slot */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            2. Choose Time Slot
          </label>
          {schedules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No available schedules for this centre today.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((sch) => {
                const isSelected = sch.id === selectedScheduleId;
                const isFull = sch.availableSlots <= 0;

                return (
                  <button
                    key={sch.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedScheduleId(sch.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 ring-2 ring-emerald-500'
                        : isFull
                        ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {sch.startTime} - {sch.endTime}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isFull ? 'FULL' : `${sch.availableSlots} left`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{sch.date}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 3: Crop & Approx Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              3. Crop / Product Type
            </label>
            <div className="relative">
              <Wheat className="w-5 h-5 absolute left-3 top-3 text-amber-600 pointer-events-none" />
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {cropRates.length > 0 ? (
                  cropRates.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.bilingualLabel || c.name} — ₹{Number(c.mspPrice).toLocaleString('en-IN')} / qtl
                    </option>
                  ))
                ) : (
                  <option value="Wheat">Wheat (गहू / गेहूं) — ₹2,585 / qtl</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              4. Approx Quantity (Quintals)
            </label>
            <div className="relative">
              <Scale className="w-5 h-5 absolute left-3 top-3 text-emerald-600 pointer-events-none" />
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={approxQuantity}
                onChange={(e) => setApproxQuantity(e.target.value)}
                placeholder="e.g. 20 or 12.5"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Note: Final government payment will be calculated using Actual Quantity measured at the APMC centre.
            </p>
            {selectedCropData && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Rate / Quintal:</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">₹{Number(selectedCropData.mspPrice).toLocaleString('en-IN')} / quintal</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          onClick={() => {
            if (!selectedScheduleId) {
              setError('Please select a time slot first.');
              return;
            }
            if (!validateQuantity()) return;
            setShowConfirmationModal(true);
          }}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          Book Procurement Slot & Generate Token <Ticket className="w-5 h-5" />
        </button>

      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-emerald-500/30 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Confirm Slot Reservation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your slot will be reserved immediately for government crop procurement.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Farmer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Centre:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeSchedule?.centreName}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="font-bold text-emerald-600">{activeSchedule?.date} ({activeSchedule?.startTime} - {activeSchedule?.endTime})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crop & Approx Qty:</span>
                <span className="font-bold text-slate-900 dark:text-white">{cropType} ({approxQuantity} Quintals)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmationModal(false)}
                className="w-1/2 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1"
              >
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

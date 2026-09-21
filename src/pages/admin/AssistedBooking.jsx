import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQueue } from '../../context/QueueContext';
import { TokenCard } from '../../components/TokenCard';
import { UserCheck, Phone, User, Wheat, Scale, Calendar, CheckCircle2, ArrowRight, Printer } from 'lucide-react';

export const AssistedBooking = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { refreshAll } = useQueue();

  const [centres, setCentres] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [quantity, setQuantity] = useState('25 Quintals');

  const [createdToken, setCreatedToken] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/schedules/centres')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.centres.length > 0) {
          setCentres(data.centres);
          setSelectedCentreId(data.centres[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedCentreId) return;
    const todayStr = new Date().toISOString().split('T')[0];
    fetch(`/api/schedules?centreId=${selectedCentreId}&date=${todayStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.schedules);
          const avail = data.schedules.find((s) => s.availableSlots > 0);
          if (avail) setSelectedScheduleId(avail.id);
        }
      });
  }, [selectedCentreId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmerName || !farmerPhone || !selectedScheduleId) {
      setError('Please provide Farmer Name, Phone Number, and select a slot.');
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
          quantity,
          farmerName,
          farmerPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreatedToken(data.booking);
        refreshAll();
      } else {
        setError(data.message || 'Failed to issue assisted booking.');
      }
    } catch (err) {
      setError('Error processing assisted booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Section 15: Farmer Without Smartphone Support
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('admin.assisted_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Issue a digital procurement token on behalf of a farmer. Print physical ticket for non-smartphone users.
        </p>
      </div>

      {createdToken ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between">
            <span>✓ Digital Token Generated Successfully! Print token ticket below.</span>
            <button
              onClick={() => setCreatedToken(null)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs"
            >
              Issue Another Token
            </button>
          </div>
          <TokenCard token={createdToken} isPrintable={true} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Farmer Offline Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Farmer Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Tukaram Gaikwad"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Farmer Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  placeholder="9822012345"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Centre & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Procurement Centre
              </label>
              <select
                value={selectedCentreId}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Available Time Slot
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.availableSlots <= 0}>
                    {s.startTime} - {s.endTime} ({s.availableSlots} slots left)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Crop Type
              </label>
              <input
                type="text"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                placeholder="Wheat, Rice, Cotton..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                Quantity (Quintals)
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="30 Quintals"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Generating Token...' : 'Issue Digital Token & Print Ticket'} <ArrowRight className="w-4 h-4" />
          </button>

        </form>
      )}

    </div>
  );
};

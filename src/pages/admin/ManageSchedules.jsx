import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CalendarDays,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Building2,
  Edit,
  Power,
  Wheat,
  IndianRupee,
  RefreshCw,
  Phone
} from 'lucide-react';

export const ManageSchedules = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('centres'); // 'centres' | 'schedules'
  const [centres, setCentres] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [showAddCentreModal, setShowAddCentreModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Forms
  const [centreForm, setCentreForm] = useState({
    name: '',
    location: '',
    district: 'Nashik',
    contactPhone: '',
    cropType: 'Wheat (गहू / गेहूं)',
    mspPrice: 2275,
    status: 'Active'
  });

  const [scheduleForm, setScheduleForm] = useState({
    centreId: '',
    date: todayStr,
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    cropType: 'Wheat (गहू / गेहूं)',
    mspPrice: 2275,
    capacity: 25,
    status: 'Available'
  });

  const loadData = () => {
    setLoading(true);
    setError('');
    
    Promise.all([
      fetch('/api/schedules/centres').then((res) => res.json()),
      fetch('/api/schedules').then((res) => res.json())
    ])
      .then(([centresData, schedulesData]) => {
        if (centresData.success) {
          setCentres(centresData.centres);
          if (centresData.centres.length > 0 && !scheduleForm.centreId) {
            setScheduleForm((prev) => ({ ...prev, centreId: centresData.centres[0].id }));
          }
        }
        if (schedulesData.success) {
          setSchedules(schedulesData.schedules);
        }
      })
      .catch(() => setError('Error connecting to server backend.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- CENTRE HANDLERS ---
  const handleSaveCentre = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const isEdit = !!editingCentre;
    const url = isEdit ? `/api/schedules/centres/${editingCentre.id}` : '/api/schedules/centres';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(centreForm)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isEdit ? 'Procurement Centre updated!' : 'New Procurement Centre added!');
        setShowAddCentreModal(false);
        setEditingCentre(null);
        loadData();
      } else {
        setError(data.message || 'Failed to save centre.');
      }
    } catch (err) {
      setError('Connection error saving centre.');
    }
  };

  const handleToggleCentreStatus = async (centre) => {
    const newStatus = centre.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await fetch(`/api/schedules/centres/${centre.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      setError('Failed to update centre status.');
    }
  };

  // --- SCHEDULE HANDLERS ---
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const isEdit = !!editingSchedule;
    const url = isEdit ? `/api/schedules/${editingSchedule.id}` : '/api/schedules';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isEdit ? 'Schedule slot updated!' : 'New operating schedule published!');
        setShowAddScheduleModal(false);
        setEditingSchedule(null);
        loadData();
      } else {
        setError(data.message || 'Failed to save schedule.');
      }
    } catch (err) {
      setError('Connection error saving schedule.');
    }
  };

  const handleToggleScheduleStatus = async (sch) => {
    const newStatus = sch.status === 'Disabled' ? 'Available' : 'Disabled';
    try {
      const res = await fetch(`/api/schedules/${sch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      setError('Failed to update schedule status.');
    }
  };

  const openEditCentreModal = (c) => {
    setEditingCentre(c);
    setCentreForm({
      name: c.name,
      location: c.location,
      district: c.district,
      contactPhone: c.contactPhone || '',
      cropType: c.cropType || 'Wheat (गहू / गेहूं)',
      mspPrice: c.mspPrice || 2275,
      status: c.status || 'Active'
    });
    setShowAddCentreModal(true);
  };

  const openEditScheduleModal = (sch) => {
    setEditingSchedule(sch);
    setScheduleForm({
      centreId: sch.centreId,
      date: sch.date,
      startTime: sch.startTime,
      endTime: sch.endTime,
      cropType: sch.cropType || 'Wheat (गहू / गेहूं)',
      mspPrice: sch.mspPrice || 2275,
      capacity: sch.capacity,
      status: sch.status || 'Available'
    });
    setShowAddScheduleModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-emerald-600" />
            APMC Control & Procurement Configuration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('nav.manage_schedules')} & Centres
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:text-emerald-600 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {activeTab === 'centres' ? (
            <button
              onClick={() => {
                setEditingCentre(null);
                setCentreForm({
                  name: '',
                  location: '',
                  district: 'Nashik',
                  contactPhone: '',
                  cropType: 'Wheat (गहू / गेहूं)',
                  mspPrice: 2275,
                  status: 'Active'
                });
                setShowAddCentreModal(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Procurement Centre
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({
                  centreId: centres[0]?.id || '',
                  date: todayStr,
                  startTime: '09:00 AM',
                  endTime: '11:00 AM',
                  cropType: 'Wheat (गहू / गेहूं)',
                  mspPrice: 2275,
                  capacity: 25,
                  status: 'Available'
                });
                setShowAddScheduleModal(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Publish Operating Slot
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('centres')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'centres'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Procurement Centres ({centres.length})
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'schedules'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Operating Schedules ({schedules.length})
        </button>
      </div>

      {/* TAB 1: PROCUREMENT CENTRES MANAGEMENT */}
      {activeTab === 'centres' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centres.map((c) => {
            const isActive = c.status !== 'Disabled';
            return (
              <div
                key={c.id}
                className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border transition-all duration-200 space-y-4 flex flex-col justify-between ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'border-rose-200 dark:border-rose-950 opacity-70 bg-rose-50/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      ID: {c.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {c.location}, {c.district}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Target Crop:</span>
                      <span className="text-amber-600 font-bold">{c.cropType || 'Wheat'}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">MSP Rate:</span>
                      <span className="text-emerald-600 font-bold font-mono">₹{c.mspPrice || 2275} / Quintal</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Helpline:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{c.contactPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => openEditCentreModal(c)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleCentreStatus(c)}
                    className={`py-2 px-3 font-bold text-xs rounded-xl flex items-center gap-1 ${
                      isActive
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: OPERATING SCHEDULES MANAGEMENT */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((sch) => {
            const isFull = sch.bookedCount >= sch.capacity;
            const isDisabled = sch.status === 'Disabled';
            const percentage = Math.min(100, Math.round((sch.bookedCount / sch.capacity) * 100));

            return (
              <div
                key={sch.id}
                className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border transition-all duration-200 space-y-4 flex flex-col justify-between ${
                  isDisabled
                    ? 'border-rose-200 dark:border-rose-950 opacity-60 bg-rose-50/20'
                    : isFull
                    ? 'border-amber-300 dark:border-amber-800'
                    : 'border-slate-200 dark:border-slate-700 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">{sch.date}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDisabled
                          ? 'bg-rose-100 text-rose-800'
                          : isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDisabled ? 'DISABLED' : isFull ? 'FULL' : `${sch.availableSlots} SLOTS LEFT`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      {sch.startTime} - {sch.endTime}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{sch.centreName}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crop:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{sch.cropType || 'Wheat'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MSP Price:</span>
                      <span className="text-emerald-600 font-bold font-mono">₹{sch.mspPrice || 2275} / Quintal</span>
                    </div>
                  </div>

                  {/* Capacity Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Capacity</span>
                      <span>{sch.bookedCount} / {sch.capacity} Farmers</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isFull ? 'bg-amber-500' : 'bg-emerald-600'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => openEditScheduleModal(sch)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit Slot
                  </button>
                  <button
                    onClick={() => handleToggleScheduleStatus(sch)}
                    className={`py-2 px-3 font-bold text-xs rounded-xl flex items-center gap-1 ${
                      isDisabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {isDisabled ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PROCUREMENT CENTRE */}
      {showAddCentreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-emerald-500/30 space-y-5 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {editingCentre ? 'Edit Procurement Centre' : 'Add Procurement Centre'}
            </h3>

            <form onSubmit={handleSaveCentre} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Centre Name
                </label>
                <input
                  type="text"
                  required
                  value={centreForm.name}
                  onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
                  placeholder="e.g. Nashik APMC Main Market"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Area
                  </label>
                  <input
                    type="text"
                    required
                    value={centreForm.location}
                    onChange={(e) => setCentreForm({ ...centreForm, location: e.target.value })}
                    placeholder="Panchavati"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={centreForm.district}
                    onChange={(e) => setCentreForm({ ...centreForm, district: e.target.value })}
                    placeholder="Nashik"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Crop
                  </label>
                  <input
                    type="text"
                    value={centreForm.cropType}
                    onChange={(e) => setCentreForm({ ...centreForm, cropType: e.target.value })}
                    placeholder="Wheat / Soybean"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    MSP Rate (₹/Quintal)
                  </label>
                  <input
                    type="number"
                    value={centreForm.mspPrice}
                    onChange={(e) => setCentreForm({ ...centreForm, mspPrice: e.target.value })}
                    placeholder="2275"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone / Helpline
                </label>
                <input
                  type="text"
                  value={centreForm.contactPhone}
                  onChange={(e) => setCentreForm({ ...centreForm, contactPhone: e.target.value })}
                  placeholder="+91 94220 12345"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCentreModal(false);
                    setEditingCentre(null);
                  }}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {editingCentre ? 'Update Centre' : 'Save Centre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT OPERATING SCHEDULE */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-emerald-500/30 space-y-5 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {editingSchedule ? 'Edit Operating Slot' : 'Publish Procurement Operating Slot'}
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Centre
                </label>
                <select
                  disabled={!!editingSchedule}
                  value={scheduleForm.centreId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, centreId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Crop Type
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.cropType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, cropType: e.target.value })}
                    placeholder="Wheat"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    MSP Rate (₹/Quintal)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.mspPrice}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mspPrice: e.target.value })}
                    placeholder="2275"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slot Capacity (Max Farmers)
                </label>
                <input
                  type="number"
                  required
                  value={scheduleForm.capacity}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddScheduleModal(false);
                    setEditingSchedule(null);
                  }}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {editingSchedule ? 'Update Slot' : 'Publish Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

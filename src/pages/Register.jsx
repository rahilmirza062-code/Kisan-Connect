import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Phone, MapPin, ArrowRight, Sprout, KeyRound, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const { t } = useLanguage();
  const { loginWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: 'Nashik'
  });

  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatPhoneNumber = (inputPhone) => {
    let clean = inputPhone.trim();
    if (!clean.startsWith('+')) {
      clean = `+91${clean}`;
    }
    return clean;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Please fill in your name and mobile number.');
      return;
    }
    setError('');
    setSubmitting(true);

    const fullPhone = formatPhoneNumber(formData.phone);
    const result = await loginWithPhone(fullPhone, 'register-recaptcha-container');

    if (result.success) {
      setConfirmationResult(result.confirmationResult);
      setOtpSent(true);
    } else {
      setError(result.message || 'Failed to send Firebase Phone OTP.');
    }
    setSubmitting(false);
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter 6-digit OTP code.');
      return;
    }
    setError('');
    setSubmitting(true);

    const fullPhone = formatPhoneNumber(formData.phone);
    const res = await verifyOtp(confirmationResult, otpCode, {
      name: formData.name,
      phone: fullPhone,
      district: formData.district,
      role: 'farmer'
    });

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid Firebase OTP code.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        
        {/* Invisible reCAPTCHA container for Registration */}
        <div id="register-recaptcha-container"></div>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-700 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('auth.register_title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register via Firebase Phone Authentication & Cloud Firestore
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.full_name')} *
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.mobile_number')} *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.district')}
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Nashik">Nashik</option>
                  <option value="Pune">Pune</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                  <option value="Satara">Satara</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending Firebase OTP...' : 'Send Firebase OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyRegistration} className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Firebase OTP sent to <strong className="font-mono">{formatPhoneNumber(formData.phone)}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit Firebase OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-3 text-emerald-600" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold tracking-widest text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Creating Profile...' : 'Verify OTP & Complete Registration'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

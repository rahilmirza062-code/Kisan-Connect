import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Phone, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

export const AdminLogin = () => {
  const { t } = useLanguage();
  const { loginWithPhone, verifyOtp, loginDemoUser } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9000000000');
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

  const handleSendAdminOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const fullPhone = formatPhoneNumber(phone);
    const result = await loginWithPhone(fullPhone, 'admin-recaptcha-container');

    if (result.success) {
      setConfirmationResult(result.confirmationResult);
      setOtpSent(true);
    } else {
      setError(result.message || 'Failed to send Firebase OTP.');
    }
    setSubmitting(false);
  };

  const handleVerifyAdminOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Enter 6-digit OTP.');
      return;
    }
    setError('');
    setSubmitting(true);

    const res = await verifyOtp(confirmationResult, otpCode, { role: 'admin' });
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Normal farmer accounts cannot access Admin Dashboard.');
      }
    } else {
      setError(res.message || 'Invalid Firebase OTP code.');
    }
    setSubmitting(false);
  };

  const handleDemoAdminLogin = async () => {
    setError('');
    setSubmitting(true);
    const res = await loginDemoUser('admin');
    if (res.success && res.user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setError('Demo admin login failed.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-6">
        
        {/* Invisible reCAPTCHA container for Admin Login */}
        <div id="admin-recaptcha-container"></div>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('auth.admin_login_title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Firebase Admin Authentication & Role Authorization
          </p>
        </div>

        {/* Demo Admin Account Box */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Officer Demo Account</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">+91 90000 00000</p>
          </div>
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            One-Click Login
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendAdminOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9000000000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending Firebase OTP...' : 'Send Officer OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAdminOtp} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 text-xs text-amber-900 dark:text-amber-300 font-medium">
              Firebase OTP sent to <strong className="font-mono">{formatPhoneNumber(phone)}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit Firebase OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-3 text-amber-600" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold tracking-widest text-center focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Authenticating Admin...' : 'Verify OTP & Enter Portal'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
          Not an admin?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Farmer Portal Login
          </Link>
        </div>

      </div>
    </div>
  );
};

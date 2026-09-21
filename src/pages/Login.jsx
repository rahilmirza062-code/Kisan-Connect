import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Phone, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const { t } = useLanguage();
  const { loginWithPhone, verifyOtp, loginDemoUser } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9876543210');
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
    if (!phone) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError('');
    setSubmitting(true);

    const fullPhone = formatPhoneNumber(phone);
    const result = await loginWithPhone(fullPhone, 'recaptcha-container');

    if (result.success) {
      setConfirmationResult(result.confirmationResult);
      setOtpSent(true);
    } else {
      setError(result.message || 'Failed to send Firebase Phone OTP. Check phone format.');
    }
    setSubmitting(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter 6-digit OTP code.');
      return;
    }
    setError('');
    setSubmitting(true);

    const res = await verifyOtp(confirmationResult, otpCode, { phone: formatPhoneNumber(phone), role: 'farmer' });
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid Firebase OTP code.');
    }
    setSubmitting(false);
  };

  const handleQuickDemoLogin = async (uid) => {
    setError('');
    setSubmitting(true);
    const res = await loginDemoUser(uid);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError('Demo login failed.');
    }
    setSubmitting(false);
  };

  const demoFarmers = [
    { uid: 'usr_f1', name: 'Ramesh Patil', phone: '9876543210', district: 'Nashik' },
    { uid: 'usr_f2', name: 'Suresh Deshmukh', phone: '9876543211', district: 'Pune' },
    { uid: 'usr_f3', name: 'Mahesh Shinde', phone: '9876543212', district: 'Nagpur' },
    { uid: 'usr_f4', name: 'Priya Gupta', phone: '9876543213', district: 'Nashik' },
    { uid: 'usr_f5', name: 'Kavita Pawar', phone: '9876543214', district: 'Pune' },
    { uid: 'usr_f6', name: 'Amit Joshi', phone: '9876543215', district: 'Nagpur' },
    { uid: 'usr_f7', name: 'Sunita Deshmukh', phone: '9876543216', district: 'Nashik' },
    { uid: 'usr_f8', name: 'Rahul Verma', phone: '9876543217', district: 'Pune' },
    { uid: 'usr_f9', name: 'Ganesh Patil', phone: '9876543218', district: 'Nagpur' },
    { uid: 'usr_f10', name: 'Anita Kulkarni', phone: '9876543219', district: 'Nashik' }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Invisible reCAPTCHA container for Firebase */}
        <div id="recaptcha-container"></div>

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-700 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Farmer Portal Login
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real Firebase Phone Auth & Demo Farmer Accounts
          </p>
        </div>

        {/* Quick Demo Farmers Selector */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black text-amber-800 dark:text-amber-300 tracking-wider">
              Quick Login Farmers (10 Unique Accounts)
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              Click Login to switch identity
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 max-h-64 overflow-y-auto pr-1">
            {demoFarmers.map((f, idx) => (
              <div
                key={f.uid}
                className="bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-500 transition-all group shadow-xs"
              >
                <div>
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Farmer Option {idx + 1}
                  </span>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {f.phone}
                  </p>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(f.uid)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors text-center"
                    title={`One-click Login as ${f.name}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhone(f.phone)}
                    className="px-2 py-1.5 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-bold transition-colors"
                    title={`Fill phone number ${f.phone} into OTP field`}
                  >
                    Phone
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Phone / OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number (with country code)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210 or +919876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Firebase will verify reCAPTCHA and send an SMS OTP.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending Firebase OTP...' : 'Send Firebase OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Firebase OTP sent to <strong className="font-mono">{formatPhoneNumber(phone)}</strong>
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
              {submitting ? 'Verifying...' : 'Verify OTP & Sign In'} <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full py-2 text-xs text-slate-500 hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {/* Footer Navigation Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs space-y-2 sm:space-y-0">
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Register New Farmer Profile
          </Link>
          <Link to="/admin/login" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            Admin Portal Login →
          </Link>
        </div>

      </div>
    </div>
  );
};

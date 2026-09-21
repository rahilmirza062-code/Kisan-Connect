import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { LanguageSelector } from './LanguageSelector';
import {
  Sprout,
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
  UserCheck,
  PlusCircle,
  Settings,
  ShieldAlert,
  Moon,
  Sun,
  CreditCard
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  const farmerNav = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.schedule'), path: '/schedules', icon: CalendarDays },
    { label: t('nav.book_slot'), path: '/book-slot', icon: PlusCircle },
    { label: t('nav.my_token'), path: '/my-token', icon: Ticket },
    { label: t('nav.queue_status'), path: '/queue-status', icon: Users },
    { label: t('nav.procurement_status'), path: '/procurement-status', icon: TrendingUp },
    { label: t('nav.payment_history'), path: '/payment-history', icon: CreditCard },
  ];

  const adminNav = [
    { label: t('nav.admin_dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('nav.manage_schedules'), path: '/admin/schedules', icon: CalendarDays },
    { label: t('nav.manage_queue'), path: '/admin/queue', icon: Users },
    { label: t('nav.assisted_booking'), path: '/admin/assisted-booking', icon: UserCheck },
    { label: t('nav.settings'), path: '/admin/settings', icon: Settings },
  ];

  const navItems = user?.role === 'admin' ? adminNav : farmerNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-900/10 dark:border-emerald-500/20 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 dark:from-emerald-400 dark:to-amber-400 bg-clip-text text-transparent tracking-tight">
                {t('app_name')}
              </span>
              <span className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 -mt-1 tracking-wider uppercase">
                {user?.role === 'admin' ? 'ADMIN PORTAL' : 'FARMER PORTAL'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs border border-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                title={t('nav.notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {user.role === 'admin' ? 'Officer' : user.farmerId}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                {t('nav.login')}
              </Link>
            )}

            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {user && mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-200">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{user.farmerId} • {user.district}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('nav.logout')}
            </button>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

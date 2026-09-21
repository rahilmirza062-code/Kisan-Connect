import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ExternalLink } from 'lucide-react';

export const Footer = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show footer on login/register pages
  const hideOnPaths = ['/login', '/register', '/admin/login'];
  if (hideOnPaths.includes(location.pathname)) return null;

  const quickLinks = user
    ? user.role === 'admin'
      ? [
          { label: 'Admin Dashboard', path: '/admin/dashboard' },
          { label: 'Manage Schedules', path: '/admin/schedules' },
          { label: 'Queue Controller', path: '/admin/queue' },
          { label: 'Settings', path: '/admin/settings' },
        ]
      : [
          { label: 'Home', path: '/dashboard' },
          { label: 'Schedules', path: '/schedules' },
          { label: 'My Bookings', path: '/book-slot' },
          { label: 'My Token', path: '/my-token' },
          { label: 'Queue Status', path: '/queue-status' },
          { label: 'Payment History', path: '/payment-history' },
        ]
    : [];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 dark:from-emerald-400 dark:to-amber-400 bg-clip-text text-transparent tracking-tight">
                  Kisan Connect
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Digital Procurement Management Platform — Simplifying crop scheduling, queue management, and procurement records for farmers.
            </p>
          </div>

          {/* Quick Links */}
          {quickLinks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/notifications" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                  Help & Notifications
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Contact: support@kisanconnect.org
                </span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-1.5">
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  About Kisan Connect
                </span>
              </li>
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Terms & Disclaimer
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              © 2026 Kisan Connect. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              🌾 Digital Agriculture Procurement & Queue Platform
            </p>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed max-w-2xl mx-auto">
            Kisan Connect is a prototype digital procurement management platform designed to demonstrate how scheduling, queue management, and procurement records can be digitized. This is not an official government website.
          </p>
        </div>
      </div>
    </footer>
  );
};

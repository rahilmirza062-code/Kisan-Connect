import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { lang, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <div className="flex items-center gap-1 bg-emerald-900/10 dark:bg-emerald-950/40 p-1 rounded-full border border-emerald-500/20">
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-2 mr-1" />
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => changeLanguage(l.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
            lang === l.code
              ? 'bg-emerald-600 text-white shadow-sm scale-105'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

import React, { createContext, useContext, useState } from 'react';
import en from '../translations/en.json';
import mr from '../translations/mr.json';
import hi from '../translations/hi.json';

const translations = { en, mr, hi };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('kisan_lang') || 'en');

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('kisan_lang', newLang);
    }
  };

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.en;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string') {
      let str = current;
      Object.keys(params).forEach((paramKey) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
      return str;
    }

    return current || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

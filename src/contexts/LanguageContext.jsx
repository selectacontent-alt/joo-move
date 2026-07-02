"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import defaultTranslations from './translations';

const LanguageContext = createContext();

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
};

const mergeDeep = (target, source) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

const fallbackT = (key, params = {}) => {
  const value = getNestedValue(defaultTranslations, key);
  let text = value?.ar || value?.en || key;
  for (const [param, val] of Object.entries(params)) {
    text = text.replace(`{${param}}`, val);
  }
  return text;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');
  const [overrides, setOverrides] = useState({});
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const translations = mergeDeep(defaultTranslations, overrides);

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem('joo_move_lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('joo_move_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isMounted]);

  useEffect(() => {
    if (!isMounted || localStorage.getItem('joo_move_lang')) return;
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const defaultLanguage = data?.default_language;
        if (defaultLanguage === 'ar' || defaultLanguage === 'en') setLanguage(defaultLanguage);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/translations')
      .then(res => res.json())
      .then(data => {
        const nestedData = {};
        for (const [key, value] of Object.entries(data)) {
          setNestedValue(nestedData, key, value);
        }
        setOverrides(nestedData);
        setOverridesLoaded(true);
      })
      .catch(() => setOverridesLoaded(true));
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key, params = {}) => {
    const value = getNestedValue(translations, key);
    if (!value) return key;
    let text = value[language] || value.en || key;
    for (const [param, val] of Object.entries(params)) {
      text = text.replaceAll(`{${param}}`, val);
    }
    return text;
  };

  const updateTranslation = async (key, arValue, enValue) => {
    const updated = { ...overrides };
    setNestedValue(updated, key, { ar: arValue, en: enValue });
    setOverrides(updated);
    const flat = {};
    flat[key] = JSON.stringify({ ar: arValue, en: enValue });
    try {
      await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flat),
      });
    } catch (err) {
      console.error('Failed to save translation', err);
    }
  };

  const updateTranslationsBatch = async (entries) => {
    const updated = { ...overrides };
    const flat = {};
    for (const { key, arValue, enValue } of entries) {
      setNestedValue(updated, key, { ar: arValue, en: enValue });
      flat[key] = JSON.stringify({ ar: arValue, en: enValue });
    }
    setOverrides(updated);
    try {
      await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flat),
      });
    } catch (err) {
      console.error('Failed to save translations', err);
    }
  };

  return (
    <LanguageContext.Provider value={{
      language, toggleLanguage, t, overridesLoaded,
      updateTranslation, updateTranslationsBatch,
      defaultTranslations, overrides,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context || {
    language: 'ar',
    toggleLanguage: () => {},
    t: fallbackT,
    overridesLoaded: true,
    updateTranslation: async () => {},
    updateTranslationsBatch: async () => {},
    defaultTranslations,
    overrides: {},
  };
};

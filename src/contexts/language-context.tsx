"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

export type Language = 'en' | 'ar';

interface LanguageContextInterface {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextInterface | undefined>(undefined);

// Translation keys
const translations = {
  en: {
    // Navigation Menu
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.bibliography': 'Bibliography',
    'nav.analytics': 'Analytics',
    'nav.userGuide': 'User Guide',
    'nav.about': 'About Page',
    'nav.credits': 'Credits Page',
    
    // Navbar Tabs
    'tabs.tuningSystem': 'Tanghīm (Tuning Systems)',
    'tabs.ajnas': 'Ajnās',
    'tabs.maqamat': 'Maqāmāt',
    'tabs.suyur': 'Suyūr',
    'tabs.intiqalat': 'Intiqālāt',
    
    // Admin Tabs
    'tabs.tuningSystemAdmin': 'Tuning System Admin',
    'tabs.jinsAdmin': 'Jins Admin',
    'tabs.maqamAdmin': 'Maqam Admin',
    'tabs.sayrAdmin': 'Sayr Admin',
    'tabs.patternsAdmin': 'Patterns Admin',
    
    // Settings
    'settings.userMode': 'User Mode',
    'settings.adminMode': 'Admin Mode',
    
    // Language selector
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
  ar: {
    // Navigation Menu (reversed order for RTL)
    'nav.credits': 'صفحة الإعتمادات',
    'nav.about': 'صفحة حول',
    'nav.userGuide': 'دليل المستخدم',
    'nav.analytics': 'التحليلات',
    'nav.bibliography': 'المراجع',
    'nav.tools': 'الأدوات',
    'nav.home': 'الرئيسية',
    
    // Navbar Tabs (reversed order for RTL)
    'tabs.intiqalat': 'الإنتقالات',
    'tabs.suyur': 'السُيُر',
    'tabs.maqamat': 'المقامات',
    'tabs.ajnas': 'الأجناس',
    'tabs.tuningSystem': 'التنغيم (أنظمة التنغيم)',
    
    // Admin Tabs (reversed order for RTL)
    'tabs.patternsAdmin': 'إدارة الأنماط',
    'tabs.sayrAdmin': 'إدارة السَير',
    'tabs.maqamAdmin': 'إدارة المقام',
    'tabs.jinsAdmin': 'إدارة الجنس',
    'tabs.tuningSystemAdmin': 'إدارة نظام التنغيم',
    
    // Settings
    'settings.adminMode': 'وضع الإدارة',
    'settings.userMode': 'وضع المستخدم',
    
    // Language selector
    'language.arabic': 'العربية',
    'language.english': 'English',
  }
};

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('maqam-network-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('maqam-network-language', newLanguage);
    
    // Update document direction
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage === 'ar' ? 'ar' : 'en';
  };

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
  }, [language]);

  const isRTL = language === 'ar';

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageContextProvider');
  }
  return context;
}

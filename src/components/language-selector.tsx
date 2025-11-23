"use client";

import React from "react";
import useLanguageContext from "@/contexts/language-context";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguageContext();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as 'en' | 'ar' | 'fr');
  };

  return (
    <div className="language-selector">
      <select 
        value={language} 
        onChange={handleLanguageChange}
        className="language-selector__select"
        aria-label="Select language"
      >
        <option value="en">{t('language.english')}</option>
        <option value="ar">{t('language.arabic')}</option>
        <option value="fr">{t('language.french')}</option>
      </select>
    </div>
  );
}

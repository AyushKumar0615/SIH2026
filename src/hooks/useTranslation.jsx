import React, { createContext, useContext, useMemo } from 'react';
import { LocalizationService } from '../services/localizationService';

const LanguageContext = createContext({ lang: 'en', t: (key) => key });

export function LanguageProvider({ lang, children }) {
  const value = useMemo(() => ({
    lang,
    t: (key) => LocalizationService.getText(key, lang)
  }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}

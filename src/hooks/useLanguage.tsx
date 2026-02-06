'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getTranslations, t, type Language } from '@/i18n';
import ko from '@/i18n/ko.json';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: typeof ko;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'jikguyeokgu_language';

// 브라우저 언어 감지
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'ko';

  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  const langCode = browserLang.toLowerCase().split('-')[0];

  // 중국어 계열 감지 (zh, zh-CN, zh-TW, zh-HK 등)
  if (langCode === 'zh' || browserLang.toLowerCase().startsWith('zh')) {
    return 'zh';
  }

  // 기본값은 한국어
  return 'ko';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [translations, setTranslations] = useState(getTranslations('ko'));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. 로컬 스토리지에서 저장된 언어 설정 확인
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;

    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'zh')) {
      // 저장된 설정이 있으면 그것을 사용
      setLanguageState(savedLanguage);
      setTranslations(getTranslations(savedLanguage));
    } else {
      // 저장된 설정이 없으면 브라우저 언어 감지
      const detectedLang = detectBrowserLanguage();
      setLanguageState(detectedLang);
      setTranslations(getTranslations(detectedLang));
      localStorage.setItem(LANGUAGE_KEY, detectedLang);
    }

    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const translate = useCallback(
    (key: string) => t(translations, key),
    [translations]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translate,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default useLanguage;

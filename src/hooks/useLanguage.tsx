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

// 브라우저 언어 감지 (fallback용)
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

// IP 기반 국가 감지 → 중국(CN)이면 'zh' 반환
// 저장된 언어 설정이 없는 첫 방문자에게만 호출
async function detectLanguageByIP(): Promise<Language> {
  try {
    // 무료 IP 지오로케이션 API (CORS 허용, 별도 키 불필요)
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('IP API error');
    const data = await res.json();
    // 중국 본토 접속자
    if (data.country_code === 'CN') return 'zh';
  } catch {
    // API 실패 시 브라우저 언어로 fallback
  }
  return detectBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [translations, setTranslations] = useState(getTranslations('ko'));

  useEffect(() => {
    const init = async () => {
      // 1. 사용자가 직접 선택해 저장한 언어 설정이 있으면 그것을 최우선 사용
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;

      if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'zh')) {
        setLanguageState(savedLanguage);
        setTranslations(getTranslations(savedLanguage));
        return;
      }

      // 2. 저장된 설정 없음 → IP 기반 국가 감지 (중국이면 zh, 그 외 ko)
      const detectedLang = await detectLanguageByIP();
      setLanguageState(detectedLang);
      setTranslations(getTranslations(detectedLang));
      // 감지 결과는 저장하지 않음 → 다음 방문에도 재감지
      // (사용자가 직접 변경하면 그때 localStorage에 저장됨)
    };

    init();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    // 사용자가 직접 선택한 경우에만 localStorage에 저장
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

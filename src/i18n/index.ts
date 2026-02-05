import ko from './ko.json';
import zh from './zh.json';

export type Language = 'ko' | 'zh';

export const languages: Record<Language, typeof ko> = {
  ko,
  zh,
};

export const languageNames: Record<Language, string> = {
  ko: '한국어',
  zh: '中文',
};

export function getTranslations(lang: Language) {
  return languages[lang] || languages.ko;
}

// 중첩된 키를 통해 번역 가져오기
export function t(translations: typeof ko, key: string): string {
  const keys = key.split('.');
  let result: unknown = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // 키를 찾지 못하면 키 자체를 반환
    }
  }

  return typeof result === 'string' ? result : key;
}

export default languages;

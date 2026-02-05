/**
 * DeepL API를 사용한 번역 시스템
 * 한국어 ↔ 중국어 자동 번역
 */

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

interface TranslationResult {
  text: string;
  detected_source_language: string;
}

interface DeepLResponse {
  translations: TranslationResult[];
}

/**
 * DeepL API 호출
 */
async function callDeepLAPI(
  text: string,
  targetLang: 'ZH' | 'KO'
): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.warn('[Translation] DEEPL_API_KEY not configured');
    return null;
  }

  if (!text || text.trim().length === 0) {
    return '';
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Translation] DeepL API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: DeepLResponse = await response.json();

    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    }

    return null;
  } catch (error) {
    console.error('[Translation] Failed to translate:', error);
    return null;
  }
}

/**
 * 한국어를 중국어로 번역
 */
export async function translateToZh(text: string): Promise<string> {
  const result = await callDeepLAPI(text, 'ZH');
  return result || text; // 실패 시 원본 텍스트 반환
}

/**
 * 중국어를 한국어로 번역
 */
export async function translateToKo(text: string): Promise<string> {
  const result = await callDeepLAPI(text, 'KO');
  return result || text; // 실패 시 원본 텍스트 반환
}

/**
 * 지정된 언어로 번역 (범용)
 */
export async function translateText(
  text: string,
  targetLang: 'ZH' | 'KO'
): Promise<string> {
  if (targetLang === 'ZH') {
    return translateToZh(text);
  } else {
    return translateToKo(text);
  }
}

/**
 * 게시글 번역 (제목 + 설명)
 */
export async function translatePost(
  titleKo: string,
  descriptionKo: string
): Promise<{
  titleZh: string;
  descriptionZh: string;
  success: boolean;
}> {
  try {
    const [titleZh, descriptionZh] = await Promise.all([
      translateToZh(titleKo),
      translateToZh(descriptionKo),
    ]);

    // 번역이 원본과 같으면 실패로 간주 (API 키 없거나 오류)
    const success = titleZh !== titleKo || descriptionZh !== descriptionKo;

    return {
      titleZh,
      descriptionZh,
      success,
    };
  } catch (error) {
    console.error('[Translation] Failed to translate post:', error);

    return {
      titleZh: titleKo,
      descriptionZh: descriptionKo,
      success: false,
    };
  }
}

/**
 * 리뷰/댓글 번역
 */
export async function translateComment(
  comment: string,
  targetLang: 'ZH' | 'KO'
): Promise<string> {
  if (targetLang === 'ZH') {
    return translateToZh(comment);
  } else {
    return translateToKo(comment);
  }
}

/**
 * 일괄 번역 (여러 텍스트를 한 번에)
 */
export async function translateBatch(
  texts: string[],
  targetLang: 'ZH' | 'KO'
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.warn('[Translation] DEEPL_API_KEY not configured');
    return texts;
  }

  if (texts.length === 0) {
    return [];
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        target_lang: targetLang,
      }),
    });

    if (!response.ok) {
      console.error(`[Translation] Batch translation failed: ${response.status}`);
      return texts;
    }

    const data: DeepLResponse = await response.json();

    if (data.translations && data.translations.length === texts.length) {
      return data.translations.map((t) => t.text);
    }

    return texts;
  } catch (error) {
    console.error('[Translation] Batch translation error:', error);
    return texts;
  }
}

/**
 * 언어 감지
 */
export async function detectLanguage(text: string): Promise<'KO' | 'ZH' | 'UNKNOWN'> {
  // 간단한 휴리스틱 기반 언어 감지
  // 한글 유니코드 범위: AC00-D7A3 (한글 완성형), 1100-11FF (한글 자모)
  // 중국어 유니코드 범위: 4E00-9FFF (기본 한자)

  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF]/;
  const chineseRegex = /[\u4E00-\u9FFF]/;

  const koreanCount = (text.match(koreanRegex) || []).length;
  const chineseCount = (text.match(chineseRegex) || []).length;

  if (koreanCount > chineseCount) {
    return 'KO';
  } else if (chineseCount > koreanCount) {
    return 'ZH';
  }

  return 'UNKNOWN';
}

/**
 * 자동 번역 (언어 감지 후 반대 언어로 번역)
 */
export async function autoTranslate(text: string): Promise<{
  original: string;
  translated: string;
  sourceLang: 'KO' | 'ZH' | 'UNKNOWN';
  targetLang: 'KO' | 'ZH';
}> {
  const sourceLang = await detectLanguage(text);

  if (sourceLang === 'KO') {
    const translated = await translateToZh(text);
    return {
      original: text,
      translated,
      sourceLang: 'KO',
      targetLang: 'ZH',
    };
  } else if (sourceLang === 'ZH') {
    const translated = await translateToKo(text);
    return {
      original: text,
      translated,
      sourceLang: 'ZH',
      targetLang: 'KO',
    };
  }

  // 언어 감지 실패 시 중국어로 번역 시도
  const translated = await translateToZh(text);
  return {
    original: text,
    translated,
    sourceLang: 'UNKNOWN',
    targetLang: 'ZH',
  };
}

import { NextRequest, NextResponse } from 'next/server';

// DeepL API를 사용한 자동 번역
export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Text is required',
          },
        },
        { status: 400 }
      );
    }

    const deeplApiKey = process.env.DEEPL_API_KEY;

    if (!deeplApiKey) {
      // API 키가 없으면 간단한 폴백 번역 (개발용)
      return NextResponse.json({
        success: true,
        data: {
          translatedText: `[번역됨] ${text}`,
          detectedSourceLang: 'AUTO',
        },
      });
    }

    // DeepL API 호출
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang === 'KO' ? 'KO' : 'ZH',
      }),
    });

    if (!response.ok) {
      throw new Error('DeepL API request failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        translatedText: data.translations[0].text,
        detectedSourceLang: data.translations[0].detected_source_language,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);

    // 에러 발생 시 폴백 번역
    const { text } = await request.json().catch(() => ({ text: '' }));
    return NextResponse.json({
      success: true,
      data: {
        translatedText: `[자동번역] ${text}`,
        detectedSourceLang: 'AUTO',
      },
    });
  }
}

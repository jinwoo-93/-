import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { translateText, autoTranslate } from '@/lib/translation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const translateSchema = z.object({
  text: z.string().min(1, '번역할 텍스트가 필요합니다.').max(5000, '텍스트는 5000자 이내여야 합니다.'),
  targetLang: z.enum(['KO', 'ZH']).optional(),
});

/**
 * 채팅 메시지 번역 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = translateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다.',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { text, targetLang } = validated.data;

    if (targetLang) {
      // 지정된 언어로 번역
      const translated = await translateText(text, targetLang);

      return NextResponse.json({
        success: true,
        data: {
          original: text,
          translated,
          targetLang,
        },
      });
    } else {
      // 자동 감지 후 번역
      const result = await autoTranslate(text);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error('Translate API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

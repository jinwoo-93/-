import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createUploadPresignedUrl } from '@/lib/storage';
import { imageUploadRequestSchema } from '@/lib/validations/image';

export const dynamic = 'force-dynamic';

/**
 * 이미지 업로드용 Presigned URL 생성 API
 * 클라이언트는 이 URL로 직접 S3에 업로드합니다.
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

    // 요청 검증
    const validated = imageUploadRequestSchema.safeParse(body);

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

    const { filename, contentType, size, purpose } = validated.data;

    // Presigned URL 생성
    const result = await createUploadPresignedUrl(filename, contentType, size, purpose);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UPLOAD_ERROR', message: '업로드 URL 생성에 실패했습니다.' },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        fileKey: result.fileKey,
        publicUrl: result.publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload API error:', error);

    const message = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

/**
 * 다중 이미지 업로드용 Presigned URL 일괄 생성
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '파일 정보가 필요합니다.' } },
        { status: 400 }
      );
    }

    if (body.files.length > 10) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_MANY_FILES', message: '한 번에 최대 10개까지 업로드할 수 있습니다.' } },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.files.map(async (file: any) => {
        const validated = imageUploadRequestSchema.safeParse(file);

        if (!validated.success) {
          return { success: false, filename: file.filename, error: validated.error.errors };
        }

        const result = await createUploadPresignedUrl(
          validated.data.filename,
          validated.data.contentType,
          validated.data.size,
          validated.data.purpose
        );

        if (!result) {
          return { success: false, filename: file.filename, error: 'URL 생성 실패' };
        }

        return {
          success: true,
          filename: file.filename,
          ...result,
        };
      })
    );

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        total: body.files.length,
        successCount,
        failedCount: body.files.length - successCount,
        results,
      },
    });
  } catch (error) {
    console.error('Batch upload API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

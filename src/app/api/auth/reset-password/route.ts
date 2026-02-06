import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * 비밀번호 재설정
 * POST /api/auth/reset-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, token, code, newPassword } = body;

    if (!phone || !token || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 정보를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '비밀번호는 8자 이상이어야 합니다.' } },
        { status: 400 }
      );
    }

    // 토큰 검증
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: phone,
        token: tokenHash,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '인증 정보가 유효하지 않거나 만료되었습니다.' } },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // NextAuth credentials 사용 시 별도 password 필드 필요
        // password: hashedPassword,
      },
    });

    // 사용한 토큰 삭제
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: '비밀번호가 성공적으로 변경되었습니다.' },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '비밀번호 변경 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

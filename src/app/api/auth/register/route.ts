import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      nickname,
      phone,
      country = 'KR',
      language = 'ko',
      marketingAgreed = false,
    } = body;

    // 유효성 검사
    if (!email || !password || !nickname || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '필수 정보를 모두 입력해주세요.' },
        },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '이미 사용 중인 이메일입니다.' },
        },
        { status: 400 }
      );
    }

    // 휴대폰 번호 중복 확인
    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '이미 등록된 휴대폰 번호입니다.' },
        },
        { status: 400 }
      );
    }

    // 닉네임 중복 확인
    const existingNickname = await prisma.user.findFirst({
      where: { nickname },
    });

    if (existingNickname) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '이미 사용 중인 닉네임입니다.' },
        },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        phone,
        country,
        language,
        isPhoneVerified: true, // 휴대폰 인증 완료 상태
        marketingAgreed,
        userType: 'BUYER',
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        phone: true,
        country: true,
        language: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: '회원가입 중 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}

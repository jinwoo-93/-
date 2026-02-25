'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Error Page (500)
 * 예상치 못한 에러가 발생했을 때 표시됩니다.
 *
 * Next.js의 error.tsx는 자동으로 Error Boundary를 생성합니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Application error:', error);
    // TODO: Phase 6에서 Sentry로 전송
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          {/* 에러 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            문제가 발생했습니다
          </h1>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-md mx-auto">
            예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
          </p>

          {/* 에러 메시지 (개발 환경) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">에러 정보 (개발 환경):</p>
              <p className="text-sm text-red-700 font-mono break-words">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button onClick={reset} className="flex-1" size="lg">
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 시도
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                홈으로 이동
              </Link>
            </Button>
          </div>

          {/* 도움말 */}
          <div className="border-t pt-6 mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              문제가 계속 발생하시나요?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="link" size="sm" asChild>
                <Link href="/help/contact">고객센터 문의</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/faq">자주 묻는 질문</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            에러가 자동으로 기록되었습니다. 빠른 시일 내에 해결하도록 하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

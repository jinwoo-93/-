'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, Package } from 'lucide-react';

/**
 * 404 Not Found Page
 * 존재하지 않는 페이지에 접근했을 때 표시됩니다.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 아트 */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-bold text-blue-200 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Search className="w-16 h-16 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              홈으로 이동
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              <Package className="w-5 h-5 mr-2" />
              상품 둘러보기
            </Link>
          </Button>
        </div>

        {/* 이전 페이지 */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          이전 페이지로 돌아가기
        </button>

        {/* 추천 링크 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">다음 페이지를 찾으시나요?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/mypage">
              <Button variant="link" size="sm">
                마이페이지
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="link" size="sm">
                고객센터
              </Button>
            </Link>
            <Link href="/seller-guide">
              <Button variant="link" size="sm">
                판매자 가이드
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="link" size="sm">
                자주 묻는 질문
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

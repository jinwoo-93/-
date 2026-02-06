import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { FloatingKakaoChat } from '@/components/common/FloatingKakaoChat';
import { FloatingExchangeCalculator } from '@/components/common/FloatingExchangeCalculator';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 헤더 - sticky, z-50 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* 푸터 - 데스크톱 전용 */}
      <Footer />

      {/* 하단 네비게이션 - 모바일 전용 */}
      <BottomNavigation />

      {/* 플로팅 버튼들 - 각 컴포넌트가 자체 위치 지정 */}
      <FloatingExchangeCalculator />
      <FloatingKakaoChat />
    </div>
  );
}

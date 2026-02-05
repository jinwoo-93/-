import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { FloatingKakaoChat } from '@/components/common/FloatingKakaoChat';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pb-16 md:pb-0 bg-white">{children}</main>
      <Footer />
      <BottomNavigation />
      <FloatingKakaoChat />
    </div>
  );
}

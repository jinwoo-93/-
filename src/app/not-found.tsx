import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-brand-blue mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/posts">
              <Search className="w-4 h-4 mr-2" />
              상품 둘러보기
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            이전 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

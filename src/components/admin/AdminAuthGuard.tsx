'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (status === 'loading') {
        return; // 세션 로딩 중
      }

      if (status === 'unauthenticated') {
        // 로그인되지 않음
        router.push('/admin/login');
        return;
      }

      if (status === 'authenticated') {
        // 세션이 있는 경우 관리자 권한 확인
        if (session?.user?.userType !== 'ADMIN') {
          // 관리자가 아닌 경우
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }

        setIsChecking(false);
      }
    };

    checkAdmin();
  }, [status, session, router]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

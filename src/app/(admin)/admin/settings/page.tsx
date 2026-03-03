'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  if (authLoading || isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{language === 'KO' ? '설정' : '设置'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {language === 'KO' ? '시스템 설정' : '系统设置'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">
              {language === 'KO'
                ? '시스템 설정 기능이 준비되었습니다.'
                : '系统设置功能已准备就绪。'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'KO'
                ? '플랫폼, 결제, 배송, 알림, 보안 설정을 관리할 수 있습니다.'
                : '可以管理平台、支付、配送、通知、安全设置。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

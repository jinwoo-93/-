'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdsPage() {
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
        <h1 className="text-2xl font-bold">{language === 'KO' ? '광고 관리' : '广告管理'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            {language === 'KO' ? '광고 관리 시스템' : '广告管理系统'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">
              {language === 'KO'
                ? '광고 관리 기능이 준비되었습니다.'
                : '广告管理功能已准备就绪。'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'KO'
                ? '광고 생성, 관리, 성과 분석 기능을 제공합니다.'
                : '提供广告创建、管理和效果分析功能。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

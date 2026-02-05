'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Radio, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveStreamList from '@/components/live/LiveStreamList';
import { useLanguage } from '@/hooks/useLanguage';

export default function LivePage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500" />
            {language === 'ko' ? '라이브 커머스' : '直播购物'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ko'
              ? '실시간 방송으로 상품을 만나보세요'
              : '通过实时直播了解商品'}
          </p>
        </div>
        <Link href="/live/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ko' ? '방송하기' : '开始直播'}
          </Button>
        </Link>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="live">
            {language === 'ko' ? '실시간' : '正在直播'}
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            {language === 'ko' ? '예정' : '即将开播'}
          </TabsTrigger>
          <TabsTrigger value="ended">
            {language === 'ko' ? '다시보기' : '回放'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          <LiveStreamList status="LIVE" limit={12} showTitle={false} />
        </TabsContent>

        <TabsContent value="scheduled">
          <LiveStreamList status="SCHEDULED" limit={12} showTitle={false} />
        </TabsContent>

        <TabsContent value="ended">
          <LiveStreamList status="ENDED" limit={12} showTitle={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

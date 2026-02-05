'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseRequestList from '@/components/purchase/PurchaseRequestList';
import { useLanguage } from '@/hooks/useLanguage';

export default function PurchaseRequestsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('open');

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {language === 'ko' ? '구매대행 요청' : '代购请求'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ko'
              ? '원하는 상품을 요청하고 판매자의 제안을 받아보세요'
              : '发布您想要的商品，获取卖家报价'}
          </p>
        </div>
        <Link href="/purchase-requests/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ko' ? '요청하기' : '发布请求'}
          </Button>
        </Link>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="open">
            {language === 'ko' ? '모집 중' : '招募中'}
          </TabsTrigger>
          <TabsTrigger value="my">
            {language === 'ko' ? '내 요청' : '我的请求'}
          </TabsTrigger>
          <TabsTrigger value="all">
            {language === 'ko' ? '전체' : '全部'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <PurchaseRequestList status="OPEN" limit={20} showTitle={false} />
        </TabsContent>

        <TabsContent value="my">
          <PurchaseRequestList myRequests limit={20} showTitle={false} />
        </TabsContent>

        <TabsContent value="all">
          <PurchaseRequestList limit={20} showTitle={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

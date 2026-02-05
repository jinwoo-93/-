'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

export default function CreatePurchaseRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [productName, setProductName] = useState('');
  const [productNameZh, setProductNameZh] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast({
        title: language === 'ko' ? '상품명을 입력해주세요' : '请输入商品名称',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productNameZh: productNameZh || undefined,
          productUrl: productUrl || undefined,
          productImage: productImage || undefined,
          estimatedPrice: estimatedPrice ? parseInt(estimatedPrice) : undefined,
          quantity: parseInt(quantity) || 1,
          description: description || undefined,
          maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
          deadline: deadline || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '요청이 등록되었습니다' : '请求已发布',
        });
        router.push(`/purchase-requests/${data.data.id}`);
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {language === 'ko' ? '구매대행 요청하기' : '发布代购请求'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 상품 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '상품 정보' : '商品信息'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">
                {language === 'ko' ? '상품명' : '商品名称'} *
              </Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={language === 'ko' ? '구매를 원하는 상품명' : '请输入商品名称'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="productNameZh">
                {language === 'ko' ? '중국어 상품명 (선택)' : '中文商品名 (可选)'}
              </Label>
              <Input
                id="productNameZh"
                value={productNameZh}
                onChange={(e) => setProductNameZh(e.target.value)}
                placeholder={language === 'ko' ? '중국어 상품명' : '中文商品名'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="productUrl">
                {language === 'ko' ? '상품 링크 (선택)' : '商品链接 (可选)'}
              </Label>
              <Input
                id="productUrl"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko'
                  ? '타오바오, 쿠팡 등 원본 상품 페이지 링크'
                  : '淘宝、Coupang等原商品链接'}
              </p>
            </div>

            <div>
              <Label htmlFor="productImage">
                {language === 'ko' ? '상품 이미지 URL (선택)' : '商品图片 URL (可选)'}
              </Label>
              <Input
                id="productImage"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedPrice">
                  {language === 'ko' ? '예상 가격 (원)' : '预计价格 (韩元)'}
                </Label>
                <Input
                  id="estimatedPrice"
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quantity">
                  {language === 'ko' ? '수량' : '数量'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 요청 상세 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '요청 상세' : '请求详情'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">
                {language === 'ko' ? '상세 설명' : '详细说明'}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ko'
                  ? '색상, 사이즈, 특이사항 등 원하는 조건을 상세히 적어주세요'
                  : '请详细描述颜色、尺寸、特殊要求等'}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxBudget">
                  {language === 'ko' ? '최대 예산 (원)' : '最大预算 (韩元)'}
                </Label>
                <Input
                  id="maxBudget"
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deadline">
                  {language === 'ko' ? '희망 마감일' : '期望截止日期'}
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안내 */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">
              {language === 'ko' ? '이용 안내' : '使用须知'}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {language === 'ko' ? '요청 등록 후 판매자들의 제안을 받을 수 있습니다.' : '发布请求后，可收到卖家的报价。'}</li>
              <li>• {language === 'ko' ? '마음에 드는 제안을 선택하여 거래를 진행하세요.' : '选择满意的报价进行交易。'}</li>
              <li>• {language === 'ko' ? '상세한 정보를 제공할수록 정확한 제안을 받을 수 있습니다.' : '提供的信息越详细，收到的报价越准确。'}</li>
            </ul>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {language === 'ko' ? '요청 등록하기' : '发布请求'}
        </Button>
      </form>
    </div>
  );
}

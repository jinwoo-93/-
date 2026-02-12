'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/stores/cartStore';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';

export default function CartPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { formatKRW, formatCNY } = useCurrency();
  const { toast } = useToast();

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    items.map((item) => item.post.id)
  );

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.post.id));
    }
  };

  const toggleSelect = (postId: string) => {
    setSelectedIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.post.id));
  const totalKRW = selectedItems.reduce(
    (sum, item) => sum + item.post.priceKRW * item.quantity,
    0
  );
  const totalCNY = selectedItems.reduce(
    (sum, item) => sum + item.post.priceCNY * item.quantity,
    0
  );

  const handleRemove = (postId: string) => {
    removeItem(postId);
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
    toast({
      title: language === 'ko' ? '상품이 삭제되었습니다' : '商品已删除',
    });
  };

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds([]);
    toast({
      title: language === 'ko' ? '선택한 상품이 삭제되었습니다' : '已删除选中的商品',
    });
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast({
        title: language === 'ko' ? '상품을 선택해주세요' : '请选择商品',
        variant: 'destructive',
      });
      return;
    }
    router.push('/checkout');
  };

  // 빈 장바구니
  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ko' ? '장바구니가 비어있습니다' : '购物车为空'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'ko'
              ? '마음에 드는 상품을 담아보세요!'
              : '快去挑选心仪的商品吧！'}
          </p>
          <Button asChild>
            <Link href="/">
              {language === 'ko' ? '쇼핑하러 가기' : '去购物'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {language === 'ko' ? '장바구니' : '购物车'}
        <span className="text-muted-foreground text-lg ml-2">
          ({items.length})
        </span>
      </h1>

      {/* 전체 선택 / 선택 삭제 */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm">
            {language === 'ko' ? '전체 선택' : '全选'}
          </span>
        </label>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveSelected}
            className="text-destructive hover:text-destructive"
          >
            {language === 'ko'
              ? `선택 삭제 (${selectedIds.length})`
              : `删除选中 (${selectedIds.length})`}
          </Button>
        )}
      </div>

      {/* 장바구니 아이템 목록 */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <Card key={item.post.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* 체크박스 */}
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={selectedIds.includes(item.post.id)}
                    onCheckedChange={() => toggleSelect(item.post.id)}
                  />
                </div>

                {/* 상품 이미지 */}
                <Link
                  href={`/posts/${item.post.id}`}
                  className="shrink-0"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    {item.post.images?.[0] ? (
                      <Image
                        src={item.post.images[0]}
                        alt={item.post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/posts/${item.post.id}`}
                    className="font-medium text-sm line-clamp-2 hover:underline"
                  >
                    {language === 'ko'
                      ? item.post.title
                      : item.post.titleZh || item.post.title}
                  </Link>

                  <div className="mt-2">
                    <p className="font-bold text-base">
                      {formatKRW(item.post.priceKRW)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCNY(item.post.priceCNY)}
                    </p>
                  </div>

                  {/* 수량 조절 + 삭제 */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.post.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.post.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (item.post.quantity || 99)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 결제 요약 */}
      <Card className="sticky bottom-20 md:bottom-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {language === 'ko'
                ? `선택 상품 ${selectedItems.length}개`
                : `已选 ${selectedItems.length} 件商品`}
            </span>
            <div className="text-right">
              <p className="text-lg font-bold">{formatKRW(totalKRW)}</p>
              <p className="text-xs text-muted-foreground">
                {formatCNY(totalCNY)}
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
          >
            {language === 'ko'
              ? `주문하기 (${selectedItems.length})`
              : `去结算 (${selectedItems.length})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

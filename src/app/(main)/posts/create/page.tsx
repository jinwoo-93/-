'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { postCreateSchema, type PostCreateInput } from '@/lib/validations';
import type { Category } from '@/types';
import { Truck, Info } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCompanies, setShippingCompanies] = useState<any[]>([]);
  const [shippingFeeType, setShippingFeeType] = useState<'FREE' | 'BUYER_PAYS' | 'CONDITIONAL_FREE'>('BUYER_PAYS');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [shippingFeeAmount, setShippingFeeAmount] = useState<string>('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostCreateInput>({
    resolver: zodResolver(postCreateSchema),
    defaultValues: {
      postType: 'SELL',
      quantity: 1,
      images: [],
    },
  });

  const postType = watch('postType');

  useEffect(() => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    fetchCategories();
    fetchShippingCompanies();
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/common/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchShippingCompanies = async () => {
    try {
      const response = await fetch('/api/shipping/companies');
      const data = await response.json();
      if (data.success) {
        setShippingCompanies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shipping companies:', error);
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    setValue('images', newImages);
  };

  const onSubmit = async (data: PostCreateInput) => {
    if (images.length === 0) {
      toast({
        title: language === 'ko' ? '이미지를 1개 이상 업로드해주세요' : '请至少上传1张图片',
        variant: 'destructive',
      });
      return;
    }

    // 판매 게시글인 경우 배송 설정 검증
    if (data.postType === 'SELL') {
      if (!selectedCompanyId) {
        toast({
          title: language === 'ko' ? '배송업체를 선택해주세요' : '请选择配送公司',
          variant: 'destructive',
        });
        return;
      }

      if (shippingFeeType === 'FREE' && !shippingFeeAmount) {
        toast({
          title: language === 'ko' ? '배송비를 입력해주세요' : '请输入配送费',
          variant: 'destructive',
        });
        return;
      }

      if (shippingFeeType === 'CONDITIONAL_FREE' && (!shippingFeeAmount || !freeShippingThreshold)) {
        toast({
          title: language === 'ko' ? '배송비와 무료배송 기준금액을 입력해주세요' : '请输入配送费和免费配送门槛',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = { ...data, images };

      // 배송 설정 추가 (판매 게시글만)
      if (data.postType === 'SELL') {
        payload.shippingCompanyId = selectedCompanyId;
        payload.shippingFeeType = shippingFeeType;

        if (shippingFeeType === 'FREE') {
          payload.shippingFeeAmount = parseInt(shippingFeeAmount);
        } else if (shippingFeeType === 'CONDITIONAL_FREE') {
          payload.shippingFeeAmount = parseInt(shippingFeeAmount);
          payload.freeShippingThreshold = parseInt(freeShippingThreshold);
        }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: language === 'ko' ? '게시글이 등록되었습니다' : '商品已发布' });
        router.push(`/posts/${result.data.id}`);
      } else {
        toast({ title: result.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container-app py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('post.createSell')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 게시글 유형 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '게시글 유형' : '发布类型'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="SELL"
                  {...register('postType')}
                  className="w-4 h-4"
                />
                <span>{language === 'ko' ? '판매' : '出售'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="BUY"
                  {...register('postType')}
                  className="w-4 h-4"
                />
                <span>{language === 'ko' ? '구매 대행 요청' : '求购'}</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 이미지 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('post.images')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={10}
              purpose="post"
            />
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '기본 정보' : '基本信息'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('post.title')}</label>
              <Input
                {...register('title')}
                placeholder={
                  language === 'ko' ? '상품명을 입력해주세요' : '请输入商品名称'
                }
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">{t('post.category')}</label>
              <select
                {...register('categoryId')}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {language === 'ko' ? '카테고리 선택' : '选择分类'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ko' ? cat.nameKo : cat.nameZh}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('post.price')} (KRW)</label>
                <Input
                  type="number"
                  {...register('priceKRW', { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                />
                {errors.priceKRW && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.priceKRW.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t('post.quantity')}</label>
                <Input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="1"
                  className="mt-1"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t('post.description')}</label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder={
                  language === 'ko'
                    ? '상품에 대한 상세 설명을 입력해주세요'
                    : '请输入商品详细描述'
                }
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 배송 설정 (판매 게시글만) */}
        {postType === 'SELL' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {language === 'ko' ? '배송 설정' : '配送设置'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 배송업체 선택 */}
              <div>
                <label className="text-sm font-medium">
                  {language === 'ko' ? '배송업체 *' : '配送公司 *'}
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">
                    {language === 'ko' ? '배송업체 선택' : '选择配送公司'}
                  </option>
                  {shippingCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.nameZh}) - ⭐{company.averageRating.toFixed(1)} -
                      {company.pricePerKg ? ` ₩${company.pricePerKg.toLocaleString()}/kg` : ''}
                    </option>
                  ))}
                </select>
                {shippingCompanies.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    {language === 'ko'
                      ? '승인된 배송업체가 없습니다. 관리자에게 문의하세요.'
                      : '暂无认证配送公司，请联系管理员'}
                  </p>
                )}
              </div>

              {/* 배송비 타입 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === 'ko' ? '배송비 설정 *' : '配送费设置 *'}
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="BUYER_PAYS"
                      checked={shippingFeeType === 'BUYER_PAYS'}
                      onChange={(e) => setShippingFeeType(e.target.value as any)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'ko' ? '구매자 부담' : '买家承担'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ko'
                          ? '구매자가 배송비를 부담합니다'
                          : '买家承担配送费用'}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="FREE"
                      checked={shippingFeeType === 'FREE'}
                      onChange={(e) => setShippingFeeType(e.target.value as any)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'ko' ? '무료배송 (판매자 부담)' : '包邮 (卖家承担)'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ko'
                          ? '판매자가 배송비를 부담합니다'
                          : '卖家承担配送费用'}
                      </p>
                      {shippingFeeType === 'FREE' && (
                        <Input
                          type="number"
                          value={shippingFeeAmount}
                          onChange={(e) => setShippingFeeAmount(e.target.value)}
                          placeholder={language === 'ko' ? '배송비 금액 (KRW)' : '配送费金额 (KRW)'}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="CONDITIONAL_FREE"
                      checked={shippingFeeType === 'CONDITIONAL_FREE'}
                      onChange={(e) => setShippingFeeType(e.target.value as any)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'ko' ? '조건부 무료배송' : '条件包邮'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ko'
                          ? '일정 금액 이상 구매 시 무료배송'
                          : '满额包邮'}
                      </p>
                      {shippingFeeType === 'CONDITIONAL_FREE' && (
                        <div className="mt-2 space-y-2">
                          <Input
                            type="number"
                            value={shippingFeeAmount}
                            onChange={(e) => setShippingFeeAmount(e.target.value)}
                            placeholder={language === 'ko' ? '배송비 금액 (KRW)' : '配送费金额 (KRW)'}
                          />
                          <Input
                            type="number"
                            value={freeShippingThreshold}
                            onChange={(e) => setFreeShippingThreshold(e.target.value)}
                            placeholder={language === 'ko' ? '무료배송 기준 (KRW)' : '包邮门槛 (KRW)'}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium mb-1">
                  {language === 'ko' ? '💡 배송비 안내' : '💡 配送费说明'}
                </p>
                <ul className="space-y-1 text-blue-800">
                  <li>
                    {language === 'ko'
                      ? '• 구매자 부담: 배송업체의 기본 요금이 적용됩니다'
                      : '• 买家承担：按配送公司标准收费'}
                  </li>
                  <li>
                    {language === 'ko'
                      ? '• 무료배송: 입력한 배송비를 판매자가 부담합니다'
                      : '• 包邮：卖家承担配送费'}
                  </li>
                  <li>
                    {language === 'ko'
                      ? '• 조건부 무료: 기준금액 이상 구매 시 무료배송'
                      : '• 条件包邮：满额免配送费'}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? language === 'ko'
              ? '등록 중...'
              : '发布中...'
            : language === 'ko'
            ? '등록하기'
            : '发布'}
        </Button>
      </form>
    </div>
  );
}

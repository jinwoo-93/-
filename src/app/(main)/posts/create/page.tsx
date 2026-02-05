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

export default function CreatePostPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    fetchCategories();
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

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images }),
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

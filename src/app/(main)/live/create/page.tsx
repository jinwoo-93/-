'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Radio,
  ArrowLeft,
  Plus,
  X,
  Calendar,
  ShoppingBag,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { useCurrency } from '@/hooks/useCurrency';

interface MyPost {
  id: string;
  title: string;
  titleZh?: string;
  priceKRW: number;
  priceCNY: number;
  images: string[];
}

export default function CreateLivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { format } = useCurrency();

  const [title, setTitle] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMyPosts();
    }
  }, [status]);

  const fetchMyPosts = async () => {
    try {
      const res = await fetch('/api/posts?my=true&status=ACTIVE&limit=50');
      const data = await res.json();
      if (data.success) {
        setMyPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: language === 'ko' ? '방송 제목을 입력해주세요' : '请输入直播标题',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          titleZh: titleZh || undefined,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          scheduledAt: scheduledAt || undefined,
          productIds: selectedProducts,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '방송이 생성되었습니다' : '直播已创建',
        });
        router.push(`/live/${data.data.id}`);
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

  const toggleProduct = (postId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Radio className="h-5 w-5 text-red-500" />
          {language === 'ko' ? '라이브 방송 만들기' : '创建直播'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '방송 정보' : '直播信息'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                {language === 'ko' ? '방송 제목' : '直播标题'} *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'ko' ? '방송 제목을 입력하세요' : '请输入直播标题'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="titleZh">
                {language === 'ko' ? '중국어 제목 (선택)' : '中文标题 (可选)'}
              </Label>
              <Input
                id="titleZh"
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                placeholder={language === 'ko' ? '중국어 제목' : '中文标题'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">
                {language === 'ko' ? '방송 설명' : '直播简介'}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ko' ? '방송 내용을 설명해주세요' : '请描述直播内容'}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="thumbnail">
                {language === 'ko' ? '썸네일 URL' : '封面图 URL'}
              </Label>
              <Input
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scheduledAt">
                {language === 'ko' ? '예정 시간 (선택)' : '预定时间 (可选)'}
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* 상품 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {language === 'ko' ? '판매 상품 선택' : '选择商品'}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedProducts.length}{language === 'ko' ? '개 선택됨' : '件已选'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPosts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : myPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{language === 'ko' ? '등록된 상품이 없습니다' : '暂无商品'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myPosts.map((post) => {
                  const isSelected = selectedProducts.includes(post.id);
                  const postTitle = language === 'zh' && post.titleZh ? post.titleZh : post.title;

                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => toggleProduct(post.id)}
                      className={`relative rounded-lg border p-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="relative aspect-square rounded overflow-hidden bg-muted mb-2">
                        {post.images[0] ? (
                          <Image
                            src={post.images[0]}
                            alt={postTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-full h-full p-4 text-muted-foreground" />
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {selectedProducts.indexOf(post.id) + 1}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs line-clamp-2">{postTitle}</p>
                      <p className="text-xs font-bold text-primary mt-1">
                        {format(post.priceKRW, post.priceCNY)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {language === 'ko' ? '방송 생성하기' : '创建直播'}
        </Button>
      </form>
    </div>
  );
}

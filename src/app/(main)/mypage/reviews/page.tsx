'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  reviewer: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  order: {
    id: string;
    post: {
      id: string;
      title: string;
    };
  };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchReviews();
  }, [isAuthenticated, authLoading]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/users/me/reviews');
      const data = await response.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setStats({
          averageRating: data.data.averageRating,
          totalReviews: data.data.totalReviews,
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ko' ? '뒤로가기' : '返回'}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Star className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">
          {language === 'ko' ? '받은 리뷰' : '我的评价'}
        </h1>
      </div>

      {/* 평점 요약 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <span className="text-4xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ko' ? '평균 평점' : '平均评分'}
              </p>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-center">
              <p className="text-4xl font-bold">{stats.totalReviews}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ko' ? '총 리뷰' : '总评价'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ko' ? '아직 받은 리뷰가 없습니다' : '暂无评价'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.reviewer.profileImage || ''} />
                    <AvatarFallback>
                      {review.reviewer.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{review.reviewer.nickname}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt, language)}
                      </p>
                    </div>
                    <p className="text-sm mt-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'ko' ? '상품' : '商品'}: {review.order.post.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

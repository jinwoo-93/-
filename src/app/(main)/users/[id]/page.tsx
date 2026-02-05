'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Award,
  Package,
  ChevronRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import FollowButton from '@/components/user/FollowButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SellerProfile {
  id: string;
  nickname: string;
  profileImage: string | null;
  userType: string;
  country: string;
  averageRating: number;
  totalSales: number;
  isBusinessVerified: boolean;
  hasExcellentBadge: boolean;
  createdAt: string;
  _count: {
    posts: number;
    receivedReviews: number;
  };
}

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
    post: {
      title: string;
      titleZh: string | null;
      images: string[];
    };
  };
}

interface Post {
  id: string;
  title: string;
  titleZh: string | null;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  status: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      // 프로필 정보 조회
      const profileRes = await fetch(`/api/users/${userId}`);
      const profileData = await profileRes.json();

      if (!profileData.success) {
        router.push('/');
        return;
      }

      setProfile(profileData.data);

      // 리뷰 조회
      fetchReviews(1);

      // 판매 상품 조회
      const postsRes = await fetch(`/api/users/${userId}/posts?limit=8`);
      const postsData = await postsRes.json();
      if (postsData.success) {
        setPosts(postsData.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (page: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/reviews?page=${page}&limit=10`);
      const data = await res.json();

      if (data.success) {
        if (page === 1) {
          setReviews(data.data.reviews);
        } else {
          setReviews((prev) => [...prev, ...data.data.reviews]);
        }
        setHasMoreReviews(data.data.pagination.page < data.data.pagination.totalPages);
        setReviewPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const loadMoreReviews = () => {
    fetchReviews(reviewPage + 1);
  };

  if (isLoading) return <LoadingPage />;
  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;

  // 평점별 개수 계산
  const ratingCounts = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return (
    <div className="container-app py-6 max-w-3xl">
      {/* 프로필 헤더 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* 프로필 이미지 */}
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profileImage || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.nickname?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* 프로필 정보 */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold">{profile.nickname}</h1>
                {profile.hasExcellentBadge && (
                  <Badge className="bg-yellow-500">
                    <Award className="h-3 w-3 mr-1" />
                    {language === 'ko' ? '우수 판매자' : '优秀卖家'}
                  </Badge>
                )}
                {profile.isBusinessVerified && (
                  <Badge variant="secondary">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {language === 'ko' ? '사업자' : '企业'}
                  </Badge>
                )}
              </div>

              {/* 통계 */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">
                    {profile.averageRating.toFixed(1)}
                  </span>
                  <span>({profile._count.receivedReviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>
                    {language === 'ko'
                      ? `${profile.totalSales}건 판매`
                      : `${profile.totalSales}笔交易`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {language === 'ko'
                      ? `${formatDate(profile.createdAt, 'ko').split(' ')[0]} 가입`
                      : `${formatDate(profile.createdAt, 'zh').split(' ')[0]} 加入`}
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              {!isOwnProfile && (
                <div className="flex gap-2 justify-center sm:justify-start">
                  <FollowButton userId={profile.id} />
                  <Link href={`/messages/${profile.id}`}>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '메시지' : '消息'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="reviews">
            {language === 'ko' ? '리뷰' : '评价'} ({profile._count.receivedReviews})
          </TabsTrigger>
          <TabsTrigger value="products">
            {language === 'ko' ? '판매 상품' : '在售商品'} ({profile._count.posts})
          </TabsTrigger>
        </TabsList>

        {/* 리뷰 탭 */}
        <TabsContent value="reviews" className="space-y-6">
          {/* 평점 요약 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {profile.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= Math.round(profile.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile._count.receivedReviews}{' '}
                    {language === 'ko' ? '개 리뷰' : '条评价'}
                  </p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${
                              ((ratingCounts[rating] || 0) / reviews.length) * 100 || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {ratingCounts[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 리뷰 목록 */}
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {language === 'ko' ? '아직 리뷰가 없습니다' : '暂无评价'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.reviewer.profileImage || undefined} />
                        <AvatarFallback>
                          {review.reviewer.nickname?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{review.reviewer.nickname}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-3 w-3',
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt, language)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 상품 정보 */}
                        {review.order?.post && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg">
                            {review.order.post.images[0] && (
                              <div className="relative w-10 h-10 rounded overflow-hidden">
                                <Image
                                  src={review.order.post.images[0]}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {language === 'zh' && review.order.post.titleZh
                                ? review.order.post.titleZh
                                : review.order.post.title}
                            </span>
                          </div>
                        )}

                        {/* 리뷰 내용 */}
                        {review.comment && (
                          <p className="mt-3 text-sm">{review.comment}</p>
                        )}

                        {/* 리뷰 이미지 */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, index) => (
                              <div
                                key={index}
                                className="relative w-16 h-16 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={img}
                                  alt={`Review image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* 더보기 버튼 */}
              {hasMoreReviews && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={loadMoreReviews}
                >
                  {language === 'ko' ? '더 보기' : '加载更多'}
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* 상품 탭 */}
        <TabsContent value="products">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {language === 'ko' ? '판매 중인 상품이 없습니다' : '暂无在售商品'}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-muted">
                      {post.images[0] ? (
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {post.status === 'SOLD_OUT' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {language === 'ko' ? '품절' : '已售'}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-2">
                        {language === 'zh' && post.titleZh
                          ? post.titleZh
                          : post.title}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ₩{post.priceKRW.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* 모든 상품 보기 */}
          {posts.length > 0 && (
            <Link href={`/search?sellerId=${profile.id}`}>
              <Button variant="outline" className="w-full mt-4">
                {language === 'ko' ? '모든 상품 보기' : '查看全部商品'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

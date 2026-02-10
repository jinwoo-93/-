'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowButton from '@/components/user/FollowButton';
import { useLanguage } from '@/hooks/useLanguage';
import { formatRelativeTime } from '@/lib/utils';

interface FollowUser {
  id: string;
  nickname: string;
  profileImage: string | null;
  hasExcellentBadge: boolean;
  isBusinessVerified: boolean;
  totalSales: number;
  averageRating: number;
  followedAt: string;
}

function FollowingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const defaultTab = searchParams.get('tab') || 'following';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFollows();
    }
  }, [status]);

  const fetchFollows = async () => {
    setIsLoading(true);
    try {
      const [followingRes, followersRes] = await Promise.all([
        fetch('/api/follow?type=following'),
        fetch('/api/follow?type=followers'),
      ]);

      const [followingData, followersData] = await Promise.all([
        followingRes.json(),
        followersRes.json(),
      ]);

      if (followingData.success) {
        setFollowing(followingData.data.users);
      }
      if (followersData.success) {
        setFollowers(followersData.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch follows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = (userId: string) => {
    setFollowing((prev) => prev.filter((u) => u.id !== userId));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container-app py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const renderUserCard = (user: FollowUser, showUnfollowAction: boolean = false) => (
    <div
      key={user.id}
      className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
    >
      <Link href={`/users/${user.id}`}>
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.profileImage || ''} />
          <AvatarFallback>{user.nickname?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/users/${user.id}`} className="hover:underline">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{user.nickname}</span>
            {user.hasExcellentBadge && (
              <Badge variant="excellent" className="text-xs">
                {language === 'ko' ? '우수' : '优秀'}
              </Badge>
            )}
            {user.isBusinessVerified && (
              <Badge variant="business" className="text-xs">
                {language === 'ko' ? '사업자' : '企业'}
              </Badge>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {user.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span>
            {user.totalSales} {language === 'ko' ? '거래' : '交易'}
          </span>
          <span className="text-xs">
            {formatRelativeTime(new Date(user.followedAt), language)}
          </span>
        </div>
      </div>

      <FollowButton
        userId={user.id}
        initialIsFollowing={showUnfollowAction}
        size="sm"
        onFollowChange={(isFollowing) => {
          if (!isFollowing && showUnfollowAction) {
            handleUnfollow(user.id);
          }
        }}
      />
    </div>
  );

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mypage">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === 'ko' ? '팔로우 관리' : '关注管理'}
          </h1>
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following">
            {language === 'ko' ? '팔로잉' : '关注中'} ({following.length})
          </TabsTrigger>
          <TabsTrigger value="followers">
            {language === 'ko' ? '팔로워' : '粉丝'} ({followers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="space-y-3">
          {following.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {language === 'ko' ? '팔로우하는 판매자가 없습니다' : '暂无关注的卖家'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ko'
                  ? '관심있는 판매자를 팔로우해보세요'
                  : '关注您感兴趣的卖家'}
              </p>
              <Link href="/posts">
                <Button className="mt-6">
                  {language === 'ko' ? '상품 둘러보기' : '浏览商品'}
                </Button>
              </Link>
            </div>
          ) : (
            following.map((user) => renderUserCard(user, true))
          )}
        </TabsContent>

        <TabsContent value="followers" className="space-y-3">
          {followers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {language === 'ko' ? '아직 팔로워가 없습니다' : '暂无粉丝'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ko'
                  ? '상품을 등록하고 활동하면 팔로워가 늘어납니다'
                  : '发布商品并积极活动以获得更多粉丝'}
              </p>
            </div>
          ) : (
            followers.map((user) => renderUserCard(user, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

export default function FollowingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FollowingContent />
    </Suspense>
  );
}

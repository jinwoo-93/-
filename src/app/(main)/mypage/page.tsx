'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  ShoppingBag,
  Star,
  Settings,
  ChevronRight,
  LogOut,
  Shield,
  Award,
  TrendingUp,
  Heart,
  Coins,
  Ticket,
  Clock,
  Users,
  Radio,
  ShoppingCart,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserType } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user: sessionUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (authLoading || isLoading) return <LoadingPage />;
  if (!user) return null;

  const menuItems = [
    {
      icon: Package,
      label: language === 'ko' ? '판매 관리' : '我的销售',
      href: '/mypage/sales',
      count: user.totalSales,
    },
    {
      icon: ShoppingBag,
      label: language === 'ko' ? '구매 내역' : '我的订单',
      href: '/mypage/orders',
      count: user.totalPurchases,
    },
    {
      icon: Star,
      label: language === 'ko' ? '받은 리뷰' : '我的评价',
      href: '/mypage/reviews',
    },
    {
      icon: Heart,
      label: language === 'ko' ? '찜 목록' : '收藏夹',
      href: '/mypage/wishlist',
    },
    {
      icon: Clock,
      label: language === 'ko' ? '최근 본 상품' : '最近浏览',
      href: '/mypage/recently-viewed',
    },
    {
      icon: Users,
      label: language === 'ko' ? '팔로잉' : '关注',
      href: '/mypage/following',
    },
    {
      icon: Coins,
      label: language === 'ko' ? '포인트' : '积分',
      href: '/mypage/points',
      highlight: true,
    },
    {
      icon: Ticket,
      label: language === 'ko' ? '쿠폰함' : '优惠券',
      href: '/mypage/coupons',
    },
    {
      icon: Radio,
      label: language === 'ko' ? '내 라이브' : '我的直播',
      href: '/live?my=true',
    },
    {
      icon: ShoppingCart,
      label: language === 'ko' ? '구매대행 요청' : '代购请求',
      href: '/purchase-requests?my=true',
    },
    {
      icon: TrendingUp,
      label: language === 'ko' ? '광고 관리' : '广告管理',
      href: '/mypage/ads',
    },
    {
      icon: Settings,
      label: language === 'ko' ? '설정' : '设置',
      href: '/mypage/settings',
    },
  ];

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 프로필 카드 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImage || ''} />
              <AvatarFallback className="text-lg">
                {user.nickname?.charAt(0) || user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.nickname || user.name}</h2>
                {user.hasExcellentBadge && (
                  <Badge variant="excellent">
                    {language === 'ko' ? '우수' : '优秀'}
                  </Badge>
                )}
                {user.isBusinessVerified && (
                  <Badge variant="business">
                    {language === 'ko' ? '사업자' : '企业'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {user.averageRating.toFixed(1)}
                </span>
                <span>
                  {user.totalSales + user.totalPurchases}{' '}
                  {language === 'ko' ? '거래' : '交易'}
                </span>
              </div>
            </div>
            <Link href="/mypage/profile">
              <Button variant="outline" size="sm">
                {language === 'ko' ? '프로필 수정' : '编辑资料'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 인증 상태 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'ko' ? '인증 상태' : '认证状态'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {language === 'ko' ? '휴대폰 인증' : '手机认证'}
            </span>
            {user.isPhoneVerified ? (
              <Badge variant="success">
                {language === 'ko' ? '완료' : '已完成'}
              </Badge>
            ) : (
              <Link href="/verify/phone">
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '인증하기' : '去认证'}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {language === 'ko' ? '본인 인증' : '实名认证'}
            </span>
            {user.isIdentityVerified ? (
              <Badge variant="success">
                {language === 'ko' ? '완료' : '已完成'}
              </Badge>
            ) : (
              <Link href="/verify/identity">
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '인증하기' : '去认证'}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {language === 'ko' ? '사업자 인증' : '企业认证'}
            </span>
            {user.isBusinessVerified ? (
              <Badge variant="success">
                {language === 'ko' ? '완료' : '已完成'}
              </Badge>
            ) : (
              <Link href="/verify/business">
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '인증하기' : '去认证'}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 우수 뱃지 조건 */}
      {!user.hasExcellentBadge && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              {language === 'ko' ? '우수 판매자 뱃지' : '优秀卖家徽章'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'ko'
                ? '다음 조건을 충족하면 우수 판매자 뱃지를 획득할 수 있습니다:'
                : '满足以下条件可获得优秀卖家徽章:'}
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                {user.totalSales >= 50 ? '✅' : '⬜'}{' '}
                {language === 'ko' ? '거래 완료 50건 이상' : '完成交易50笔以上'}
                <span className="text-muted-foreground">({user.totalSales}/50)</span>
              </li>
              <li className="flex items-center gap-2">
                {user.averageRating >= 4.8 ? '✅' : '⬜'}{' '}
                {language === 'ko' ? '평점 4.8점 이상' : '评分4.8分以上'}
                <span className="text-muted-foreground">
                  ({user.averageRating.toFixed(1)}/4.8)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {user.disputeRate < 0.05 ? '✅' : '⬜'}{' '}
                {language === 'ko' ? '분쟁률 5% 미만' : '争议率低于5%'}
                <span className="text-muted-foreground">
                  ({(user.disputeRate * 100).toFixed(1)}%/5%)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 메뉴 */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center justify-between p-4 hover:bg-muted transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* 로그아웃 */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('auth.logout')}
      </Button>
    </div>
  );
}

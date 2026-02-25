'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Package,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Star,
  Megaphone,
  Check,
  Trash2,
  Ship,
  Gift,
  Coins,
  TrendingUp,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { translate as t } from '@/lib/i18n';

interface Notification {
  id: string;
  type: 'ORDER' | 'PAYMENT' | 'SHIPPING' | 'DISPUTE' | 'REVIEW' | 'COUPON' | 'POINT' | 'SELLER' | 'SYSTEM';
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  priority?: 'high' | 'normal' | 'low';
  createdAt: string;
}

type FilterType = 'all' | Notification['type'];

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, authLoading]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = filteredNotifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);

      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
        )
      );

      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const readIds = filteredNotifications
        .filter((n) => n.isRead)
        .map((n) => n.id);

      await Promise.all(
        readIds.map((id) =>
          fetch(`/api/notifications/${id}`, { method: 'DELETE' })
        )
      );

      setNotifications((prev) => prev.filter((n) => !readIds.includes(n.id)));
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ORDER':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'SHIPPING':
        return <Ship className="h-5 w-5 text-cyan-500" />;
      case 'DISPUTE':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'REVIEW':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'COUPON':
        return <Gift className="h-5 w-5 text-pink-500" />;
      case 'POINT':
        return <Coins className="h-5 w-5 text-amber-500" />;
      case 'SELLER':
        return <TrendingUp className="h-5 w-5 text-indigo-500" />;
      case 'SYSTEM':
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority?: 'high' | 'normal' | 'low') => {
    if (!priority || priority === 'normal') return null;

    const config = {
      high: {
        color: 'destructive' as const,
        text: { ko: '긴급', zh: '紧急', en: 'Urgent' },
      },
      low: {
        color: 'secondary' as const,
        text: { ko: '일반', zh: '一般', en: 'Normal' },
      },
    };

    const { color, text } = config[priority];
    return (
      <Badge variant={color} className="ml-2 text-xs">
        {text[language]}
      </Badge>
    );
  };

  const getCategoryName = (type: FilterType) => {
    const names = {
      all: { ko: '전체', zh: '全部', en: 'All' },
      ORDER: { ko: '주문', zh: '订单', en: 'Order' },
      PAYMENT: { ko: '결제', zh: '支付', en: 'Payment' },
      SHIPPING: { ko: '배송', zh: '配送', en: 'Shipping' },
      DISPUTE: { ko: '분쟁', zh: '纠纷', en: 'Dispute' },
      REVIEW: { ko: '리뷰', zh: '评价', en: 'Review' },
      COUPON: { ko: '쿠폰', zh: '优惠券', en: 'Coupon' },
      POINT: { ko: '포인트', zh: '积分', en: 'Point' },
      SELLER: { ko: '판매자', zh: '卖家', en: 'Seller' },
      SYSTEM: { ko: '시스템', zh: '系统', en: 'System' },
    };
    return names[type][language];
  };

  if (authLoading || isLoading) return <LoadingPage />;

  // 필터링된 알림
  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;
  const readCount = filteredNotifications.filter((n) => n.isRead).length;

  // 카테고리별 카운트
  const categoryCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<Notification['type'], number>);

  const categories: FilterType[] = [
    'all',
    'ORDER',
    'PAYMENT',
    'SHIPPING',
    'REVIEW',
    'COUPON',
    'POINT',
    'SELLER',
    'DISPUTE',
    'SYSTEM',
  ];

  return (
    <div className="container-app py-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">
            {t('notification', 'notifications', language)}
            {unreadCount > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({unreadCount} {t('notification', 'unread', language)})
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {t('common', 'filter', language)}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              {t('notification', 'markAllRead', language)}
            </Button>
          )}
        </div>
      </div>

      {/* 필터 */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                {t('common', 'category', language)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const count =
                  cat === 'all'
                    ? notifications.length
                    : categoryCounts[cat as Notification['type']] || 0;

                if (count === 0 && cat !== 'all') return null;

                return (
                  <Button
                    key={cat}
                    variant={filter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className="gap-2"
                  >
                    {getCategoryName(cat)}
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 통계 바 */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-muted-foreground">
            {t('common', 'total', language)} {filteredNotifications.length}
            {t('common', 'count', language)} •{' '}
            {t('notification', 'unread', language)} {unreadCount}
            {t('common', 'count', language)}
          </p>
          {readCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={deleteAllRead}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('notification', 'deleteRead', language)}
            </Button>
          )}
        </div>
      )}

      {/* 알림 목록 */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">
              {t('notification', 'noNotifications', language)}
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === 'all'
                ? t('notification', 'noNotificationsDesc', language)
                : `${getCategoryName(filter)} ${t(
                    'notification',
                    'categoryEmpty',
                    language
                  )}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.isRead
                  ? 'bg-primary/5 border-primary/20'
                  : 'hover:bg-muted/30'
              }`}
            >
              <CardContent className="py-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <p
                            className={`font-medium ${
                              !notification.isRead ? 'text-primary' : ''
                            }`}
                          >
                            {notification.title}
                          </p>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                            title={t('notification', 'markRead', language)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                          title={t('common', 'delete', language)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(notification.createdAt, language)}</span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(notification.type)}
                        </Badge>
                      </div>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {t('common', 'viewDetails', language)}
                          <span className="text-xs">→</span>
                        </Link>
                      )}
                    </div>
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

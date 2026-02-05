'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  initialFollowerCount?: number;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
  className?: string;
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  size = 'default',
  variant = 'outline',
  showCount = false,
  onFollowChange,
  className,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 초기 팔로우 상태 확인
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const res = await fetch(`/api/follow/check?userId=${userId}`);
        const data = await res.json();

        if (data.success) {
          setIsFollowing(data.data.isFollowing);
          setFollowerCount(data.data.followerCount);
        }
      } catch (error) {
        console.error('Failed to check follow status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  // 자기 자신이면 버튼 숨김
  if (session?.user?.id === userId) {
    return null;
  }

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: language === 'ko' ? '로그인이 필요합니다' : '请先登录',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        setFollowerCount(data.data.followerCount);

        toast({
          title: data.data.isFollowing
            ? language === 'ko' ? '팔로우했습니다' : '关注成功'
            : language === 'ko' ? '팔로우를 취소했습니다' : '已取消关注',
        });

        onFollowChange?.(data.data.isFollowing, data.data.followerCount);
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

  if (isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          {language === 'ko' ? '팔로잉' : '已关注'}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          {language === 'ko' ? '팔로우' : '关注'}
        </>
      )}
      {showCount && followerCount > 0 && (
        <span className="ml-1 text-xs opacity-75">({followerCount})</span>
      )}
    </Button>
  );
}

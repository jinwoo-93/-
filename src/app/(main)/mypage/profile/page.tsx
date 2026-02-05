'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export default function ProfileEditPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    profileImage: '',
    introduction: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, authLoading]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      if (data.success) {
        setFormData({
          nickname: data.data.nickname || '',
          phone: data.data.phone || '',
          profileImage: data.data.profileImage || '',
          introduction: data.data.introduction || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '프로필이 저장되었습니다' : '资料已保存',
        });
        router.push('/mypage');
      } else {
        toast({
          title: data.error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

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

      <h1 className="text-xl font-bold mb-6">
        {language === 'ko' ? '프로필 수정' : '编辑资料'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* 프로필 이미지 */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profileImage} />
                  <AvatarFallback className="text-2xl">
                    {formData.nickname?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ko' ? '프로필 사진 변경' : '更换头像'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ko' ? '기본 정보' : '基本信息'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '닉네임' : '昵称'}
              </label>
              <Input
                value={formData.nickname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                }
                className="mt-1"
                placeholder={language === 'ko' ? '닉네임 입력' : '输入昵称'}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '연락처' : '联系方式'}
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1"
                placeholder={language === 'ko' ? '연락처 입력' : '输入联系方式'}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '자기소개' : '个人简介'}
              </label>
              <textarea
                value={formData.introduction}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, introduction: e.target.value }))
                }
                className="w-full mt-1 h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder={
                  language === 'ko'
                    ? '자기소개를 입력하세요'
                    : '请输入个人简介'
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving
            ? (language === 'ko' ? '저장 중...' : '保存中...')
            : (language === 'ko' ? '저장하기' : '保存')}
        </Button>
      </form>
    </div>
  );
}

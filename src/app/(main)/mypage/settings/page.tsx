'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, DollarSign, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
    messageAlerts: true,
    marketingEmails: false,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    // 다크모드 상태 확인
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setIsLoading(false);
  }, [isAuthenticated, authLoading]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: language === 'ko' ? '설정이 저장되었습니다' : '设置已保存',
    });
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
        {language === 'ko' ? '설정' : '设置'}
      </h1>

      {/* 언어/통화 설정 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '언어 및 통화' : '语言和货币'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{language === 'ko' ? '언어' : '语言'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '앱 표시 언어' : '应用显示语言'}
                </p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ko' | 'zh')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{language === 'ko' ? '통화' : '货币'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '가격 표시 통화' : '价格显示货币'}
                </p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'KRW' | 'CNY')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="KRW">₩ KRW</option>
              <option value="CNY">¥ CNY</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 테마 설정 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '테마' : '主题'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {language === 'ko' ? '다크 모드' : '深色模式'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '어두운 화면 테마 사용' : '使用深色主题'}
                </p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {language === 'ko' ? '알림 설정' : '通知设置'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {language === 'ko' ? '푸시 알림' : '推送通知'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '앱 푸시 알림 받기' : '接收应用推送通知'}
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleSettingChange('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {language === 'ko' ? '이메일 알림' : '邮件通知'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '이메일로 알림 받기' : '接收邮件通知'}
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleSettingChange('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {language === 'ko' ? '주문 알림' : '订单通知'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '주문 상태 변경 알림' : '订单状态变更通知'}
              </p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={() => handleSettingChange('orderUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {language === 'ko' ? '메시지 알림' : '消息通知'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '새 메시지 알림' : '新消息通知'}
              </p>
            </div>
            <Switch
              checked={settings.messageAlerts}
              onCheckedChange={() => handleSettingChange('messageAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {language === 'ko' ? '마케팅 이메일' : '营销邮件'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '프로모션 및 이벤트 안내' : '促销和活动信息'}
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={() => handleSettingChange('marketingEmails')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '계정 관리' : '账户管理'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            {language === 'ko' ? '비밀번호 변경' : '修改密码'}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            {language === 'ko' ? '연결된 계정 관리' : '管理关联账户'}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            {language === 'ko' ? '계정 삭제' : '删除账户'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Save,
  ImagePlus,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface SellerSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  businessNumber: string | null;
  businessName: string | null;
  profileImage: string | null;
  nickname: string;
  introduction: string;
  notificationEmail: boolean;
  notificationOrder: boolean;
  notificationSettlement: boolean;
}

export default function SellerSettingsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState<SellerSettings>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    businessNumber: null,
    businessName: null,
    profileImage: null,
    nickname: '',
    introduction: '',
    notificationEmail: true,
    notificationOrder: true,
    notificationSettlement: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      fetchSettings();
    }
  }, [authLoading, isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/seller/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/seller/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '설정이 저장되었습니다' : '设置已保存',
        });
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
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
    <div className="space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ko' ? '판매자 설정' : '卖家设置'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {language === 'ko'
            ? '판매자 정보 및 알림 설정을 관리합니다'
            : '管理卖家信息和通知设置'}
        </p>
      </div>

      {/* 프로필 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" />
            {language === 'ko' ? '프로필' : '个人资料'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 프로필 이미지 */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={settings.profileImage || undefined} />
              <AvatarFallback className="text-2xl">
                {settings.nickname?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <ImagePlus className="w-4 h-4 mr-2" />
                {language === 'ko' ? '이미지 변경' : '更换图片'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                {language === 'ko'
                  ? 'JPG, PNG 파일 (최대 5MB)'
                  : 'JPG, PNG 文件 (最大5MB)'}
              </p>
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '닉네임' : '昵称'}
            </label>
            <Input
              value={settings.nickname}
              onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
              placeholder={language === 'ko' ? '닉네임을 입력하세요' : '请输入昵称'}
              className="mt-1"
            />
          </div>

          {/* 소개 */}
          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '판매자 소개' : '卖家介绍'}
            </label>
            <textarea
              value={settings.introduction}
              onChange={(e) => setSettings({ ...settings, introduction: e.target.value })}
              rows={4}
              placeholder={language === 'ko' ? '자기소개를 입력하세요' : '请输入自我介绍'}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 사업자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {language === 'ko' ? '사업자 정보' : '商家信息'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <Shield className="w-5 h-5" />
            <span>
              {language === 'ko'
                ? '사업자 인증은 관리자 승인이 필요합니다'
                : '商家认证需要管理员审核'}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '사업자 등록번호' : '营业执照号'}
            </label>
            <Input
              value={settings.businessNumber || ''}
              onChange={(e) => setSettings({ ...settings, businessNumber: e.target.value })}
              placeholder={language === 'ko' ? '000-00-00000' : '请输入营业执照号'}
              className="mt-1"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ko'
                ? '사업자 정보 변경은 고객센터로 문의하세요'
                : '如需修改商家信息，请联系客服'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '상호명' : '商号'}
            </label>
            <Input
              value={settings.businessName || ''}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder={language === 'ko' ? '상호명을 입력하세요' : '请输入商号'}
              className="mt-1"
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* 정산 계좌 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {language === 'ko' ? '정산 계좌 정보' : '结算账户信息'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {language === 'ko'
              ? '정산금은 등록된 계좌로 자동 입금됩니다'
              : '结算金额将自动转入已注册账户'}
          </div>

          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '은행명' : '银行名称'}
            </label>
            <select
              value={settings.bankName}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{language === 'ko' ? '은행 선택' : '选择银行'}</option>
              <option value="KB">KB국민은행</option>
              <option value="SH">신한은행</option>
              <option value="WR">우리은행</option>
              <option value="IBK">IBK기업은행</option>
              <option value="NH">NH농협은행</option>
              <option value="ICBC">{language === 'ko' ? '중국공상은행' : '工商银行'}</option>
              <option value="ABC">{language === 'ko' ? '중국농업은행' : '农业银行'}</option>
              <option value="BOC">{language === 'ko' ? '중국은행' : '中国银行'}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '계좌번호' : '账号'}
            </label>
            <Input
              value={settings.accountNumber}
              onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
              placeholder={language === 'ko' ? '계좌번호를 입력하세요' : '请输入账号'}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              {language === 'ko' ? '예금주' : '户名'}
            </label>
            <Input
              value={settings.accountHolder}
              onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
              placeholder={language === 'ko' ? '예금주명을 입력하세요' : '请输入户名'}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {language === 'ko' ? '알림 설정' : '通知设置'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-sm">
                {language === 'ko' ? '이메일 알림' : '邮件通知'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'ko'
                  ? '중요한 공지사항을 이메일로 받습니다'
                  : '接收重要公告邮件'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationEmail}
              onChange={(e) =>
                setSettings({ ...settings, notificationEmail: e.target.checked })
              }
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-sm">
                {language === 'ko' ? '주문 알림' : '订单通知'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'ko'
                  ? '새로운 주문 발생 시 알림을 받습니다'
                  : '接收新订单通知'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationOrder}
              onChange={(e) =>
                setSettings({ ...settings, notificationOrder: e.target.checked })
              }
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-sm">
                {language === 'ko' ? '정산 알림' : '结算通知'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'ko'
                  ? '정산 완료 시 알림을 받습니다'
                  : '接收结算完成通知'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSettlement}
              onChange={(e) =>
                setSettings({ ...settings, notificationSettlement: e.target.checked })
              }
              className="w-5 h-5"
            />
          </label>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving
            ? language === 'ko'
              ? '저장 중...'
              : '保存中...'
            : language === 'ko'
            ? '변경사항 저장'
            : '保存更改'}
        </Button>
      </div>
    </div>
  );
}

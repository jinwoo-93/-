'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  DollarSign,
  Truck,
  Bell,
  Shield,
  Loader2,
  Save,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

type SettingCategory = 'PLATFORM' | 'PAYMENT' | 'SHIPPING' | 'NOTIFICATION' | 'SECURITY';

const categoryConfig = {
  PLATFORM: {
    icon: Settings,
    label: '플랫폼 설정',
    labelZh: '平台设置',
    settings: [
      { key: 'platform.businessFee', label: '사업자 수수료율 (%)', type: 'number', defaultValue: '3' },
      { key: 'platform.sellerFee', label: '일반 판매자 수수료율 (%)', type: 'number', defaultValue: '5' },
      { key: 'platform.minOrderAmount', label: '최소 주문 금액 (KRW)', type: 'number', defaultValue: '5000' },
      { key: 'platform.maintenanceMode', label: '점검 모드', type: 'boolean', defaultValue: 'false' },
      { key: 'platform.manualExchangeRate', label: '환율 수동 설정 여부', type: 'boolean', defaultValue: 'false' },
      { key: 'platform.manualExchangeRateValue', label: '수동 환율 (CNY→KRW)', type: 'number', defaultValue: '180' },
    ],
  },
  PAYMENT: {
    icon: DollarSign,
    label: '결제 설정',
    labelZh: '支付设置',
    settings: [
      { key: 'payment.timeout', label: '결제 타임아웃 (분)', type: 'number', defaultValue: '30' },
      { key: 'payment.autoRefundDays', label: '자동 환불 기준 (일)', type: 'number', defaultValue: '7' },
      { key: 'payment.tossEnabled', label: 'TossPayments 활성화', type: 'boolean', defaultValue: 'true' },
      { key: 'payment.alipayEnabled', label: 'Alipay 활성화', type: 'boolean', defaultValue: 'true' },
    ],
  },
  SHIPPING: {
    icon: Truck,
    label: '배송 설정',
    labelZh: '配送设置',
    settings: [
      { key: 'shipping.defaultFee', label: '기본 배송비 (KRW)', type: 'number', defaultValue: '3000' },
      { key: 'shipping.freeShippingThreshold', label: '무료 배송 기준 (KRW)', type: 'number', defaultValue: '50000' },
      { key: 'shipping.estimatedDays', label: '배송 예상 소요일', type: 'number', defaultValue: '7' },
      { key: 'shipping.autoConfirmDays', label: '자동 구매확정 기간 (일)', type: 'number', defaultValue: '7' },
    ],
  },
  NOTIFICATION: {
    icon: Bell,
    label: '알림 설정',
    labelZh: '通知设置',
    settings: [
      { key: 'notification.orderEmail', label: '주문 알림 이메일', type: 'text', defaultValue: 'orders@example.com' },
      { key: 'notification.adminEmail', label: '관리자 알림 이메일', type: 'text', defaultValue: 'admin@example.com' },
      { key: 'notification.smsEnabled', label: 'SMS 발송 활성화', type: 'boolean', defaultValue: 'false' },
      { key: 'notification.slackWebhook', label: 'Slack Webhook URL', type: 'text', defaultValue: '' },
    ],
  },
  SECURITY: {
    icon: Shield,
    label: '보안 설정',
    labelZh: '安全设置',
    settings: [
      { key: 'security.loginAttempts', label: '로그인 시도 제한', type: 'number', defaultValue: '5' },
      { key: 'security.sessionTimeout', label: '세션 타임아웃 (분)', type: 'number', defaultValue: '60' },
      { key: 'security.require2FA', label: '관리자 2단계 인증 필수', type: 'boolean', defaultValue: 'false' },
      { key: 'security.ipWhitelist', label: 'IP 화이트리스트 (쉼표 구분)', type: 'text', defaultValue: '' },
    ],
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingCategory>('PLATFORM');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const isKorean = language === 'ko';

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchSettings();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.success) {
        const settingsMap: Record<string, string> = {};
        data.data.forEach((setting: SystemSetting) => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(settingsMap);
        setOriginalSettings(settingsMap);
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
      const changedSettings = Object.keys(settings).filter(
        (key) => settings[key] !== originalSettings[key]
      );

      for (const key of changedSettings) {
        const category = key.split('.')[0].toUpperCase() as SettingCategory;
        await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            value: settings[key],
            category,
          }),
        });
      }

      alert('설정이 저장되었습니다.');
      setOriginalSettings({ ...settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const getValue = (key: string, defaultValue: string) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const hasChanges = () => {
    return Object.keys(settings).some((key) => settings[key] !== originalSettings[key]);
  };

  if (authLoading || isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isKorean ? '시스템 설정' : '系统设置'}</h1>
          <p className="text-gray-600 mt-1">
            {isKorean ? '플랫폼 운영 설정을 관리합니다.' : '管理平台运营设置'}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              저장
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingCategory)}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(categoryConfig).map(([categoryKey, config]) => (
          <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                {config.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <label className="block font-medium mb-1">{setting.label}</label>
                      <p className="text-sm text-gray-500">Key: {setting.key}</p>
                    </div>
                    <div className="w-64">
                      {setting.type === 'boolean' ? (
                        <select
                          value={getValue(setting.key, setting.defaultValue)}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="true">활성화</option>
                          <option value="false">비활성화</option>
                        </select>
                      ) : setting.type === 'number' ? (
                        <input
                          type="number"
                          value={getValue(setting.key, setting.defaultValue)}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <input
                          type="text"
                          value={getValue(setting.key, setting.defaultValue)}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

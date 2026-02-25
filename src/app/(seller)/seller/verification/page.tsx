'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  FileText,
  Building,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface VerificationData {
  country: 'KR' | 'CN';
  isIdentityVerified: boolean;
  identityVerifiedAt: string | null;
  isBusinessVerified: boolean;
  businessVerifiedAt: string | null;
  businessNumber: string | null;
  businessName: string | null;
  businessLicenseUrl: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

export default function SellerVerificationPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사업자 인증 폼
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');

  // 계좌 정보
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      fetchVerificationData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchVerificationData = async () => {
    try {
      const response = await fetch('/api/seller/verification');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        // 기존 데이터로 폼 초기화
        if (result.data.businessNumber) setBusinessNumber(result.data.businessNumber);
        if (result.data.businessName) setBusinessName(result.data.businessName);
        if (result.data.businessLicenseUrl)
          setBusinessLicenseUrl(result.data.businessLicenseUrl);
        if (result.data.bankName) setBankName(result.data.bankName);
        if (result.data.accountNumber) setAccountNumber(result.data.accountNumber);
        if (result.data.accountHolder) setAccountHolder(result.data.accountHolder);
      }
    } catch (error) {
      console.error('Failed to fetch verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessLicenseUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'businessLicense');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setBusinessLicenseUrl(result.data.url);
        toast({
          title: language === 'ko' ? '사업자등록증이 업로드되었습니다' : '营业执照已上传',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: language === 'ko' ? '업로드 중 오류가 발생했습니다' : '上传失败',
        variant: 'destructive',
      });
    }
  };

  const handleBusinessVerification = async () => {
    if (!businessNumber || !businessName) {
      toast({
        title:
          language === 'ko'
            ? '사업자 정보를 모두 입력해주세요'
            : '请填写完整的企业信息',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/seller/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType: 'business',
          businessNumber,
          businessName,
          businessLicenseUrl,
          bankName,
          accountNumber,
          accountHolder,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: result.message,
        });
        fetchVerificationData();
      } else {
        throw new Error(result.error?.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: error.message || '인증 처리 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;
  if (!data) return null;

  const isKorean = data.country === 'KR';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          {language === 'ko' ? '판매자 인증' : '卖家认证'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {language === 'ko'
            ? '판매를 시작하려면 사업자 인증이 필요합니다'
            : '开始销售需要完成企业认证'}
        </p>
      </div>

      {/* 인증 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '인증 현황' : '认证状态'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">
                {language === 'ko' ? '신분 인증' : '身份认证'}
              </span>
            </div>
            {data.isIdentityVerified ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{language === 'ko' ? '완료' : '已完成'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{language === 'ko' ? '미인증' : '未认证'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">
                {language === 'ko' ? '사업자 인증' : '企业认证'}
              </span>
            </div>
            {data.isBusinessVerified ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{language === 'ko' ? '완료' : '已完成'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{language === 'ko' ? '필수' : '必需'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 사업자 인증 */}
      {!data.isBusinessVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'ko' ? '사업자 인증' : '企业认证'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                {isKorean ? (
                  <>
                    <strong>한국 판매자:</strong> 사업자등록번호와 상호명을 입력해주세요.
                    (예: 123-45-67890)
                  </>
                ) : (
                  <>
                    <strong>中国卖家：</strong>请输入统一社会信用代码和企业名称（18位）
                  </>
                )}
              </p>
            </div>

            {/* 사업자 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isKorean ? '사업자등록번호' : '统一社会信用代码'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  placeholder={isKorean ? '123-45-67890' : '91110000XXXXXXXXXX'}
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  maxLength={isKorean ? 12 : 18}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isKorean ? '상호명' : '企业名称'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  placeholder={isKorean ? '(주)회사명' : '公司名称'}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isKorean ? '사업자등록증' : '营业执照'}
                  <span className="text-gray-500 ml-1">(선택)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {businessLicenseUrl ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {language === 'ko' ? '업로드 완료' : '已上传'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        {language === 'ko'
                          ? '파일을 선택하거나 드래그하세요'
                          : '选择文件或拖放'}
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBusinessLicenseFile(file);
                            handleBusinessLicenseUpload(file);
                          }
                        }}
                        className="hidden"
                        id="license-upload"
                      />
                      <label htmlFor="license-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>{language === 'ko' ? '파일 선택' : '选择文件'}</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 계좌 정보 */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {language === 'ko' ? '정산 계좌 정보' : '结算账户信息'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ko' ? '은행명' : '银行名称'}
                </label>
                <Input
                  placeholder={isKorean ? '국민은행' : '中国工商银行'}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ko' ? '계좌번호' : '账号'}
                </label>
                <Input
                  placeholder={isKorean ? '1234567890' : '6222020200001234567'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ko' ? '예금주' : '账户名'}
                </label>
                <Input
                  placeholder={isKorean ? '홍길동' : '张三'}
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <Button
              onClick={handleBusinessVerification}
              disabled={isSubmitting || !businessNumber || !businessName}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'ko' ? '인증 처리 중...' : '认证中...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  {language === 'ko' ? '인증 신청' : '提交认证'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 인증 완료 */}
      {data.isBusinessVerified && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-bold text-green-900">
                {language === 'ko' ? '인증이 완료되었습니다!' : '认证已完成！'}
              </h3>
              <p className="text-sm text-green-700">
                {language === 'ko'
                  ? '이제 상품을 등록하고 판매를 시작할 수 있습니다.'
                  : '现在可以开始注册商品并进行销售。'}
              </p>
              <div className="pt-4">
                <Button onClick={() => router.push('/posts/create')}>
                  {language === 'ko' ? '상품 등록하러 가기' : '注册商品'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

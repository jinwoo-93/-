'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  User,
  AlertTriangle,
  Lightbulb,
  Settings,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'ORDER', icon: Package, nameKo: '주문/결제', nameZh: '订单/支付' },
  { id: 'SHIPPING', icon: Truck, nameKo: '배송', nameZh: '配送' },
  { id: 'REFUND', icon: CreditCard, nameKo: '환불/취소', nameZh: '退款/取消' },
  { id: 'ACCOUNT', icon: User, nameKo: '계정', nameZh: '账户' },
  { id: 'TECHNICAL', icon: Settings, nameKo: '기술 문제', nameZh: '技术问题' },
  { id: 'REPORT', icon: AlertTriangle, nameKo: '신고', nameZh: '举报' },
  { id: 'SUGGESTION', icon: Lightbulb, nameKo: '제안/건의', nameZh: '建议/意见' },
  { id: 'OTHER', icon: HelpCircle, nameKo: '기타', nameZh: '其他' },
];

function ContactContent() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: searchParams.get('category') || '',
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    subject: '',
    content: '',
    orderId: searchParams.get('orderId') || '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setTicketId(result.data.id);
      } else {
        setError(result.error?.message || '문의 등록에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-app max-w-xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ko' ? '문의가 접수되었습니다' : '咨询已受理'}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === 'ko'
                ? '빠른 시일 내에 답변 드리겠습니다.'
                : '我们会尽快回复您。'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">
                {language === 'ko' ? '접수번호' : '受理编号'}
              </p>
              <p className="font-mono font-semibold">{ticketId}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/help">
                <Button variant="outline">
                  {language === 'ko' ? '고객센터 홈' : '客服中心首页'}
                </Button>
              </Link>
              {session && (
                <Link href="/help/tickets">
                  <Button>
                    {language === 'ko' ? '내 문의 내역' : '我的咨询记录'}
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/help" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ko' ? '고객센터' : '客服中心'}
          </Link>
          <h1 className="text-2xl font-bold">
            {language === 'ko' ? '1:1 문의하기' : '一对一咨询'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ko'
              ? '궁금한 점이나 문제가 있으시면 문의해 주세요.'
              : '如有疑问或问题，请咨询我们。'}
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            {/* 문의 유형 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {language === 'ko' ? '문의 유형' : '咨询类型'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <cat.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">
                      {language === 'ko' ? cat.nameKo : cat.nameZh}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '이름' : '姓名'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={language === 'ko' ? '이름을 입력해 주세요' : '请输入姓名'}
                required
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '이메일' : '邮箱'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={language === 'ko' ? '답변 받으실 이메일' : '接收回复的邮箱'}
                required
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '연락처' : '联系电话'} ({language === 'ko' ? '선택' : '选填'})
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={language === 'ko' ? '연락 가능한 전화번호' : '可联系的电话号码'}
              />
            </div>

            {/* 주문번호 */}
            {(formData.category === 'ORDER' || formData.category === 'SHIPPING' || formData.category === 'REFUND') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ko' ? '주문번호' : '订单编号'} ({language === 'ko' ? '선택' : '选填'})
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={language === 'ko' ? '관련 주문번호가 있다면 입력해 주세요' : '如有相关订单编号，请输入'}
                />
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '제목' : '标题'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={language === 'ko' ? '문의 제목을 입력해 주세요' : '请输入咨询标题'}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '문의 내용' : '咨询内容'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={language === 'ko'
                  ? '문의 내용을 자세히 작성해 주세요. (최소 10자)'
                  : '请详细描述您的问题。（至少10个字）'}
                required
                minLength={10}
              />
            </div>

            {/* 첨부파일 (추후 구현) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ko' ? '첨부파일' : '附件'} ({language === 'ko' ? '선택' : '选填'})
              </label>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                {language === 'ko' ? '파일 첨부 (최대 5MB)' : '添加附件（最大5MB）'}
              </button>
            </div>

            {/* 안내 */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p>
                {language === 'ko'
                  ? '• 문의 접수 후 영업일 기준 1-2일 내에 답변 드립니다.'
                  : '• 收到咨询后，我们会在1-2个工作日内回复。'}
              </p>
              <p>
                {language === 'ko'
                  ? '• 긴급한 문의는 카카오톡 상담 또는 전화 상담을 이용해 주세요.'
                  : '• 紧急咨询请使用카카오톡或电话咨询。'}
              </p>
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !formData.category || !formData.name || !formData.email || !formData.subject || formData.content.length < 10}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'ko' ? '접수 중...' : '提交中...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {language === 'ko' ? '문의 접수' : '提交咨询'}
                </span>
              )}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContactContent />
    </Suspense>
  );
}

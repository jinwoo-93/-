'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Headphones,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  Loader2,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

const contactFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  content: z.string().min(10, '최소 10자 이상 입력해주세요').max(2000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const CATEGORIES = [
  { value: 'account', labelKo: '계정/회원가입', labelZh: '账户/注册' },
  { value: 'order', labelKo: '주문/결제', labelZh: '订单/支付' },
  { value: 'shipping', labelKo: '배송', labelZh: '配送' },
  { value: 'refund', labelKo: '환불/반품', labelZh: '退款/退货' },
  { value: 'dispute', labelKo: '분쟁', labelZh: '争议' },
  { value: 'seller', labelKo: '판매자 관련', labelZh: '卖家相关' },
  { value: 'other', labelKo: '기타', labelZh: '其他' },
];

const CONTACT_INFO = [
  {
    icon: Phone,
    titleKo: '전화 상담',
    titleZh: '电话咨询',
    detailKo: '한국: 1588-0000\n중국: 400-000-0000',
    detailZh: '韩国：1588-0000\n中国：400-000-0000',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Mail,
    titleKo: '이메일 문의',
    titleZh: '邮件咨询',
    detailKo: 'support@jikguyeokgu.com',
    detailZh: 'support@jikguyeokgu.com',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Clock,
    titleKo: '운영 시간',
    titleZh: '营业时间',
    detailKo: '평일 09:00 - 18:00\n(주말/공휴일 휴무)',
    detailZh: '工作日 09:00 - 18:00\n（周末及节假日休息）',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: MapPin,
    titleKo: '주소',
    titleZh: '地址',
    detailKo: '서울특별시 강남구\n테헤란로 123, 10층',
    detailZh: '首尔特别市江南区\n德黑兰路123号10楼',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function ContactContent() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      category: '',
      content: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // API 연동 전 임시 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      toast({
        title: language === 'ko' ? '문의가 접수되었습니다' : '咨询已受理',
      });
    } catch {
      toast({
        title: language === 'ko' ? '문의 접수에 실패했습니다' : '咨询提交失败',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb
        items={[{ labelKo: '고객센터', labelZh: '客服中心' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
          <Headphones className="h-5 w-5 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold">
          {language === 'ko' ? '고객센터' : '客服中心'}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        {language === 'ko'
          ? '궁금한 점이나 도움이 필요하시면 언제든 문의해주세요'
          : '如有疑问或需要帮助，请随时联系我们'}
      </p>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CONTACT_INFO.map((info, index) => {
          const Icon = info.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full ${info.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-5 w-5 ${info.color}`} />
                </div>
                <h3 className="font-semibold text-xs mb-1">
                  {language === 'ko' ? info.titleKo : info.titleZh}
                </h3>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {language === 'ko' ? info.detailKo : info.detailZh}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Quick Link */}
      <Card className="mb-8 bg-muted/50">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">
                {language === 'ko'
                  ? '자주 묻는 질문에서 빠르게 답변을 찾아보세요'
                  : '在常见问题中快速找到答案'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ko'
                  ? '많은 질문이 FAQ에서 해결됩니다'
                  : '很多问题可以在FAQ中找到答案'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/faq">
              FAQ
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {language === 'ko' ? '1:1 문의하기' : '在线客服'}
            </h2>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ko'
                  ? '문의가 접수되었습니다!'
                  : '咨询已受理！'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'ko'
                  ? '빠른 시일 내에 이메일로 답변 드리겠습니다.\n평균 응답 시간: 영업일 기준 1-2일'
                  : '我们将尽快通过邮件回复。\n平均响应时间：工作日1-2天'}
              </p>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                {language === 'ko' ? '추가 문의하기' : '继续咨询'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {language === 'ko' ? '이름 *' : '姓名 *'}
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder={language === 'ko' ? '이름을 입력하세요' : '请输入姓名'}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {language === 'ko' ? '이메일 *' : '邮箱 *'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder={language === 'ko' ? 'email@example.com' : 'email@example.com'}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  {language === 'ko' ? '문의 카테고리 *' : '咨询类别 *'}
                </Label>
                <select
                  id="category"
                  {...register('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">
                    {language === 'ko' ? '카테고리를 선택하세요' : '请选择类别'}
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {language === 'ko' ? cat.labelKo : cat.labelZh}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  {language === 'ko' ? '문의 내용 *' : '咨询内容 *'}
                </Label>
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder={
                    language === 'ko'
                      ? '문의 내용을 자세히 작성해주세요 (최소 10자)'
                      : '请详细描述您的问题（至少10个字）'
                  }
                  rows={6}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ko' ? '제출 중...' : '提交中...'}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {language === 'ko' ? '문의 보내기' : '发送咨询'}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Response Time Notice */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            {language === 'ko'
              ? '문의 접수 후 영업일 기준 1-2일 이내에 답변을 드립니다. 긴급한 문의는 전화 상담을 이용해주세요.'
              : '咨询受理后将在1-2个工作日内回复。紧急咨询请使用电话咨询。'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  Send,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface ProductQA {
  id: string;
  postId: string;
  userId: string;
  question: string;
  questionZh: string | null;
  answer: string | null;
  answerZh: string | null;
  isPrivate: boolean;
  status: 'PENDING' | 'ANSWERED' | 'DELETED';
  createdAt: string;
  answeredAt: string | null;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
    country: 'KR' | 'CN';
  };
  post: {
    id: string;
    title: string;
    titleZh: string | null;
    images: string[];
  };
}

interface Stats {
  total: number;
  pending: number;
  answered: number;
}

export default function SellerQAPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [qas, setQas] = useState<ProductQA[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, answered: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'pending' | 'answered'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerTextZh, setAnswerTextZh] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      fetchQAs();
    }
  }, [authLoading, isAuthenticated, status, page]);

  const fetchQAs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/seller/qa?page=${page}&limit=20&status=${status}`
      );
      const data = await response.json();

      if (data.success) {
        setQas(data.data.qas);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch Q&As:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (qaId: string) => {
    if (!answerText.trim()) {
      toast({
        title: language === 'ko' ? '답변을 입력해주세요' : '请输入答复',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingId(qaId);
    try {
      const response = await fetch(`/api/qa/${qaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answerText,
          answerZh: answerTextZh || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '답변이 등록되었습니다' : '答复已提交',
        });
        setAnsweringId(null);
        setAnswerText('');
        setAnswerTextZh('');
        fetchQAs();
      } else {
        throw new Error(data.error?.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Answer submit error:', error);
      toast({
        title: language === 'ko' ? '답변 등록 중 오류가 발생했습니다' : '提交答复时出错',
        variant: 'destructive',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ko' ? '상품 문의 관리' : '商品咨询管理'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {language === 'ko'
            ? '고객 문의에 신속하게 답변하세요'
            : '快速回复客户咨询'}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'ko' ? '전체 문의' : '总咨询'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">
                  {language === 'ko' ? '답변 대기' : '待回复'}
                </p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">
                  {language === 'ko' ? '답변 완료' : '已回复'}
                </p>
                <p className="text-2xl font-bold text-green-900">{stats.answered}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
        <button
          onClick={() => {
            setStatus('all');
            setPage(1);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
            status === 'all'
              ? 'bg-black text-white'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          {language === 'ko' ? '전체' : '全部'}
        </button>
        <button
          onClick={() => {
            setStatus('pending');
            setPage(1);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
            status === 'pending'
              ? 'bg-black text-white'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          {language === 'ko' ? '답변 대기' : '待回复'}
        </button>
        <button
          onClick={() => {
            setStatus('answered');
            setPage(1);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
            status === 'answered'
              ? 'bg-black text-white'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          {language === 'ko' ? '답변 완료' : '已回复'}
        </button>
      </div>

      {/* Q&A 목록 */}
      <div className="space-y-4">
        {qas.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {language === 'ko' ? '문의가 없습니다' : '暂无咨询'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          qas.map((qa) => (
            <Card key={qa.id} className="overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {/* 상품 정보 */}
                <Link
                  href={`/posts/${qa.post.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {qa.post.images?.[0] ? (
                      <Image
                        src={qa.post.images[0]}
                        alt={qa.post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {language === 'ko' ? qa.post.title : qa.post.titleZh || qa.post.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'ko' ? '상품 문의' : '商品咨询'}
                    </p>
                  </div>
                </Link>

                {/* 구분선 */}
                <div className="border-t" />

                {/* 질문 */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {qa.user.nickname}
                      </span>
                      {qa.isPrivate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          <EyeOff className="w-3 h-3" />
                          {language === 'ko' ? '비공개' : '私密'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {formatDate(qa.createdAt, language)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 pl-9">
                    {language === 'ko' ? qa.question : qa.questionZh || qa.question}
                  </p>
                </div>

                {/* 답변 또는 답변 입력 폼 */}
                {qa.status === 'ANSWERED' && qa.answer ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {language === 'ko' ? '답변 완료' : '已回复'}
                      </span>
                      <span className="text-xs text-blue-600 ml-auto">
                        {qa.answeredAt && formatDate(qa.answeredAt, language)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-900">
                      {language === 'ko' ? qa.answer : qa.answerZh || qa.answer}
                    </p>
                  </div>
                ) : answeringId === qa.id ? (
                  <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">
                        {language === 'ko' ? '답변 (한국어)' : '回复 (韩语)'}
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={3}
                        placeholder={
                          language === 'ko'
                            ? '답변을 입력하세요'
                            : '请输入回复'
                        }
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">
                        {language === 'ko' ? '답변 (중국어)' : '回复 (中文)'}
                      </label>
                      <textarea
                        value={answerTextZh}
                        onChange={(e) => setAnswerTextZh(e.target.value)}
                        rows={3}
                        placeholder={
                          language === 'ko'
                            ? '중국어 답변을 입력하세요 (선택사항)'
                            : '请输入中文回复（可选）'
                        }
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAnswerSubmit(qa.id)}
                        disabled={submittingId === qa.id || !answerText.trim()}
                      >
                        {submittingId === qa.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'ko' ? '등록 중...' : '提交中...'}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {language === 'ko' ? '답변 등록' : '提交回复'}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAnsweringId(null);
                          setAnswerText('');
                          setAnswerTextZh('');
                        }}
                      >
                        {language === 'ko' ? '취소' : '取消'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAnsweringId(qa.id);
                        setAnswerText('');
                        setAnswerTextZh('');
                      }}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {language === 'ko' ? '답변하기' : '回复'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {language === 'ko' ? '이전' : '上一页'}
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {language === 'ko' ? '다음' : '下一页'}
          </Button>
        </div>
      )}
    </div>
  );
}

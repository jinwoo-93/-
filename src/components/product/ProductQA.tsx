'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Lock,
  Unlock,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime } from '@/lib/utils';

interface QAUser {
  id: string;
  nickname: string;
  profileImage: string | null;
  hasExcellentBadge: boolean;
  isBusinessVerified: boolean;
}

interface QAItem {
  id: string;
  postId: string;
  userId: string;
  question: string;
  questionZh?: string;
  isPrivate: boolean;
  answer?: string;
  answerZh?: string;
  answeredAt?: string;
  answeredBy?: string;
  status: 'PENDING' | 'ANSWERED' | 'DELETED';
  createdAt: string;
  user: QAUser | null;
  answerer: QAUser | null;
}

interface ProductQAProps {
  postId: string;
  sellerId: string;
  className?: string;
}

export default function ProductQA({ postId, sellerId, className }: ProductQAProps) {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [qas, setQAs] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [question, setQuestion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const isSeller = session?.user?.id === sellerId;

  useEffect(() => {
    fetchQAs();
  }, [postId, page]);

  const fetchQAs = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/qa?page=${page}&limit=10`);
      const data = await res.json();

      if (data.success) {
        if (page === 1) {
          setQAs(data.data.qas);
        } else {
          setQAs((prev) => [...prev, ...data.data.qas]);
        }
        setTotal(data.data.pagination.total);
        setHasMore(page < data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch Q&A:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!session) {
      toast({
        title: language === 'ko' ? '로그인이 필요합니다' : '请先登录',
        variant: 'destructive',
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: language === 'ko' ? '질문 내용을 입력해주세요' : '请输入问题内容',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, isPrivate }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '문의가 등록되었습니다' : '问题已提交',
        });
        setQuestion('');
        setIsPrivate(false);
        setPage(1);
        fetchQAs();
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
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (qaId: string) => {
    if (!answerText.trim()) {
      toast({
        title: language === 'ko' ? '답변 내용을 입력해주세요' : '请输入回答内容',
        variant: 'destructive',
      });
      return;
    }

    setAnsweringId(qaId);

    try {
      const res = await fetch(`/api/qa/${qaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '답변이 등록되었습니다' : '回答已提交',
        });
        setAnswerText('');
        setExpandedQA(null);
        fetchQAs();
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
      setAnsweringId(null);
    }
  };

  const handleDeleteQA = async (qaId: string) => {
    if (!confirm(language === 'ko' ? '문의를 삭제하시겠습니까?' : '确定要删除这个问题吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/qa/${qaId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '삭제되었습니다' : '已删除',
        });
        setQAs((prev) => prev.filter((qa) => qa.id !== qaId));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {language === 'ko' ? '상품 문의' : '商品咨询'}
          </div>
          <Badge variant="secondary">{total}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 질문 입력 폼 */}
        <div className="space-y-3">
          <Textarea
            placeholder={
              language === 'ko'
                ? '상품에 대해 궁금한 점을 질문해주세요.'
                : '请输入您对商品的疑问'
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="private-mode"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private-mode" className="text-sm flex items-center gap-1">
                {isPrivate ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
                {language === 'ko' ? '비공개 문의' : '私密提问'}
              </Label>
            </div>
            <Button onClick={handleSubmitQuestion} disabled={isSubmitting || !question.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              {language === 'ko' ? '문의하기' : '提交问题'}
            </Button>
          </div>
        </div>

        {/* Q&A 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : qas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'ko' ? '등록된 문의가 없습니다' : '暂无商品咨询'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qas.map((qa) => (
              <QAItem
                key={qa.id}
                qa={qa}
                isSeller={isSeller}
                isOwner={session?.user?.id === qa.userId}
                language={language}
                expanded={expandedQA === qa.id}
                onToggle={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}
                answerText={answerText}
                onAnswerChange={setAnswerText}
                onSubmitAnswer={() => handleSubmitAnswer(qa.id)}
                isAnswering={answeringId === qa.id}
                onDelete={() => handleDeleteQA(qa.id)}
              />
            ))}
          </div>
        )}

        {/* 더 보기 */}
        {hasMore && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setPage((p) => p + 1)}
          >
            {language === 'ko' ? '더 보기' : '加载更多'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function QAItem({
  qa,
  isSeller,
  isOwner,
  language,
  expanded,
  onToggle,
  answerText,
  onAnswerChange,
  onSubmitAnswer,
  isAnswering,
  onDelete,
}: {
  qa: QAItem;
  isSeller: boolean;
  isOwner: boolean;
  language: string;
  expanded: boolean;
  onToggle: () => void;
  answerText: string;
  onAnswerChange: (text: string) => void;
  onSubmitAnswer: () => void;
  isAnswering: boolean;
  onDelete: () => void;
}) {
  const questionText = language === 'zh' && qa.questionZh ? qa.questionZh : qa.question;
  const answerTextContent = language === 'zh' && qa.answerZh ? qa.answerZh : qa.answer;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 질문 */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={qa.user?.profileImage || ''} />
              <AvatarFallback>
                {qa.user?.nickname?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{qa.user?.nickname || '익명'}</span>
                {qa.isPrivate && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-2.5 w-2.5 mr-1" />
                    {language === 'ko' ? '비공개' : '私密'}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(qa.createdAt), language)}
                </span>
              </div>
              <p className="text-sm mt-1">{questionText}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {qa.status === 'ANSWERED' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {language === 'ko' ? '답변완료' : '已回答'}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {language === 'ko' ? '답변대기' : '待回答'}
              </Badge>
            )}
            {(isOwner || isSeller) && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 답변 */}
      {qa.answer && (
        <div className="p-4 border-t bg-blue-50/30">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={qa.answerer?.profileImage || ''} />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {qa.answerer?.nickname || (language === 'ko' ? '판매자' : '卖家')}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {language === 'ko' ? '판매자' : '卖家'}
                </Badge>
                {qa.answeredAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(qa.answeredAt), language)}
                  </span>
                )}
              </div>
              <p className="text-sm mt-1">{answerTextContent}</p>
            </div>
          </div>
        </div>
      )}

      {/* 답변 입력 (판매자용) */}
      {isSeller && !qa.answer && (
        <div className="p-4 border-t">
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-sm text-primary font-medium"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {language === 'ko' ? '답변하기' : '回答'}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              <Textarea
                placeholder={language === 'ko' ? '답변을 입력해주세요' : '请输入您的回答'}
                value={answerText}
                onChange={(e) => onAnswerChange(e.target.value)}
                rows={3}
              />
              <Button onClick={onSubmitAnswer} disabled={isAnswering || !answerText.trim()}>
                {isAnswering && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {language === 'ko' ? '답변 등록' : '提交回答'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Languages } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  translatedContent?: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
    nationality: 'KR' | 'CN';
  };
}

interface DisputeCommentsProps {
  disputeId: string;
}

export function DisputeComments({ disputeId }: DisputeCommentsProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState<{ [key: string]: boolean }>({});
  const [translating, setTranslating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchComments();
  }, [disputeId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/disputes/${disputeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setNewComment('');
        toast({
          title: language === 'ko' ? '댓글이 작성되었습니다' : '评论已发表',
        });
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '오류가 발생했습니다' : '发生错误'),
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

  const handleTranslate = async (commentId: string, content: string) => {
    if (showTranslation[commentId]) {
      // 이미 번역이 표시되어 있으면 토글
      setShowTranslation((prev) => ({ ...prev, [commentId]: false }));
      return;
    }

    // 캐시된 번역이 있으면 바로 표시
    const comment = comments.find((c) => c.id === commentId);
    if (comment?.translatedContent) {
      setShowTranslation((prev) => ({ ...prev, [commentId]: true }));
      return;
    }

    // 번역 요청
    setTranslating((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          targetLang: language === 'ko' ? 'KO' : 'ZH',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 번역 결과 저장
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, translatedContent: data.data.translatedText } : c
          )
        );
        setShowTranslation((prev) => ({ ...prev, [commentId]: true }));
      } else {
        toast({
          title: language === 'ko' ? '번역 실패' : '翻译失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '번역 중 오류가 발생했습니다' : '翻译时发生错误',
        variant: 'destructive',
      });
    } finally {
      setTranslating((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // 댓글 작성자의 국적과 현재 사용자의 언어가 다른 경우 자동 번역 필요
  const needsTranslation = (comment: Comment) => {
    if (language === 'ko') {
      return comment.user.nationality === 'CN';
    } else {
      return comment.user.nationality === 'KR';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5" />
          {language === 'ko' ? '댓글' : '评论'} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            placeholder={
              language === 'ko'
                ? '의견을 남겨주세요. 건설적인 의견은 분쟁 해결에 도움이 됩니다.'
                : '留下您的意见。建设性意见有助于解决纠纷。'
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting
                ? language === 'ko'
                  ? '작성 중...'
                  : '发表中...'
                : language === 'ko'
                ? '댓글 작성'
                : '发表评论'}
            </Button>
          </div>
        </form>

        {/* 댓글 목록 */}
        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {language === 'ko' ? '댓글을 불러오는 중...' : '加载评论中...'}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {language === 'ko'
              ? '아직 댓글이 없습니다. 첫 댓글을 작성해보세요!'
              : '还没有评论。来写第一条评论吧！'}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isTranslated = showTranslation[comment.id];
              const isTranslating = translating[comment.id];
              const shouldShowTranslateButton = needsTranslation(comment);

              return (
                <div key={comment.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.user.profileImage || ''} />
                      <AvatarFallback className="text-xs">
                        {comment.user.nickname?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user.nickname}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.user.nationality === 'KR' ? '🇰🇷' : '🇨🇳'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt, language)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {isTranslated && comment.translatedContent ? (
                          <div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-2 rounded mb-2">
                              {comment.translatedContent}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {language === 'ko' ? '원문:' : '原文:'} {comment.content}
                            </div>
                          </div>
                        ) : (
                          comment.content
                        )}
                      </div>
                      {shouldShowTranslateButton && (
                        <button
                          onClick={() => handleTranslate(comment.id, comment.content)}
                          disabled={isTranslating}
                          className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                          <Languages className="h-3 w-3" />
                          {isTranslating
                            ? language === 'ko'
                              ? '번역 중...'
                              : '翻译中...'
                            : isTranslated
                            ? language === 'ko'
                              ? '원문 보기'
                              : '查看原文'
                            : language === 'ko'
                            ? '한국어로 번역'
                            : '翻译成中文'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

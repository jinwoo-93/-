'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/lib/utils';

interface Conversation {
  partner_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  partner: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, authLoading]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  return (
    <div className="container-app py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('nav.messages')}</h1>

      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.partner_id} href={`/messages/${conv.partner_id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={conv.partner?.profileImage || ''} />
                      <AvatarFallback>
                        {conv.partner?.nickname?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{conv.partner?.nickname}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(conv.created_at, language)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                          {conv.content}
                        </p>
                        {!conv.is_read && (
                          <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ko' ? '메시지가 없습니다.' : '暂无消息'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

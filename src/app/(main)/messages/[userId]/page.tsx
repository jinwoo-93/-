'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  content: string;
  images: string[];
  createdAt: string;
  sender: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

interface Partner {
  id: string;
  nickname: string;
  profileImage: string | null;
  hasExcellentBadge: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [params.userId, isAuthenticated, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${params.userId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        setPartner(data.data.partner);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: params.userId,
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '메시지 전송에 실패했습니다' : '发送失败',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)]">
      {/* 헤더 */}
      <div className="border-b p-4 flex items-center gap-4 bg-background">
        <Link href="/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        {partner && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={partner.profileImage || ''} />
              <AvatarFallback>{partner.nickname?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{partner.nickname}</span>
                {partner.hasExcellentBadge && (
                  <Badge variant="excellent" className="text-xs">
                    {language === 'ko' ? '우수' : '优秀'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMe = message.senderId === user?.id;
          return (
            <div
              key={message.id}
              className={cn('flex gap-3', isMe && 'flex-row-reverse')}
            >
              {!isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender?.profileImage || ''} />
                  <AvatarFallback>
                    {message.sender?.nickname?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2',
                  isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {formatRelativeTime(message.createdAt, language)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            placeholder={language === 'ko' ? '메시지를 입력하세요...' : '输入消息...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

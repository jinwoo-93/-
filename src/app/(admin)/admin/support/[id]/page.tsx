'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
  Tag,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SupportTicket {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  category: string;
  subject: string;
  content: string;
  attachments: string[];
  status: string;
  priority: string;
  orderId: string | null;
  userId: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  responses: {
    id: string;
    responderId: string;
    isAdmin: boolean;
    content: string;
    attachments: string[];
    createdAt: string;
  }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: '접수', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '처리 중', color: 'bg-yellow-100 text-yellow-700' },
  WAITING_REPLY: { label: '답변 대기', color: 'bg-purple-100 text-purple-700' },
  RESOLVED: { label: '해결됨', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: '종료', color: 'bg-gray-100 text-gray-700' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: '낮음', color: 'bg-gray-100 text-gray-600' },
  NORMAL: { label: '보통', color: 'bg-blue-100 text-blue-600' },
  HIGH: { label: '높음', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: '긴급', color: 'bg-red-100 text-red-600' },
};

const categoryLabels: Record<string, string> = {
  ORDER: '주문/결제',
  SHIPPING: '배송',
  REFUND: '환불/취소',
  ACCOUNT: '계정',
  TECHNICAL: '기술 문제',
  REPORT: '신고',
  SUGGESTION: '제안/건의',
  OTHER: '기타',
};

export default function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseContent, setResponseContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/admin/support/${id}`);
      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendResponse = async () => {
    if (!responseContent.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/support/${id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: responseContent }),
      });

      const result = await response.json();

      if (result.success) {
        setResponseContent('');
        fetchTicket();
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">문의를 찾을 수 없습니다.</p>
        <Link href="/admin/support">
          <Button className="mt-4">목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{ticket.subject}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusConfig[ticket.status]?.color}>
              {statusConfig[ticket.status]?.label}
            </Badge>
            <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
            <Badge className={priorityConfig[ticket.priority]?.color}>
              {priorityConfig[ticket.priority]?.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 문의 내용 및 대화 */}
        <div className="col-span-2 space-y-4">
          {/* 원본 문의 */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{ticket.name}</span>
                  <span className="text-sm text-gray-500">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{ticket.content}</p>
                </div>
                {ticket.attachments.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {ticket.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        첨부파일 {index + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 응답 목록 */}
          {ticket.responses.map((response) => (
            <Card
              key={response.id}
              className={cn("p-6", response.isAdmin ? "bg-blue-50 border-blue-200" : "")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    response.isAdmin ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <User className={cn("w-5 h-5", response.isAdmin ? "text-white" : "text-gray-600")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {response.isAdmin ? '관리자' : ticket.name}
                    </span>
                    {response.isAdmin && (
                      <Badge className="bg-blue-600 text-white text-xs">Admin</Badge>
                    )}
                    <span className="text-sm text-gray-500">{formatDate(response.createdAt)}</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{response.content}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* 답변 입력 */}
          {ticket.status !== 'CLOSED' && (
            <Card className="p-4">
              <textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows={4}
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleSendResponse}
                  disabled={!responseContent.trim() || isSending}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      전송 중...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      답변 보내기
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* 사이드바 - 문의 정보 */}
        <div className="space-y-4">
          {/* 문의자 정보 */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">문의자 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{ticket.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${ticket.email}`} className="text-blue-600 hover:underline">
                  {ticket.email}
                </a>
              </div>
              {ticket.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${ticket.phone}`} className="text-blue-600 hover:underline">
                    {ticket.phone}
                  </a>
                </div>
              )}
              {ticket.orderId && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <Link href={`/admin/orders/${ticket.orderId}`} className="text-blue-600 hover:underline">
                    {ticket.orderId}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* 상태 변경 */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">상태 변경</h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleUpdateStatus(key)}
                  disabled={isUpdating || ticket.status === key}
                  className={cn(
                    "w-full p-2 rounded-lg text-left text-sm transition-all",
                    ticket.status === key
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </Card>

          {/* 우선순위 변경 */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">우선순위</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(priorityConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleUpdatePriority(key)}
                  disabled={isUpdating || ticket.priority === key}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    ticket.priority === key
                      ? config.color.replace('100', '600') + ' text-white'
                      : config.color
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </Card>

          {/* 시간 정보 */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">시간 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>접수: {formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>최근 업데이트: {formatDate(ticket.updatedAt)}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>해결: {formatDate(ticket.resolvedAt)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

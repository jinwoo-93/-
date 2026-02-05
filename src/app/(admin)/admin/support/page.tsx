'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  Clock,
  User,
  Mail,
  Phone,
  Package,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  RefreshCw,
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
  status: string;
  priority: string;
  orderId: string | null;
  userId: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { responses: number };
  responses: { createdAt: string; isAdmin: boolean }[];
}

interface Stats {
  OPEN: number;
  IN_PROGRESS: number;
  WAITING_REPLY: number;
  RESOLVED: number;
  CLOSED: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: '접수', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '처리 중', color: 'bg-yellow-100 text-yellow-700' },
  WAITING_REPLY: { label: '답변 대기', color: 'bg-purple-100 text-purple-700' },
  RESOLVED: { label: '해결됨', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: '종료', color: 'bg-gray-100 text-gray-700' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: '낮음', color: 'text-gray-500' },
  NORMAL: { label: '보통', color: 'text-blue-500' },
  HIGH: { label: '높음', color: 'text-orange-500' },
  URGENT: { label: '긴급', color: 'text-red-500' },
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

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.category) params.set('category', filter.category);
      if (filter.priority) params.set('priority', filter.priority);
      params.set('page', page.toString());

      const response = await fetch(`/api/admin/support?${params}`);
      const result = await response.json();

      if (result.success) {
        setTickets(result.data.tickets);
        setStats(result.data.stats);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter.status, filter.category, filter.priority, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">고객 문의 관리</h2>
        <Button onClick={fetchTickets} variant="outline" size="sm">
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* 상태별 통계 */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter({ ...filter, status: filter.status === key ? '' : key })}
              className={cn(
                "p-4 rounded-lg border text-center transition-all",
                filter.status === key ? "ring-2 ring-blue-500" : "hover:border-gray-300"
              )}
            >
              <p className="text-2xl font-bold">{stats[key as keyof Stats] || 0}</p>
              <p className="text-sm text-gray-500">{config.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* 필터 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="검색 (이름, 이메일, 제목)"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">전체 유형</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">전체 우선순위</option>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* 문의 목록 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">문의가 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* 상태 표시 */}
                  <div className="flex-shrink-0">
                    {ticket.status === 'OPEN' ? (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : ticket.status === 'RESOLVED' ? (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                    )}
                  </div>

                  {/* 문의 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusConfig[ticket.status]?.color}>
                        {statusConfig[ticket.status]?.label}
                      </Badge>
                      <Badge variant="outline">
                        {categoryLabels[ticket.category]}
                      </Badge>
                      {ticket.priority !== 'NORMAL' && (
                        <span className={cn("text-xs font-medium", priorityConfig[ticket.priority]?.color)}>
                          [{priorityConfig[ticket.priority]?.label}]
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold truncate">{ticket.subject}</h3>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {ticket.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {ticket.email}
                      </span>
                      {ticket.orderId && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {ticket.orderId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-500">{formatDate(ticket.createdAt)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      답변 {ticket._count.responses}개
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "px-4 py-2 rounded-lg",
                page === p ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

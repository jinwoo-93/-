'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { CircularProgress } from './CircularProgress';
import { formatDate } from '@/lib/utils';

interface ActiveDispute {
  id: string;
  reason: string;
  description: string;
  votesForBuyer: number;
  votesForSeller: number;
  buyerPercent: number;
  sellerPercent: number;
  totalVotes: number;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    buyer: {
      id: string;
      nickname: string;
      profileImage: string | null;
    };
    seller: {
      id: string;
      nickname: string;
      profileImage: string | null;
    };
  };
}

interface ActiveDisputesListProps {
  limit?: number;
}

export function ActiveDisputesList({ limit = 4 }: ActiveDisputesListProps) {
  const { language } = useLanguage();
  const [disputes, setDisputes] = useState<ActiveDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveDisputes();
  }, [limit]);

  const fetchActiveDisputes = async () => {
    try {
      const response = await fetch(`/api/disputes/active?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setDisputes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch active disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full mb-4" />
            <div className="flex items-center justify-center">
              <div className="w-[120px] h-[120px] bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          {language === 'ko'
            ? '현재 진행 중인 분쟁이 없습니다'
            : '目前没有进行中的纠纷'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {disputes.map((dispute) => (
        <Link
          key={dispute.id}
          href={`/disputes/${dispute.id}`}
          className="border border-gray-200 hover:border-gray-300 transition-colors p-5 group"
        >
          {/* 분쟁 제목 */}
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-black mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {dispute.reason}
            </h3>
            <p className="text-[12px] text-muted-foreground line-clamp-2">
              {dispute.description}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {formatDate(dispute.createdAt, language)}
            </p>
          </div>

          {/* 투표 현황 */}
          <div className="flex items-center justify-between">
            {/* 원형 그래프 */}
            <div className="flex justify-center flex-1">
              <CircularProgress
                buyerPercent={dispute.buyerPercent}
                sellerPercent={dispute.sellerPercent}
                size={100}
              />
            </div>

            {/* 투표 상세 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {language === 'ko' ? '구매자' : '买家'}
                    </span>
                    <span className="text-[12px] font-bold text-blue-600">
                      {dispute.buyerPercent}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {dispute.votesForBuyer} {language === 'ko' ? '표' : '票'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {language === 'ko' ? '판매자' : '卖家'}
                    </span>
                    <span className="text-[12px] font-bold text-red-600">
                      {dispute.sellerPercent}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {dispute.votesForSeller} {language === 'ko' ? '표' : '票'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-muted-foreground">
                  {language === 'ko' ? '총 투표:' : '总票数:'}{' '}
                  <span className="font-bold text-black">{dispute.totalVotes}</span>
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

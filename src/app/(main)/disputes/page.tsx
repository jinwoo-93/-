'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { CircularProgress } from '@/components/dispute/CircularProgress';
import { formatDate } from '@/lib/utils';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  votesForBuyer: number;
  votesForSeller: number;
  buyerPercent: number;
  sellerPercent: number;
  totalVotes: number;
  status: string;
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

export default function DisputesPage() {
  const { language } = useLanguage();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'voting' | 'resolved'>('voting');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/disputes/active?limit=20`);
      const data = await response.json();
      if (data.success) {
        setDisputes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-app py-6">
      <Breadcrumb
        items={[
          { labelKo: '분쟁 조정', labelZh: '纠纷调解' },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black mb-2 flex items-center gap-2">
          <Scale className="h-6 w-6" />
          {language === 'ko' ? '분쟁 조정' : '纠纷调解'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'ko'
            ? '커뮤니티 투표로 공정하게 해결되는 분쟁 목록입니다'
            : '通过社区投票公平解决的纠纷列表'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setFilter('voting')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'voting'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          {language === 'ko' ? '진행 중' : '进行中'}
        </button>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-4" />
              <div className="flex items-center justify-center">
                <div className="w-[100px] h-[100px] bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-400 mb-2">
            {language === 'ko' ? '진행 중인 분쟁이 없습니다' : '没有进行中的纠纷'}
          </p>
          <p className="text-sm text-gray-400">
            {language === 'ko'
              ? '분쟁이 발생하면 이곳에 표시됩니다'
              : '发生纠纷时将在此处显示'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputes.map((dispute) => (
            <Link
              key={dispute.id}
              href={`/disputes/${dispute.id}`}
              className="border border-gray-200 hover:border-gray-300 transition-colors p-5 group"
            >
              {/* 분쟁 제목 */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-black mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {dispute.reason}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {dispute.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
                        <span className="text-xs text-muted-foreground">
                          {language === 'ko' ? '구매자' : '买家'}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {dispute.buyerPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dispute.votesForBuyer} {language === 'ko' ? '표' : '票'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {language === 'ko' ? '판매자' : '卖家'}
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {dispute.sellerPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dispute.votesForSeller} {language === 'ko' ? '표' : '票'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">
                      {language === 'ko' ? '총 투표:' : '总票数:'}{' '}
                      <span className="font-bold text-black">{dispute.totalVotes}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Star,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  country: string;
  userType: string;
  isPhoneVerified: boolean;
  isBusinessVerified: boolean;
  hasExcellentBadge: boolean;
  totalSales: number;
  totalPurchases: number;
  averageRating: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { language } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    // CSV 내보내기
    const headers = ['이메일', '닉네임', '국가', '가입일', '거래수', '평점'];
    const csvData = filteredUsers.map(user => [
      user.email,
      user.nickname,
      user.country === 'KR' ? '한국' : '중국',
      formatDate(user.createdAt, language),
      user.totalSales + user.totalPurchases,
      user.averageRating.toFixed(1),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'verified') return matchesSearch && user.isBusinessVerified;
    if (filter === 'excellent') return matchesSearch && user.hasExcellentBadge;
    if (filter === 'korea') return matchesSearch && user.country === 'KR';
    if (filter === 'china') return matchesSearch && user.country === 'CN';
    if (filter === 'highActivity') {
      return matchesSearch && (user.totalSales + user.totalPurchases) >= 10;
    }
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'trades') {
      return (b.totalSales + b.totalPurchases) - (a.totalSales + a.totalPurchases);
    }
    if (sortBy === 'rating') {
      return b.averageRating - a.averageRating;
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '회원 관리' : '用户管理'}
          </h1>
          <Badge variant="outline">{users.length} {language === 'ko' ? '명' : '人'}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">전체 회원</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">한국 회원</div>
            <div className="text-2xl font-bold">
              {users.filter(u => u.country === 'KR').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">중국 회원</div>
            <div className="text-2xl font-bold">
              {users.filter(u => u.country === 'CN').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">사업자 인증</div>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isBusinessVerified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ko' ? '닉네임 또는 이메일 검색' : '搜索昵称或邮箱'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">전체</option>
              <option value="verified">사업자 인증</option>
              <option value="excellent">우수 판매자</option>
              <option value="korea">한국</option>
              <option value="china">중국</option>
              <option value="highActivity">활발한 회원 (10+ 거래)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="createdAt">가입일 순</option>
              <option value="trades">거래 많은 순</option>
              <option value="rating">평점 높은 순</option>
            </select>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setFilter('all')}
            >
              전체: {users.length}
            </Badge>
            <Badge
              variant="default"
              className="cursor-pointer hover:bg-blue-600"
              onClick={() => setFilter('verified')}
            >
              사업자: {users.filter(u => u.isBusinessVerified).length}
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => setFilter('excellent')}
            >
              우수 판매자: {users.filter(u => u.hasExcellentBadge).length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    회원
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    국가
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    인증
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    거래
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    평점
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    가입일
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImage || ''} />
                          <AvatarFallback>
                            {user.nickname?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.nickname}</p>
                            {user.hasExcellentBadge && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            {user.userType === 'ADMIN' && (
                              <Badge variant="destructive" className="text-xs">관리자</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {user.country === 'KR' ? '🇰🇷 KR' : '🇨🇳 CN'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.isPhoneVerified && (
                          <Badge variant="secondary" className="text-xs">
                            휴대폰
                          </Badge>
                        )}
                        {user.isBusinessVerified && (
                          <Badge variant="default" className="text-xs">
                            사업자
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">
                        {user.totalSales + user.totalPurchases}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">건</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {user.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(user.createdAt, language).split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
              총 {filteredUsers.length}명의 회원
            </div>
          )}
        </CardContent>
      </Card>

      {/* 회원 상세 모달 */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        onUpdate={fetchUsers}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Shield,
  Star,
  Ban,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDate } from '@/lib/utils';

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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
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

  if (authLoading || isLoading) return <LoadingPage />;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'verified') return matchesSearch && user.isBusinessVerified;
    if (filter === 'excellent') return matchesSearch && user.hasExcellentBadge;
    if (filter === 'korea') return matchesSearch && user.country === 'KR';
    if (filter === 'china') return matchesSearch && user.country === 'CN';
    return matchesSearch;
  });

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '회원 관리' : '用户管理'}
          </h1>
        </div>
        <Badge variant="outline">{users.length} {language === 'ko' ? '명' : '人'}</Badge>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
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
              <option value="all">{language === 'ko' ? '전체' : '全部'}</option>
              <option value="verified">{language === 'ko' ? '사업자 인증' : '企业认证'}</option>
              <option value="excellent">{language === 'ko' ? '우수 판매자' : '优秀卖家'}</option>
              <option value="korea">{language === 'ko' ? '한국' : '韩国'}</option>
              <option value="china">{language === 'ko' ? '중국' : '中国'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '회원' : '用户'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '국가' : '国家'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '인증' : '认证'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '거래' : '交易'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '평점' : '评分'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '가입일' : '注册日期'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
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
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {user.country === 'KR' ? '🇰🇷 KR' : '🇨🇳 CN'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {user.isPhoneVerified && (
                          <Badge variant="secondary" className="text-xs">
                            {language === 'ko' ? '휴대폰' : '手机'}
                          </Badge>
                        )}
                        {user.isBusinessVerified && (
                          <Badge variant="default" className="text-xs">
                            {language === 'ko' ? '사업자' : '企业'}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {user.totalSales + user.totalPurchases}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{user.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt, language).split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {language === 'ko' ? '검색 결과가 없습니다' : '没有搜索结果'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

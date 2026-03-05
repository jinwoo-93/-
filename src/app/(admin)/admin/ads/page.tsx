'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Megaphone,
  Plus,
  Eye,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface Advertisement {
  id: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  status: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  budget: number | null;
  spent: number;
  targetCountry: string | null;
  targetUserType: string | null;
  createdAt: string;
}

export default function AdsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleZh: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    placement: 'HOME_BANNER',
    startDate: '',
    endDate: '',
    budget: '',
    targetCountry: '',
    targetUserType: '',
  });

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/admin/ads?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchAds();
    }
  }, [authLoading, isAuthenticated, isAdmin, fetchAds, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAd
        ? `/api/admin/ads/${editingAd.id}`
        : '/api/admin/ads';
      const method = editingAd ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingAd
            ? (language === 'ko' ? '광고가 수정되었습니다' : '广告已修改')
            : (language === 'ko' ? '광고가 생성되었습니다' : '广告已创建'),
        });
        setIsModalOpen(false);
        resetForm();
        fetchAds();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '상태가 변경되었습니다' : '状态已更改',
        });
        fetchAds();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : '确定要删除吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '광고가 삭제되었습니다' : '广告已删除',
        });
        fetchAds();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      titleZh: ad.titleZh || '',
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      placement: ad.placement,
      startDate: ad.startDate.split('T')[0],
      endDate: ad.endDate.split('T')[0],
      budget: ad.budget?.toString() || '',
      targetCountry: ad.targetCountry || '',
      targetUserType: ad.targetUserType || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      titleZh: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      placement: 'HOME_BANNER',
      startDate: '',
      endDate: '',
      budget: '',
      targetCountry: '',
      targetUserType: '',
    });
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const statusMap: Record<string, { ko: string; zh: string; color: string }> = {
    DRAFT: { ko: '초안', zh: '草稿', color: 'bg-gray-100 text-gray-800' },
    SCHEDULED: { ko: '예약', zh: '已排期', color: 'bg-blue-100 text-blue-800' },
    ACTIVE: { ko: '게재중', zh: '投放中', color: 'bg-green-100 text-green-800' },
    PAUSED: { ko: '일시정지', zh: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
    ENDED: { ko: '종료', zh: '已结束', color: 'bg-red-100 text-red-800' },
  };

  const placementMap: Record<string, { ko: string; zh: string }> = {
    HOME_BANNER: { ko: '메인 배너', zh: '主页横幅' },
    HOME_SIDEBAR: { ko: '메인 사이드바', zh: '主页侧边栏' },
    CATEGORY_TOP: { ko: '카테고리 상단', zh: '分类顶部' },
    SEARCH_RESULTS: { ko: '검색 결과', zh: '搜索结果' },
    POST_DETAIL: { ko: '상품 상세', zh: '商品详情' },
  };

  const stats = {
    total: ads.length,
    active: ads.filter(a => a.status === 'ACTIVE').length,
    totalImpressions: ads.reduce((sum, a) => sum + a.impressions, 0),
    totalClicks: ads.reduce((sum, a) => sum + a.clicks, 0),
    avgCTR: ads.length > 0
      ? (ads.reduce((sum, a) => sum + (a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0), 0) / ads.length).toFixed(2)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '광고 관리' : '广告管理'}
          </h1>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ko' ? '광고 생성' : '创建广告'}
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '전체 광고' : '总广告'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600 mb-1">
                {language === 'ko' ? '게재중' : '投放中'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '총 노출' : '总曝光'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalImpressions.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '총 클릭' : '总点击'}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '평균 CTR' : '平均 CTR'}
              </p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgCTR}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === 'ko' ? '전체' : '全部'}</option>
              <option value="DRAFT">{language === 'ko' ? '초안' : '草稿'}</option>
              <option value="SCHEDULED">{language === 'ko' ? '예약' : '已排期'}</option>
              <option value="ACTIVE">{language === 'ko' ? '게재중' : '投放中'}</option>
              <option value="PAUSED">{language === 'ko' ? '일시정지' : '已暂停'}</option>
              <option value="ENDED">{language === 'ko' ? '종료' : '已结束'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 광고 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    광고
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    게재 위치
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    기간
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    성과
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    상태
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16">
                          <Image
                            src={ad.imageUrl}
                            alt={ad.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {ad.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {language === 'ko'
                          ? placementMap[ad.placement]?.ko
                          : placementMap[ad.placement]?.zh}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {new Date(ad.startDate).toLocaleDateString()} ~
                      </p>
                      <p className="text-sm">
                        {new Date(ad.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="w-4 h-4 text-purple-600" />
                          <span>{ad.clicks.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({ad.impressions > 0
                            ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                            : 0}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusMap[ad.status]?.color}>
                        {language === 'ko'
                          ? statusMap[ad.status]?.ko
                          : statusMap[ad.status]?.zh}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(ad)}
                        >
                          수정
                        </Button>
                        {ad.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(ad.id, 'PAUSED')}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {ad.status === 'PAUSED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(ad.id, 'ACTIVE')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ads.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'ko' ? '광고가 없습니다' : '暂无广告'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성/수정 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAd
                ? (language === 'ko' ? '광고 수정' : '修改广告')
                : (language === 'ko' ? '광고 생성' : '创建广告')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{language === 'ko' ? '제목 (한국어)' : '标题（韩语）'}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>{language === 'ko' ? '제목 (중국어)' : '标题（中文）'}</Label>
              <Input
                value={formData.titleZh}
                onChange={(e) => setFormData({ ...formData, titleZh: e.target.value })}
              />
            </div>

            <div>
              <Label>{language === 'ko' ? '설명' : '说明'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>{language === 'ko' ? '이미지 URL' : '图片 URL'}</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>{language === 'ko' ? '링크 URL' : '链接 URL'}</Label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>{language === 'ko' ? '게재 위치' : '投放位置'}</Label>
              <select
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="HOME_BANNER">
                  {language === 'ko' ? '메인 배너' : '主页横幅'}
                </option>
                <option value="HOME_SIDEBAR">
                  {language === 'ko' ? '메인 사이드바' : '主页侧边栏'}
                </option>
                <option value="CATEGORY_TOP">
                  {language === 'ko' ? '카테고리 상단' : '分类顶部'}
                </option>
                <option value="SEARCH_RESULTS">
                  {language === 'ko' ? '검색 결과' : '搜索结果'}
                </option>
                <option value="POST_DETAIL">
                  {language === 'ko' ? '상품 상세' : '商品详情'}
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'ko' ? '시작일' : '开始日期'}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{language === 'ko' ? '종료일' : '结束日期'}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>{language === 'ko' ? '예산 (KRW)' : '预算 (KRW)'}</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                {language === 'ko' ? '취소' : '取消'}
              </Button>
              <Button type="submit">
                {editingAd
                  ? (language === 'ko' ? '수정' : '修改')
                  : (language === 'ko' ? '생성' : '创建')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

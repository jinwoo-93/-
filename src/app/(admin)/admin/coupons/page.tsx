'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Plus,
  Search,
  Edit,
  Trash2,
  Send,
  Loader2,
  Calendar,
  Users,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';

interface Coupon {
  id: string;
  code: string;
  name: string;
  nameZh?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  totalQuantity: number;
  usedQuantity: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  issuedCount: number;
  createdAt: string;
}

interface CouponFormData {
  code: string;
  name: string;
  nameZh: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  totalQuantity: string;
  validFrom: string;
  validUntil: string;
  usageLimit: string;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 쿠폰 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    nameZh: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscount: '',
    totalQuantity: '0',
    validFrom: '',
    validUntil: '',
    usageLimit: '1',
  });

  // 대량 발급 모달
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [issueTargetType, setIssueTargetType] = useState<'all' | 'filter'>('all');
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/coupons?status=${statusFilter}`);
      const data = await res.json();

      if (data.success) {
        setCoupons(data.data.coupons);
      } else {
        toast({
          title: '조회 실패',
          description: data.error?.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '조회 실패',
        description: '쿠폰 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (
      !formData.code ||
      !formData.name ||
      !formData.discountValue ||
      !formData.validUntil
    ) {
      toast({
        title: '필수 항목 누락',
        description: '코드, 이름, 할인값, 만료일은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: '쿠폰이 생성되었습니다.' });
        setIsCreateModalOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        toast({
          title: '생성 실패',
          description: data.error?.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '생성 실패',
        description: '쿠폰 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (couponId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: `쿠폰이 ${!isActive ? '활성화' : '비활성화'}되었습니다.` });
        fetchCoupons();
      } else {
        toast({
          title: '상태 변경 실패',
          description: data.error?.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '상태 변경 실패',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: '쿠폰이 삭제되었습니다.' });
        fetchCoupons();
      } else {
        toast({
          title: '삭제 실패',
          description: data.error?.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '삭제 실패',
        variant: 'destructive',
      });
    }
  };

  const handleIssueCoupon = async () => {
    if (!selectedCouponId) {
      toast({
        title: '쿠폰을 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    setIsIssuing(true);

    try {
      const res = await fetch('/api/admin/coupons/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponId: selectedCouponId,
          targetType: issueTargetType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '쿠폰이 발급되었습니다',
          description: `${data.data.issued}명에게 발급됨 (중복 ${data.data.skipped}명 제외)`,
        });
        setIsIssueModalOpen(false);
        fetchCoupons();
      } else {
        toast({
          title: '발급 실패',
          description: data.error?.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '발급 실패',
        variant: 'destructive',
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameZh: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '0',
      maxDiscount: '',
      totalQuantity: '0',
      validFrom: '',
      validUntil: '',
      usageLimit: '1',
    });
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive && new Date(c.validUntil) >= new Date()).length,
    expired: coupons.filter((c) => new Date(c.validUntil) < new Date()).length,
    totalIssued: coupons.reduce((sum, c) => sum + c.issuedCount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          쿠폰 관리
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsIssueModalOpen(true);
              setSelectedCouponId('');
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            대량 발급
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            쿠폰 생성
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 쿠폰</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 쿠폰</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">만료된 쿠폰</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 발급 수</p>
                <p className="text-2xl font-bold">{stats.totalIssued}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 & 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="쿠폰 이름 또는 코드 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="expired">만료</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 쿠폰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>쿠폰 목록 ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>쿠폰이 없습니다</p>
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{coupon.name}</h3>
                        {coupon.nameZh && (
                          <span className="text-sm text-muted-foreground">({coupon.nameZh})</span>
                        )}
                        <Badge variant="outline" className="font-mono">
                          {coupon.code}
                        </Badge>
                        {coupon.isActive ? (
                          new Date(coupon.validUntil) >= new Date() ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              활성
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              만료
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            비활성
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">할인:</span>{' '}
                          <span className="font-medium text-primary">
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}%`
                              : `₩${coupon.discountValue.toLocaleString()}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">최소주문:</span>{' '}
                          <span className="font-medium">
                            ₩{coupon.minOrderAmount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">발급:</span>{' '}
                          <span className="font-medium">
                            {coupon.issuedCount} / {coupon.totalQuantity || '무제한'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">만료:</span>{' '}
                          <span className="font-medium">
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                      >
                        {coupon.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCouponId(coupon.id);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 쿠폰 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 쿠폰 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>쿠폰 코드 *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="WELCOME2024"
                />
              </div>
              <div>
                <Label>쿠폰 이름 (한국어) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="신규 회원 환영 쿠폰"
                />
              </div>
            </div>

            <div>
              <Label>쿠폰 이름 (중국어)</Label>
              <Input
                value={formData.nameZh}
                onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                placeholder="新会员欢迎优惠券"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>할인 유형 *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'PERCENTAGE' | 'FIXED') =>
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">퍼센트 (%)</SelectItem>
                    <SelectItem value="FIXED">고정 금액 (₩)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>할인값 *</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '5000'}
                />
              </div>
              <div>
                <Label>최대 할인 금액</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: e.target.value })
                  }
                  placeholder="10000"
                  disabled={formData.discountType === 'FIXED'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>최소 주문 금액</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>총 발급 수량 (0=무제한)</Label>
                <Input
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, totalQuantity: e.target.value })
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>만료일 *</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>사용자당 사용 횟수</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: e.target.value })
                }
                placeholder="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateCoupon} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 대량 발급 모달 */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 대량 발급</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>쿠폰 선택</Label>
              <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                <SelectTrigger>
                  <SelectValue placeholder="쿠폰을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {coupons
                    .filter((c) => c.isActive && new Date(c.validUntil) >= new Date())
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>발급 대상</Label>
              <Select
                value={issueTargetType}
                onValueChange={(value: 'all' | 'filter') => setIssueTargetType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 회원</SelectItem>
                  <SelectItem value="filter">조건별 필터 (향후 구현)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleIssueCoupon} disabled={isIssuing}>
              {isIssuing ? <Loader2 className="h-4 w-4 animate-spin" /> : '발급'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

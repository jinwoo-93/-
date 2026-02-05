'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Plane,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import type { TrackingResult, TrackingEvent, ShippingStatus } from '@/lib/shipping';
import { STATUS_TEXT, SHIPPING_CARRIERS, CarrierCode } from '@/lib/shipping';

interface ShippingTrackerProps {
  trackingNumber?: string;
  carrier?: string;
  orderId?: string;
  showInput?: boolean;
  className?: string;
}

export default function ShippingTracker({
  trackingNumber: initialTrackingNumber,
  carrier: initialCarrier,
  orderId,
  showInput = false,
  className,
}: ShippingTrackerProps) {
  const { language } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [carrier, setCarrier] = useState(initialCarrier || '');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTrackingNumber || orderId) {
      handleTrack();
    }
  }, [initialTrackingNumber, orderId]);

  const handleTrack = async () => {
    if (!trackingNumber && !orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      let res;
      if (orderId) {
        res = await fetch('/api/shipping/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } else {
        const params = new URLSearchParams({ trackingNumber });
        if (carrier) params.append('carrier', carrier);
        res = await fetch(`/api/shipping/track?${params}`);
      }

      const data = await res.json();

      if (data.success) {
        if (data.data.hasTracking === false) {
          setError(data.data.message);
        } else {
          setResult(orderId ? data.data.tracking : data.data);
        }
      } else {
        setError(data.error?.message || '조회 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('배송 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ShippingStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PICKED_UP':
        return <Package className="h-4 w-4" />;
      case 'IN_TRANSIT_KR':
      case 'IN_TRANSIT_CN':
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-4 w-4" />;
      case 'CUSTOMS_KR':
      case 'CUSTOMS_CN':
        return <MapPin className="h-4 w-4" />;
      case 'DEPARTED_KR':
      case 'IN_TRANSIT_INT':
      case 'ARRIVED_CN':
        return <Plane className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'EXCEPTION':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ShippingStatus): string => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'EXCEPTION':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'CUSTOMS_KR':
      case 'CUSTOMS_CN':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {language === 'ko' ? '배송 추적' : '物流追踪'}
          </div>
          {result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTrack}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 입력 폼 */}
        {showInput && (
          <div className="flex gap-2">
            <Input
              placeholder={language === 'ko' ? '운송장 번호 입력' : '输入快递单号'}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTrack} disabled={isLoading || !trackingNumber}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                language === 'ko' ? '조회' : '查询'
              )}
            </Button>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && !result && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="space-y-4">
            {/* 현재 상태 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  {result.carrierName} ({result.trackingNumber})
                </p>
                <p className="font-medium mt-1">
                  {language === 'ko'
                    ? STATUS_TEXT[result.currentStatus]?.ko
                    : STATUS_TEXT[result.currentStatus]?.zh}
                </p>
              </div>
              <Badge className={getStatusColor(result.currentStatus)}>
                {getStatusIcon(result.currentStatus)}
                <span className="ml-1">
                  {result.currentStatus === 'DELIVERED'
                    ? language === 'ko' ? '완료' : '完成'
                    : language === 'ko' ? '진행중' : '进行中'}
                </span>
              </Badge>
            </div>

            {/* 예상 배송일 */}
            {result.estimatedDelivery && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {language === 'ko' ? '예상 도착: ' : '预计送达: '}
                </span>
                <span className="font-medium">
                  {new Date(result.estimatedDelivery).toLocaleDateString(
                    language === 'ko' ? 'ko-KR' : 'zh-CN',
                    { month: 'long', day: 'numeric', weekday: 'short' }
                  )}
                </span>
              </div>
            )}

            {/* 배송 이력 토글 */}
            {result.events.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full py-2 text-sm font-medium"
              >
                <span>
                  {language === 'ko' ? '배송 이력' : '物流记录'} ({result.events.length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}

            {/* 배송 이력 타임라인 */}
            {isExpanded && result.events.length > 0 && (
              <div className="space-y-0 pl-2">
                {result.events.map((event, index) => (
                  <div key={index} className="relative pl-6 pb-4 last:pb-0">
                    {/* 타임라인 라인 */}
                    {index < result.events.length - 1 && (
                      <div className="absolute left-[7px] top-6 w-0.5 h-[calc(100%-12px)] bg-border" />
                    )}

                    {/* 아이콘 */}
                    <div
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index === 0 ? (
                        getStatusIcon(event.status)
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* 내용 */}
                    <div>
                      <p className={`text-sm ${index === 0 ? 'font-medium' : ''}`}>
                        {language === 'zh' && event.descriptionZh
                          ? event.descriptionZh
                          : event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {language === 'zh' && event.locationZh
                            ? event.locationZh
                            : event.location}
                        </span>
                        <span>•</span>
                        <span>{formatDate(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 판매자 등급 시스템
 * 판매 실적, 리뷰 평점, 고객 만족도 등을 기반으로 등급 산정
 */

import { prisma } from './db';
import { sendTemplatedNotification } from './notification-service';

export type SellerGrade =
  | 'BRONZE' // 브론즈: 초보 판매자
  | 'SILVER' // 실버: 일반 판매자
  | 'GOLD' // 골드: 우수 판매자
  | 'PLATINUM' // 플래티넘: 최우수 판매자
  | 'DIAMOND'; // 다이아몬드: VIP 판매자

export interface SellerGradeInfo {
  grade: SellerGrade;
  nextGrade?: SellerGrade;
  score: number; // 종합 점수 (0-100)
  benefits: string[];
  requirements: {
    met: string[];
    pending: string[];
  };
  progressToNext: number; // 다음 등급까지 진행률 (0-100)
}

export interface GradeCriteria {
  minSales: number; // 최소 판매 건수
  minRevenue: number; // 최소 매출 (KRW)
  minRating: number; // 최소 평점
  maxDisputeRate: number; // 최대 분쟁 비율 (%)
  minResponseRate: number; // 최소 응답률 (%)
  minShippingScore: number; // 최소 배송 점수 (0-100)
}

/**
 * 등급별 기준
 */
const GRADE_CRITERIA: Record<SellerGrade, GradeCriteria> = {
  BRONZE: {
    minSales: 0,
    minRevenue: 0,
    minRating: 0,
    maxDisputeRate: 100,
    minResponseRate: 0,
    minShippingScore: 0,
  },
  SILVER: {
    minSales: 10,
    minRevenue: 1000000, // 100만원
    minRating: 3.5,
    maxDisputeRate: 10,
    minResponseRate: 70,
    minShippingScore: 60,
  },
  GOLD: {
    minSales: 50,
    minRevenue: 5000000, // 500만원
    minRating: 4.0,
    maxDisputeRate: 5,
    minResponseRate: 85,
    minShippingScore: 75,
  },
  PLATINUM: {
    minSales: 200,
    minRevenue: 20000000, // 2000만원
    minRating: 4.5,
    maxDisputeRate: 3,
    minResponseRate: 90,
    minShippingScore: 85,
  },
  DIAMOND: {
    minSales: 500,
    minRevenue: 50000000, // 5000만원
    minRating: 4.7,
    maxDisputeRate: 1,
    minResponseRate: 95,
    minShippingScore: 95,
  },
};

/**
 * 등급별 혜택
 */
const GRADE_BENEFITS: Record<SellerGrade, string[]> = {
  BRONZE: ['기본 판매 기능', '기본 고객 지원'],
  SILVER: [
    '수수료 0.5% 할인',
    '상품 노출 우선순위 상승',
    '월 1회 무료 프로모션',
    '전용 뱃지 부여',
  ],
  GOLD: [
    '수수료 1% 할인',
    '상품 노출 우선순위 대폭 상승',
    '월 2회 무료 프로모션',
    '전용 골드 뱃지',
    '정산 주기 단축 (월 2회)',
  ],
  PLATINUM: [
    '수수료 2% 할인',
    '메인 페이지 노출 기회',
    '월 4회 무료 프로모션',
    '전용 플래티넘 뱃지',
    '정산 주기 단축 (주 1회)',
    '전담 매니저 배정',
  ],
  DIAMOND: [
    '수수료 3% 할인',
    '메인 페이지 고정 노출',
    '무제한 무료 프로모션',
    '전용 다이아몬드 뱃지',
    '즉시 정산 (3영업일)',
    '전담 VIP 매니저',
    '광고 우선 배정',
  ],
};

/**
 * 판매자의 현재 통계 조회
 */
async function getSellerStats(userId: string): Promise<{
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  disputeRate: number;
  responseRate: number;
  shippingScore: number;
}> {
  // 판매 건수 및 매출
  const salesData = await prisma.order.aggregate({
    where: {
      sellerId: userId,
      status: 'CONFIRMED',
    },
    _count: { id: true },
    _sum: { totalKRW: true },
  });

  const totalSales = salesData._count.id || 0;
  const totalRevenue = salesData._sum.totalKRW || 0;

  // 평점 (User 모델에 이미 averageRating 있음)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      averageRating: true,
      disputeRate: true,
    },
  });

  const averageRating = user?.averageRating || 0;
  const disputeRate = user?.disputeRate || 0;

  // 응답률 계산 (Q&A 및 메시지 기반)
  // 먼저 판매자의 상품 ID 목록 가져오기
  const sellerPosts = await prisma.post.findMany({
    where: { userId },
    select: { id: true },
  });

  const postIds = sellerPosts.map((p) => p.id);

  const [totalQAs, answeredQAs] = await Promise.all([
    prisma.productQA.count({
      where: {
        postId: {
          in: postIds,
        },
      },
    }),
    prisma.productQA.count({
      where: {
        postId: {
          in: postIds,
        },
        status: 'ANSWERED',
      },
    }),
  ]);

  const responseRate = totalQAs > 0 ? (answeredQAs / totalQAs) * 100 : 100;

  // 배송 점수 (정시 배송율 기반)
  const [totalOrders, onTimeOrders] = await Promise.all([
    prisma.order.count({
      where: {
        sellerId: userId,
        status: {
          in: ['DELIVERED', 'CONFIRMED'],
        },
      },
    }),
    prisma.order.count({
      where: {
        sellerId: userId,
        status: {
          in: ['DELIVERED', 'CONFIRMED'],
        },
        // TODO: 예상 배송일 vs 실제 배송일 비교 로직 추가
        // deliveredAt <= expectedDeliveryDate
      },
    }),
  ]);

  const shippingScore = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 100;

  return {
    totalSales,
    totalRevenue,
    averageRating,
    disputeRate,
    responseRate,
    shippingScore,
  };
}

/**
 * 통계 기반 등급 계산
 */
function calculateGrade(stats: {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  disputeRate: number;
  responseRate: number;
  shippingScore: number;
}): SellerGrade {
  const grades: SellerGrade[] = ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

  // 상위 등급부터 확인
  for (const grade of grades) {
    const criteria = GRADE_CRITERIA[grade];

    if (
      stats.totalSales >= criteria.minSales &&
      stats.totalRevenue >= criteria.minRevenue &&
      stats.averageRating >= criteria.minRating &&
      stats.disputeRate <= criteria.maxDisputeRate &&
      stats.responseRate >= criteria.minResponseRate &&
      stats.shippingScore >= criteria.minShippingScore
    ) {
      return grade;
    }
  }

  return 'BRONZE';
}

/**
 * 종합 점수 계산 (0-100)
 */
function calculateScore(stats: {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  disputeRate: number;
  responseRate: number;
  shippingScore: number;
}): number {
  // 가중치
  const weights = {
    sales: 0.2,
    revenue: 0.2,
    rating: 0.25,
    dispute: 0.15,
    response: 0.1,
    shipping: 0.1,
  };

  // 각 지표를 100점 만점으로 정규화
  const salesScore = Math.min((stats.totalSales / 500) * 100, 100);
  const revenueScore = Math.min((stats.totalRevenue / 50000000) * 100, 100);
  const ratingScore = (stats.averageRating / 5) * 100;
  const disputeScore = Math.max(100 - stats.disputeRate * 10, 0);
  const responseScore = stats.responseRate;
  const shippingScore = stats.shippingScore;

  const totalScore =
    salesScore * weights.sales +
    revenueScore * weights.revenue +
    ratingScore * weights.rating +
    disputeScore * weights.dispute +
    responseScore * weights.response +
    shippingScore * weights.shipping;

  return Math.round(totalScore);
}

/**
 * 판매자 등급 정보 조회
 */
export async function getSellerGradeInfo(userId: string): Promise<SellerGradeInfo> {
  const stats = await getSellerStats(userId);
  const grade = calculateGrade(stats);
  const score = calculateScore(stats);

  // 다음 등급
  const gradeOrder: SellerGrade[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const currentIndex = gradeOrder.indexOf(grade);
  const nextGrade = currentIndex < gradeOrder.length - 1 ? gradeOrder[currentIndex + 1] : undefined;

  // 다음 등급 요구사항 확인
  const met: string[] = [];
  const pending: string[] = [];

  if (nextGrade) {
    const nextCriteria = GRADE_CRITERIA[nextGrade];

    if (stats.totalSales >= nextCriteria.minSales) {
      met.push(`판매 ${nextCriteria.minSales}건 달성`);
    } else {
      pending.push(
        `판매 ${stats.totalSales}/${nextCriteria.minSales}건 (${nextCriteria.minSales - stats.totalSales}건 부족)`
      );
    }

    if (stats.totalRevenue >= nextCriteria.minRevenue) {
      met.push(`매출 ${(nextCriteria.minRevenue / 10000).toFixed(0)}만원 달성`);
    } else {
      pending.push(
        `매출 ${(stats.totalRevenue / 10000).toFixed(0)}/${(nextCriteria.minRevenue / 10000).toFixed(0)}만원`
      );
    }

    if (stats.averageRating >= nextCriteria.minRating) {
      met.push(`평점 ${nextCriteria.minRating}점 이상`);
    } else {
      pending.push(`평점 ${stats.averageRating.toFixed(1)}/${nextCriteria.minRating}점`);
    }

    if (stats.disputeRate <= nextCriteria.maxDisputeRate) {
      met.push(`분쟁율 ${nextCriteria.maxDisputeRate}% 이하`);
    } else {
      pending.push(`분쟁율 ${stats.disputeRate.toFixed(1)}% (${nextCriteria.maxDisputeRate}% 이하 필요)`);
    }

    if (stats.responseRate >= nextCriteria.minResponseRate) {
      met.push(`응답률 ${nextCriteria.minResponseRate}% 이상`);
    } else {
      pending.push(
        `응답률 ${stats.responseRate.toFixed(0)}% (${nextCriteria.minResponseRate}% 이상 필요)`
      );
    }

    if (stats.shippingScore >= nextCriteria.minShippingScore) {
      met.push(`배송 점수 ${nextCriteria.minShippingScore}점 이상`);
    } else {
      pending.push(
        `배송 점수 ${stats.shippingScore.toFixed(0)} (${nextCriteria.minShippingScore}점 이상 필요)`
      );
    }
  }

  // 다음 등급까지 진행률
  const progressToNext = nextGrade
    ? Math.min((met.length / (met.length + pending.length)) * 100, 100)
    : 100;

  return {
    grade,
    nextGrade,
    score,
    benefits: GRADE_BENEFITS[grade],
    requirements: {
      met,
      pending,
    },
    progressToNext: Math.round(progressToNext),
  };
}

/**
 * 판매자 등급 갱신 (Cron Job)
 */
export async function updateSellerGrades(): Promise<{
  success: boolean;
  updatedCount: number;
  upgradedCount: number;
}> {
  try {
    // 모든 판매자 조회
    const sellers = await prisma.user.findMany({
      where: {
        userType: 'SELLER',
      },
      select: {
        id: true,
      },
    });

    let updatedCount = 0;
    let upgradedCount = 0;

    for (const seller of sellers) {
      const gradeInfo = await getSellerGradeInfo(seller.id);

      // TODO: User 모델에 sellerGrade 필드 추가 필요
      /*
      const currentGrade = await prisma.user.findUnique({
        where: { id: seller.id },
        select: { sellerGrade: true },
      });

      // 등급 업데이트
      await prisma.user.update({
        where: { id: seller.id },
        data: {
          sellerGrade: gradeInfo.grade,
          sellerScore: gradeInfo.score,
        },
      });

      updatedCount++;

      // 등급이 상승한 경우 알림 전송
      if (currentGrade && currentGrade.sellerGrade !== gradeInfo.grade) {
        const gradeOrder: SellerGrade[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
        const oldIndex = gradeOrder.indexOf(currentGrade.sellerGrade as SellerGrade);
        const newIndex = gradeOrder.indexOf(gradeInfo.grade);

        if (newIndex > oldIndex) {
          // 승급
          await sendTemplatedNotification({
            template: 'SELLER_UPGRADE',
            userId: seller.id,
            variables: {
              grade: gradeInfo.grade,
            },
            link: '/seller/dashboard',
          });

          upgradedCount++;
        }
      }
      */

      updatedCount++;
    }

    console.log(
      `[SellerGradeSystem] Updated ${updatedCount} sellers, ${upgradedCount} upgraded`
    );

    return {
      success: true,
      updatedCount,
      upgradedCount,
    };
  } catch (error) {
    console.error('[SellerGradeSystem] Error updating seller grades:', error);
    return {
      success: false,
      updatedCount: 0,
      upgradedCount: 0,
    };
  }
}

/**
 * 등급별 수수료율 계산
 */
export function getCommissionRate(grade: SellerGrade, isBusinessVerified: boolean): number {
  const baseRate = isBusinessVerified ? 3 : 5; // 사업자: 3%, 일반: 5%

  const discounts: Record<SellerGrade, number> = {
    BRONZE: 0,
    SILVER: 0.5,
    GOLD: 1.0,
    PLATINUM: 2.0,
    DIAMOND: 3.0,
  };

  return Math.max(baseRate - discounts[grade], 1); // 최소 1%
}

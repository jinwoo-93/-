/**
 * Performance Monitoring Utilities
 *
 * Core Web Vitals 측정 및 성능 모니터링 유틸리티
 * Phase 6에서 Vercel Analytics / Google Analytics 통합 예정
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint (새로운 지표)

  // Custom Metrics
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Web Vitals 임계값
 * https://web.dev/vitals/
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500,
    poor: 4000,
  },
  FID: {
    good: 100,
    poor: 300,
  },
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  FCP: {
    good: 1800,
    poor: 3000,
  },
  TTFB: {
    good: 800,
    poor: 1800,
  },
  INP: {
    good: 200,
    poor: 500,
  },
};

/**
 * 메트릭 평가
 */
export function getRating(
  metric: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[metric];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals 리포팅
 * Next.js에서 제공하는 reportWebVitals와 함께 사용
 */
export function reportWebVitals(metric: PerformanceMetrics) {
  // 콘솔에 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }

  // TODO: Phase 6에서 Analytics로 전송
  // analytics.track('web-vital', metric);

  // TODO: Phase 6에서 Vercel Analytics
  // if (window.va) {
  //   window.va('track', 'web-vital', metric);
  // }
}

/**
 * 커스텀 성능 측정
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * 측정 시작
   */
  start(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * 측정 종료 및 결과 반환
   */
  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * 비동기 함수 성능 측정
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * 동기 함수 성능 측정
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

/**
 * 전역 Performance Monitor 인스턴스
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * API 요청 성능 측정
 */
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return perfMonitor.measure(`API: ${name}`, apiCall);
}

/**
 * 컴포넌트 렌더링 시간 측정 (HOC)
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  const PerformanceWrappedComponent: React.FC<P> = (props) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();

      React.useEffect(() => {
        const renderTime = performance.now() - startTime;
        console.log(`[Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
      }, []);
    }

    return React.createElement(WrappedComponent, props);
  };

  return PerformanceWrappedComponent;
}

/**
 * 이미지 로딩 성능 측정
 */
export function measureImageLoad(src: string): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`[Image Load] ${src}: ${loadTime.toFixed(2)}ms`);
      resolve(loadTime);
    };

    img.onerror = () => {
      console.error(`[Image Load] Failed to load: ${src}`);
      resolve(-1);
    };

    img.src = src;
  });
}

/**
 * 메모리 사용량 모니터링
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  limit: number;
} | null {
  // @ts-ignore - Performance Memory API
  if (typeof performance !== 'undefined' && performance.memory) {
    // @ts-ignore
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
}

/**
 * 네트워크 정보 확인
 */
export function getNetworkInfo(): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null {
  // @ts-ignore - Network Information API
  if (typeof navigator !== 'undefined' && navigator.connection) {
    // @ts-ignore
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }
  return null;
}

/**
 * 성능 요약 리포트
 */
export function getPerformanceReport(): {
  memory: ReturnType<typeof getMemoryUsage>;
  network: ReturnType<typeof getNetworkInfo>;
  navigation: PerformanceNavigationTiming | null;
} {
  let navigation: PerformanceNavigationTiming | null = null;

  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];
    navigation = navEntries[0] || null;
  }

  return {
    memory: getMemoryUsage(),
    network: getNetworkInfo(),
    navigation,
  };
}

/**
 * 성능 경고 발생
 */
export function warnIfSlow(name: string, duration: number, threshold: number = 1000) {
  if (duration > threshold) {
    console.warn(
      `[Performance Warning] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }
}

// React import for withPerformanceMonitoring
import React from 'react';

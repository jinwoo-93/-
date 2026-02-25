'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary Component
 *
 * 자식 컴포넌트에서 발생하는 JavaScript 에러를 포착하고
 * 사용자 친화적인 에러 UI를 표시합니다.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 상태 업데이트
    this.setState({
      error,
      errorInfo,
    });

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Phase 6에서 Sentry 등으로 에러 전송
    // sendErrorToSentry(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">오류가 발생했습니다</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    예상치 못한 문제가 발생했습니다. 불편을 드려 죄송합니다.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 에러 메시지 */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-1">에러 메시지:</p>
                  <p className="text-sm text-red-700 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* 개발 환경에서만 스택 트레이스 표시 */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <summary className="text-sm font-medium text-gray-900 cursor-pointer mb-2">
                    상세 정보 (개발 환경)
                  </summary>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  페이지 새로고침
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>

              {/* 도움말 */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  문제가 계속 발생하시나요?{' '}
                  <a href="/help/contact" className="text-primary hover:underline">
                    고객센터
                  </a>
                  로 문의해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 전역 에러 핸들러 함수
 * Window 레벨의 에러를 포착합니다.
 */
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // JavaScript 런타임 에러
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // TODO: Phase 6에서 Sentry로 전송
    });

    // Promise rejection 에러
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // TODO: Phase 6에서 Sentry로 전송
    });
  }
}

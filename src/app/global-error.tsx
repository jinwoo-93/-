'use client';

import { useEffect } from 'react';

/**
 * Global Error Page
 * 루트 레이아웃에서 발생하는 에러를 처리합니다.
 * 이 페이지는 <html> 태그를 직접 포함해야 합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
    // TODO: Phase 6에서 Sentry로 전송
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #fee2e2, #fed7aa)',
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: '42rem', width: '100%' }}>
            <div
              style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '3rem 2rem',
              }}
            >
              {/* 에러 아이콘 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '5rem',
                    height: '5rem',
                    background: '#fee2e2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
              </div>

              {/* 메시지 */}
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                시스템 오류
              </h1>
              <p
                style={{
                  fontSize: '1.125rem',
                  color: '#4b5563',
                  textAlign: 'center',
                  marginBottom: '2rem',
                  maxWidth: '28rem',
                  margin: '0 auto 2rem',
                }}
              >
                심각한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>

              {/* 에러 메시지 (개발 환경) */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  style={{
                    marginBottom: '2rem',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#7f1d1d',
                      marginBottom: '0.5rem',
                    }}
                  >
                    에러 정보 (개발 환경):
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#991b1b',
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                    }}
                  >
                    {error.message}
                  </p>
                  {error.digest && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem' }}>
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={reset}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#2563eb',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  다시 시도
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#374151',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  홈으로 이동
                </button>
              </div>
            </div>

            {/* 추가 정보 */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                문제가 계속되면{' '}
                <a href="/help/contact" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  고객센터
                </a>
                로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

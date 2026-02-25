/**
 * Instrumentation API
 * Next.js 14+ 성능 모니터링 및 설정
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Server-side 초기화
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server-side monitoring initialized');

    // TODO: Phase 6 - Sentry Server SDK 초기화
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.init({ ... });
  }

  // Edge Runtime 초기화
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[Instrumentation] Edge runtime monitoring initialized');

    // TODO: Phase 6 - Edge Runtime 모니터링
  }
}

export async function onRequestError(
  error: Error,
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) {
  // 요청 에러 로깅
  console.error('[Request Error]', {
    error: error.message,
    path: request.path,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // TODO: Phase 6 - Sentry로 에러 전송
  // Sentry.captureException(error, {
  //   contexts: {
  //     request: {
  //       url: request.path,
  //       method: request.method,
  //     },
  //   },
  // });
}

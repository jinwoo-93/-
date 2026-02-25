/**
 * Logging System
 * 
 * Pino 기반 구조화된 로깅 시스템
 * - 빠른 성능 (JSON 직렬화)
 * - 구조화된 로그
 * - 로그 레벨 관리
 * - 프로덕션/개발 환경 분리
 * - Phase 6 Sentry 통합 준비
 */

import pino from 'pino'

/**
 * 로그 레벨
 * - trace (10): 매우 상세한 디버깅 정보
 * - debug (20): 디버깅 정보
 * - info (30): 일반 정보
 * - warn (40): 경고
 * - error (50): 에러
 * - fatal (60): 치명적 에러
 */

/**
 * 로거 설정
 */
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // 프로덕션 환경
  ...(process.env.NODE_ENV === 'production'
    ? {
        // JSON 포맷 (로그 집계 도구용)
        formatters: {
          level: (label) => {
            return { level: label }
          },
        },
        // 타임스탬프 포함
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        // 개발 환경: 읽기 쉬운 포맷
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }),

  // 기본 필드
  base: {
    env: process.env.NODE_ENV,
  },
}

/**
 * 전역 로거 인스턴스
 */
export const logger = pino(loggerConfig)

/**
 * 컨텍스트를 포함한 자식 로거 생성
 * 
 * @example
 * const userLogger = createLogger({ module: 'user', userId: '123' })
 * userLogger.info('User logged in')
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * HTTP 요청 로거
 */
export function logHttpRequest(req: {
  method: string
  url: string
  headers?: Record<string, any>
  statusCode?: number
  duration?: number
}) {
  const { method, url, statusCode, duration, headers } = req

  // 민감한 헤더 제거
  const sanitizedHeaders = headers ? {
    ...headers,
    authorization: headers.authorization ? '[REDACTED]' : undefined,
    cookie: headers.cookie ? '[REDACTED]' : undefined,
  } : undefined

  const statusMsg = statusCode || ''
  const durationMsg = duration ? ` (${duration}ms)` : ''
  
  logger.info({
    type: 'http',
    method,
    url,
    statusCode,
    duration,
    headers: sanitizedHeaders,
  }, `${method} ${url} ${statusMsg}${durationMsg}`)
}

/**
 * 데이터베이스 쿼리 로거
 */
export function logDatabaseQuery(query: {
  operation: string
  model: string
  duration?: number
  error?: Error
}) {
  const { operation, model, duration, error } = query

  if (error) {
    logger.error({
      type: 'database',
      operation,
      model,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, `DB Error: ${operation} ${model}`)
  } else {
    const durationMsg = duration ? ` (${duration}ms)` : ''
    logger.debug({
      type: 'database',
      operation,
      model,
      duration,
    }, `DB: ${operation} ${model}${durationMsg}`)
  }
}

/**
 * 에러 로거
 * 
 * @example
 * try {
 *   // ...
 * } catch (error) {
 *   logError(error, { context: 'payment processing', orderId: '123' })
 * }
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    type: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  }, error.message)

  // TODO: Phase 6 - Sentry로 전송
  // Sentry.captureException(error, { extra: context })
}

/**
 * 성능 로거
 */
export function logPerformance(metric: {
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  context?: Record<string, any>
}) {
  const { name, value, rating, context } = metric
  const ratingMsg = rating ? ` (${rating})` : ''

  logger.info({
    type: 'performance',
    metric: name,
    value,
    rating,
    ...context,
  }, `[Performance] ${name}: ${value}${ratingMsg}`)
}

/**
 * 비즈니스 이벤트 로거
 * 
 * @example
 * logEvent('user.registered', { userId: '123', method: 'email' })
 * logEvent('order.placed', { orderId: '456', amount: 100000 })
 */
export function logEvent(event: string, data?: Record<string, any>) {
  logger.info({
    type: 'event',
    event,
    ...data,
  }, `[Event] ${event}`)
}

/**
 * 보안 이벤트 로거
 */
export function logSecurityEvent(event: {
  type: 'auth_failed' | 'suspicious_activity' | 'rate_limit' | 'unauthorized_access'
  userId?: string
  ip?: string
  details?: Record<string, any>
}) {
  const { type, userId, ip, details } = event

  logger.warn({
    type: 'security',
    securityEvent: type,
    userId,
    ip,
    ...details,
  }, `[Security] ${type}`)

  // TODO: Phase 6 - 보안 이벤트 모니터링 시스템으로 전송
}

/**
 * 민감한 데이터 제거 (sanitization)
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey', 'creditCard']
): T {
  const sanitized: Record<string, any> = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized as T
}

/**
 * 개발 환경 전용 로그
 */
export function devLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(data || {}, `[DEV] ${message}`)
  }
}

/**
 * 조건부 로깅 (디버그 플래그)
 */
export function debugLog(message: string, data?: any) {
  if (process.env.DEBUG === 'true') {
    logger.debug(data || {}, `[DEBUG] ${message}`)
  }
}

// 기본 export
export default logger

/**
 * Logging Middleware
 * 
 * API Route에서 사용할 수 있는 로깅 미들웨어
 */

import { NextRequest, NextResponse } from 'next/server'
import { logHttpRequest, logError } from './logger'

/**
 * HTTP 요청/응답 로깅 미들웨어
 * 
 * @example
 * export async function GET(request: NextRequest) {
 *   return withLogging(request, async () => {
 *     // ... 실제 로직
 *     return NextResponse.json({ data })
 *   })
 * }
 */
export async function withLogging<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const startTime = performance.now()
  const { method, url } = request

  try {
    const response = await handler()
    const duration = Math.round(performance.now() - startTime)

    logHttpRequest({
      method,
      url,
      statusCode: response.status,
      duration,
    })

    return response
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)

    logHttpRequest({
      method,
      url,
      statusCode: 500,
      duration,
    })

    logError(error as Error, {
      context: 'API Route',
      method,
      url,
    })

    throw error
  }
}

/**
 * 데이터베이스 작업 로깅 래퍼
 * 
 * @example
 * const users = await withDatabaseLogging(
 *   'findMany',
 *   'User',
 *   () => prisma.user.findMany()
 * )
 */
export async function withDatabaseLogging<T>(
  operation: string,
  model: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await query()
    const duration = Math.round(performance.now() - startTime)

    // 너무 느린 쿼리 경고 (1초 이상)
    if (duration > 1000) {
      const { logger } = await import('./logger')
      logger.warn({
        type: 'slow-query',
        operation,
        model,
        duration,
      }, `Slow DB query: ${operation} ${model} (${duration}ms)`)
    }

    return result
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    const { logDatabaseQuery } = await import('./logger')

    logDatabaseQuery({
      operation,
      model,
      duration,
      error: error as Error,
    })

    throw error
  }
}

/**
 * 비동기 작업 에러 핸들링 + 로깅
 * 
 * @example
 * const result = await withErrorLogging(
 *   async () => await someAsyncOperation(),
 *   { context: 'payment', orderId: '123' }
 * )
 */
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logError(error as Error, context)
    throw error
  }
}

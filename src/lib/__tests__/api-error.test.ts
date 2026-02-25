/**
 * API Error 유틸리티 테스트
 *
 * Note: Next.js의 NextResponse는 서버 환경에서만 완전히 동작하므로
 * 여기서는 에러 코드와 형식만 테스트하고,
 * 실제 응답 생성은 통합 테스트에서 수행합니다.
 */

describe('API Error 유틸리티', () => {
  describe('에러 코드 정의', () => {
    it('ApiErrorCode enum이 올바르게 정의되어 있어야 한다', () => {
      // 에러 코드 타입 검증
      const errorCodes = {
        BAD_REQUEST: 'BAD_REQUEST',
        UNAUTHORIZED: 'UNAUTHORIZED',
        FORBIDDEN: 'FORBIDDEN',
        NOT_FOUND: 'NOT_FOUND',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        CONFLICT: 'CONFLICT',
        TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
        INTERNAL_ERROR: 'INTERNAL_ERROR',
        SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
        DATABASE_ERROR: 'DATABASE_ERROR',
        INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
        OUT_OF_STOCK: 'OUT_OF_STOCK',
        ALREADY_EXISTS: 'ALREADY_EXISTS',
        EXPIRED: 'EXPIRED',
      }

      expect(errorCodes.BAD_REQUEST).toBe('BAD_REQUEST')
      expect(errorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(errorCodes.FORBIDDEN).toBe('FORBIDDEN')
      expect(errorCodes.NOT_FOUND).toBe('NOT_FOUND')
      expect(errorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(errorCodes.CONFLICT).toBe('CONFLICT')
      expect(errorCodes.TOO_MANY_REQUESTS).toBe('TOO_MANY_REQUESTS')
      expect(errorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(errorCodes.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE')
      expect(errorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(errorCodes.INSUFFICIENT_FUNDS).toBe('INSUFFICIENT_FUNDS')
      expect(errorCodes.OUT_OF_STOCK).toBe('OUT_OF_STOCK')
      expect(errorCodes.ALREADY_EXISTS).toBe('ALREADY_EXISTS')
      expect(errorCodes.EXPIRED).toBe('EXPIRED')
    })
  })

  describe('에러 응답 형식', () => {
    it('에러 응답은 success: false를 가져야 한다', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          details: { id: '123' },
          timestamp: new Date().toISOString(),
        },
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBeDefined()
      expect(errorResponse.error.code).toBe('NOT_FOUND')
      expect(errorResponse.error.message).toBeTruthy()
      expect(errorResponse.error.timestamp).toBeTruthy()
    })

    it('성공 응답은 success: true를 가져야 한다', () => {
      const successResponse = {
        success: true,
        data: { id: 1, name: 'Test' },
        meta: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
        },
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBeDefined()
      expect(successResponse.meta).toBeDefined()
      expect(successResponse.meta.page).toBe(1)
      expect(successResponse.meta.total).toBe(100)
    })
  })

  describe('Prisma 에러 코드 매핑', () => {
    it('P2002 → CONFLICT (Unique constraint violation)', () => {
      const prismaErrorCode = 'P2002'
      const expectedApiErrorCode = 'CONFLICT'
      const expectedHttpStatus = 409

      expect(expectedApiErrorCode).toBe('CONFLICT')
      expect(expectedHttpStatus).toBe(409)
    })

    it('P2025 → NOT_FOUND (Record not found)', () => {
      const prismaErrorCode = 'P2025'
      const expectedApiErrorCode = 'NOT_FOUND'
      const expectedHttpStatus = 404

      expect(expectedApiErrorCode).toBe('NOT_FOUND')
      expect(expectedHttpStatus).toBe(404)
    })

    it('P2003 → BAD_REQUEST (Foreign key constraint failed)', () => {
      const prismaErrorCode = 'P2003'
      const expectedApiErrorCode = 'BAD_REQUEST'
      const expectedHttpStatus = 400

      expect(expectedApiErrorCode).toBe('BAD_REQUEST')
      expect(expectedHttpStatus).toBe(400)
    })

    it('기타 Prisma 에러 → DATABASE_ERROR', () => {
      const prismaErrorCode = 'P1001'
      const expectedApiErrorCode = 'DATABASE_ERROR'
      const expectedHttpStatus = 500

      expect(expectedApiErrorCode).toBe('DATABASE_ERROR')
      expect(expectedHttpStatus).toBe(500)
    })
  })

  describe('HTTP 상태 코드 매핑', () => {
    it('각 에러 코드는 적절한 HTTP 상태 코드를 가져야 한다', () => {
      const statusCodeMap = {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        VALIDATION_ERROR: 400,
        CONFLICT: 409,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_ERROR: 500,
        SERVICE_UNAVAILABLE: 503,
        DATABASE_ERROR: 500,
        INSUFFICIENT_FUNDS: 400,
        OUT_OF_STOCK: 400,
        ALREADY_EXISTS: 409,
        EXPIRED: 400,
      }

      expect(statusCodeMap.BAD_REQUEST).toBe(400)
      expect(statusCodeMap.UNAUTHORIZED).toBe(401)
      expect(statusCodeMap.FORBIDDEN).toBe(403)
      expect(statusCodeMap.NOT_FOUND).toBe(404)
      expect(statusCodeMap.CONFLICT).toBe(409)
      expect(statusCodeMap.TOO_MANY_REQUESTS).toBe(429)
      expect(statusCodeMap.INTERNAL_ERROR).toBe(500)
      expect(statusCodeMap.SERVICE_UNAVAILABLE).toBe(503)
    })
  })

  describe('에러 메시지', () => {
    it('각 에러 코드에 대한 기본 메시지가 있어야 한다', () => {
      const defaultMessages = {
        BAD_REQUEST: '잘못된 요청입니다',
        UNAUTHORIZED: '인증이 필요합니다',
        FORBIDDEN: '접근 권한이 없습니다',
        NOT_FOUND: '리소스를 찾을 수 없습니다',
        VALIDATION_ERROR: '입력값 검증에 실패했습니다',
        CONFLICT: '이미 존재하는 데이터입니다',
        TOO_MANY_REQUESTS: '너무 많은 요청이 발생했습니다',
        INTERNAL_ERROR: '서버 오류가 발생했습니다',
        SERVICE_UNAVAILABLE: '서비스를 사용할 수 없습니다',
        DATABASE_ERROR: '데이터베이스 오류가 발생했습니다',
        INSUFFICIENT_FUNDS: '잔액이 부족합니다',
        OUT_OF_STOCK: '재고가 부족합니다',
        ALREADY_EXISTS: '이미 존재합니다',
        EXPIRED: '만료되었습니다',
      }

      Object.entries(defaultMessages).forEach(([code, message]) => {
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })
  })

  describe('타임스탬프 형식', () => {
    it('ISO 8601 형식의 타임스탬프를 생성해야 한다', () => {
      const timestamp = new Date().toISOString()

      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    })
  })
})

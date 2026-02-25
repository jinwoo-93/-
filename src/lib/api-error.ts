import { NextResponse } from 'next/server';

/**
 * API 에러 코드
 */
export enum ApiErrorCode {
  // 4xx 클라이언트 에러
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // 5xx 서버 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // 비즈니스 로직 에러
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  EXPIRED = 'EXPIRED',
}

/**
 * API 에러 인터페이스
 */
export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * API 응답 인터페이스
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * 표준화된 에러 응답 생성
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  statusCode: number,
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  const error: ApiError = {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  );
}

/**
 * 표준화된 성공 응답 생성
 */
export function createSuccessResponse<T = any>(
  data: T,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  });
}

/**
 * 사전 정의된 에러 응답 함수들
 */
export const ApiErrors = {
  // 400 Bad Request
  badRequest: (message = '잘못된 요청입니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.BAD_REQUEST, message, 400, details),

  // 401 Unauthorized
  unauthorized: (message = '로그인이 필요합니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.UNAUTHORIZED, message, 401, details),

  // 403 Forbidden
  forbidden: (message = '권한이 없습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.FORBIDDEN, message, 403, details),

  // 404 Not Found
  notFound: (message = '요청한 리소스를 찾을 수 없습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.NOT_FOUND, message, 404, details),

  // 409 Conflict
  conflict: (message = '이미 존재하는 리소스입니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.CONFLICT, message, 409, details),

  // 422 Validation Error
  validationError: (message = '입력 데이터가 올바르지 않습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.VALIDATION_ERROR, message, 422, details),

  // 429 Too Many Requests
  tooManyRequests: (message = '요청 횟수를 초과했습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.TOO_MANY_REQUESTS, message, 429, details),

  // 500 Internal Server Error
  internalError: (message = '서버 오류가 발생했습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.INTERNAL_ERROR, message, 500, details),

  // 503 Service Unavailable
  serviceUnavailable: (message = '서비스를 일시적으로 사용할 수 없습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.SERVICE_UNAVAILABLE, message, 503, details),

  // 비즈니스 로직 에러
  insufficientFunds: (message = '잔액이 부족합니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.INSUFFICIENT_FUNDS, message, 400, details),

  outOfStock: (message = '재고가 부족합니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.OUT_OF_STOCK, message, 400, details),

  alreadyExists: (message = '이미 존재합니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.ALREADY_EXISTS, message, 409, details),

  expired: (message = '만료되었습니다', details?: Record<string, any>) =>
    createErrorResponse(ApiErrorCode.EXPIRED, message, 400, details),
};

/**
 * 에러를 캐치하고 표준화된 응답 반환
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Prisma 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;

    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        return ApiErrors.conflict('이미 존재하는 데이터입니다', {
          field: prismaError.meta?.target,
        });
      case 'P2025': // Record not found
        return ApiErrors.notFound('요청한 데이터를 찾을 수 없습니다');
      case 'P2003': // Foreign key constraint violation
        return ApiErrors.badRequest('참조 데이터가 올바르지 않습니다');
      default:
        return ApiErrors.internalError('데이터베이스 오류가 발생했습니다', {
          code: prismaError.code,
        });
    }
  }

  // Error 객체 처리
  if (error instanceof Error) {
    return ApiErrors.internalError(error.message);
  }

  // 기타 에러
  return ApiErrors.internalError();
}

/**
 * 에러 로깅 (Phase 6에서 Sentry 통합 예정)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  console.error('Error logged:', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Phase 6에서 Sentry.captureException(error, { extra: context });
}

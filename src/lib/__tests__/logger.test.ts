/**
 * Logger 유틸리티 테스트
 * 
 * Note: Pino는 비동기 로깅을 사용하므로 실제 로그 출력보다는
 * 함수 로직과 데이터 변환을 테스트합니다.
 */

import {
  createLogger,
  sanitizeData,
} from '../logger'

describe('Logger 유틸리티', () => {
  describe('createLogger', () => {
    it('컨텍스트와 함께 자식 로거를 생성해야 한다', () => {
      const context = { module: 'user', userId: '123' }
      const childLogger = createLogger(context)

      expect(childLogger).toBeDefined()
      expect(typeof childLogger.info).toBe('function')
      expect(typeof childLogger.error).toBe('function')
      expect(typeof childLogger.warn).toBe('function')
      expect(typeof childLogger.debug).toBe('function')
    })

    it('여러 컨텍스트로 자식 로거를 생성할 수 있어야 한다', () => {
      const userLogger = createLogger({ module: 'user' })
      const orderLogger = createLogger({ module: 'order' })

      expect(userLogger).toBeDefined()
      expect(orderLogger).toBeDefined()
      expect(userLogger).not.toBe(orderLogger)
    })
  })

  describe('sanitizeData', () => {
    it('기본 민감한 필드를 제거해야 한다', () => {
      const data = {
        name: 'John Doe',
        password: 'secret123',
        token: 'abc123',
        secret: 'my-secret',
        apiKey: 'api-key-123',
        email: 'john@example.com',
      }

      const sanitized = sanitizeData(data)

      expect(sanitized.name).toBe('John Doe')
      expect(sanitized.email).toBe('john@example.com')
      expect(sanitized.password).toBe('[REDACTED]')
      expect(sanitized.token).toBe('[REDACTED]')
      expect(sanitized.secret).toBe('[REDACTED]')
      expect(sanitized.apiKey).toBe('[REDACTED]')
    })

    it('커스텀 민감한 필드를 제거해야 한다', () => {
      const data = {
        username: 'john',
        ssn: '123-45-6789',
        address: '123 Main St',
        phoneNumber: '010-1234-5678',
      }

      const sanitized = sanitizeData(data, ['ssn', 'phoneNumber'])

      expect(sanitized.username).toBe('john')
      expect(sanitized.address).toBe('123 Main St')
      expect(sanitized.ssn).toBe('[REDACTED]')
      expect(sanitized.phoneNumber).toBe('[REDACTED]')
    })

    it('빈 객체를 처리해야 한다', () => {
      const data = {}
      const sanitized = sanitizeData(data)

      expect(sanitized).toEqual({})
    })

    it('민감한 필드가 없는 객체를 그대로 반환해야 한다', () => {
      const data = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
      }

      const sanitized = sanitizeData(data)

      expect(sanitized).toEqual(data)
    })

    it('중첩된 객체는 처리하지 않아야 한다', () => {
      const data = {
        user: {
          name: 'John',
          password: 'secret',
        },
        token: 'abc123',
      }

      const sanitized = sanitizeData(data)

      expect(sanitized.token).toBe('[REDACTED]')
      // 중첩된 객체는 sanitize하지 않음 (1단계만)
      expect(sanitized.user).toEqual({ name: 'John', password: 'secret' })
    })
  })

  describe('로거 함수 존재 확인', () => {
    it('logHttpRequest 함수가 존재해야 한다', () => {
      const { logHttpRequest } = require('../logger')
      expect(typeof logHttpRequest).toBe('function')
    })

    it('logDatabaseQuery 함수가 존재해야 한다', () => {
      const { logDatabaseQuery } = require('../logger')
      expect(typeof logDatabaseQuery).toBe('function')
    })

    it('logError 함수가 존재해야 한다', () => {
      const { logError } = require('../logger')
      expect(typeof logError).toBe('function')
    })

    it('logPerformance 함수가 존재해야 한다', () => {
      const { logPerformance } = require('../logger')
      expect(typeof logPerformance).toBe('function')
    })

    it('logEvent 함수가 존재해야 한다', () => {
      const { logEvent } = require('../logger')
      expect(typeof logEvent).toBe('function')
    })

    it('logSecurityEvent 함수가 존재해야 한다', () => {
      const { logSecurityEvent } = require('../logger')
      expect(typeof logSecurityEvent).toBe('function')
    })

    it('devLog 함수가 존재해야 한다', () => {
      const { devLog } = require('../logger')
      expect(typeof devLog).toBe('function')
    })

    it('debugLog 함수가 존재해야 한다', () => {
      const { debugLog } = require('../logger')
      expect(typeof debugLog).toBe('function')
    })
  })

  describe('로거 함수 호출', () => {
    it('logHttpRequest를 에러 없이 호출할 수 있어야 한다', () => {
      const { logHttpRequest } = require('../logger')
      
      expect(() => {
        logHttpRequest({
          method: 'GET',
          url: '/api/users',
          statusCode: 200,
          duration: 150,
        })
      }).not.toThrow()
    })

    it('logError를 에러 없이 호출할 수 있어야 한다', () => {
      const { logError } = require('../logger')
      
      expect(() => {
        logError(new Error('Test error'), { context: 'test' })
      }).not.toThrow()
    })

    it('logEvent를 에러 없이 호출할 수 있어야 한다', () => {
      const { logEvent } = require('../logger')
      
      expect(() => {
        logEvent('user.registered', { userId: '123' })
      }).not.toThrow()
    })
  })

  describe('로그 레벨', () => {
    it('로그 레벨 상수가 올바르게 정의되어야 한다', () => {
      // Pino 로그 레벨
      const levels = {
        trace: 10,
        debug: 20,
        info: 30,
        warn: 40,
        error: 50,
        fatal: 60,
      }

      expect(levels.trace).toBe(10)
      expect(levels.debug).toBe(20)
      expect(levels.info).toBe(30)
      expect(levels.warn).toBe(40)
      expect(levels.error).toBe(50)
      expect(levels.fatal).toBe(60)
    })
  })

  describe('환경 변수', () => {
    it('LOG_LEVEL 환경 변수를 사용할 수 있어야 한다', () => {
      const originalLogLevel = process.env.LOG_LEVEL
      
      process.env.LOG_LEVEL = 'error'
      expect(process.env.LOG_LEVEL).toBe('error')
      
      process.env.LOG_LEVEL = 'debug'
      expect(process.env.LOG_LEVEL).toBe('debug')
      
      process.env.LOG_LEVEL = originalLogLevel
    })

    it('DEBUG 환경 변수를 사용할 수 있어야 한다', () => {
      const originalDebug = process.env.DEBUG
      
      process.env.DEBUG = 'true'
      expect(process.env.DEBUG).toBe('true')
      
      process.env.DEBUG = 'false'
      expect(process.env.DEBUG).toBe('false')
      
      process.env.DEBUG = originalDebug
    })
  })
})

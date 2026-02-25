import {
  PerformanceMonitor,
  getRating,
  WEB_VITALS_THRESHOLDS,
  measureApiCall,
  getMemoryUsage,
  getNetworkInfo,
  warnIfSlow,
} from '../performance'

describe('Performance 유틸리티', () => {
  describe('getRating', () => {
    it('good 값을 반환해야 한다', () => {
      expect(getRating('LCP', 2000)).toBe('good')
      expect(getRating('FID', 50)).toBe('good')
      expect(getRating('CLS', 0.05)).toBe('good')
    })

    it('needs-improvement 값을 반환해야 한다', () => {
      expect(getRating('LCP', 3000)).toBe('needs-improvement')
      expect(getRating('FID', 200)).toBe('needs-improvement')
      expect(getRating('CLS', 0.15)).toBe('needs-improvement')
    })

    it('poor 값을 반환해야 한다', () => {
      expect(getRating('LCP', 5000)).toBe('poor')
      expect(getRating('FID', 400)).toBe('poor')
      expect(getRating('CLS', 0.3)).toBe('poor')
    })

    it('경계값을 올바르게 처리해야 한다', () => {
      // LCP: good <= 2500, poor > 4000
      expect(getRating('LCP', 2500)).toBe('good')
      expect(getRating('LCP', 2501)).toBe('needs-improvement')
      expect(getRating('LCP', 4000)).toBe('needs-improvement')
      expect(getRating('LCP', 4001)).toBe('poor')
    })
  })

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor

    beforeEach(() => {
      monitor = new PerformanceMonitor()
      jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(console, 'warn').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('start()와 end()로 시간을 측정할 수 있어야 한다', () => {
      monitor.start('test')
      const duration = monitor.end('test')

      expect(duration).toBeGreaterThanOrEqual(0)
      expect(typeof duration).toBe('number')
    })

    it('존재하지 않는 mark를 end할 때 0을 반환해야 한다', () => {
      jest.spyOn(console, 'warn').mockImplementation()
      const duration = monitor.end('non-existent')

      expect(duration).toBe(0)
      expect(console.warn).toHaveBeenCalledWith(
        'No start mark found for: non-existent'
      )
    })

    it('measure()로 비동기 함수를 측정할 수 있어야 한다', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result')

      const result = await monitor.measure('async-test', asyncFn)

      expect(result).toBe('result')
      expect(asyncFn).toHaveBeenCalled()
    })

    it('measure()에서 에러가 발생해도 시간을 측정하고 에러를 throw해야 한다', async () => {
      const error = new Error('Test error')
      const asyncFn = jest.fn().mockRejectedValue(error)

      await expect(monitor.measure('error-test', asyncFn)).rejects.toThrow(
        'Test error'
      )
    })

    it('measureSync()로 동기 함수를 측정할 수 있어야 한다', () => {
      const syncFn = jest.fn().mockReturnValue('result')

      const result = monitor.measureSync('sync-test', syncFn)

      expect(result).toBe('result')
      expect(syncFn).toHaveBeenCalled()
    })

    it('measureSync()에서 에러가 발생해도 시간을 측정하고 에러를 throw해야 한다', () => {
      const error = new Error('Test error')
      const syncFn = jest.fn().mockImplementation(() => {
        throw error
      })

      expect(() => monitor.measureSync('error-test', syncFn)).toThrow(
        'Test error'
      )
    })
  })

  describe('measureApiCall', () => {
    it('API 호출을 측정하고 결과를 반환해야 한다', async () => {
      const apiCall = jest.fn().mockResolvedValue({ data: 'test' })

      const result = await measureApiCall('GET /api/test', apiCall)

      expect(result).toEqual({ data: 'test' })
      expect(apiCall).toHaveBeenCalled()
    })

    it('API 호출에서 에러가 발생하면 에러를 throw해야 한다', async () => {
      const error = new Error('API Error')
      const apiCall = jest.fn().mockRejectedValue(error)

      await expect(measureApiCall('GET /api/test', apiCall)).rejects.toThrow(
        'API Error'
      )
    })
  })

  describe('getMemoryUsage', () => {
    it('메모리 정보를 반환해야 한다 (performance.memory가 있을 때)', () => {
      // Mock performance.memory
      const mockMemory = {
        usedJSHeapSize: 50 * 1048576, // 50MB
        totalJSHeapSize: 100 * 1048576, // 100MB
        jsHeapSizeLimit: 2048 * 1048576, // 2048MB
      }

      Object.defineProperty(performance, 'memory', {
        value: mockMemory,
        configurable: true,
      })

      const memory = getMemoryUsage()

      expect(memory).toEqual({
        used: 50,
        total: 100,
        limit: 2048,
      })
    })

    it('performance.memory가 없으면 null을 반환해야 한다', () => {
      Object.defineProperty(performance, 'memory', {
        value: undefined,
        configurable: true,
      })

      const memory = getMemoryUsage()

      expect(memory).toBeNull()
    })
  })

  describe('getNetworkInfo', () => {
    it('네트워크 정보를 반환해야 한다 (navigator.connection이 있을 때)', () => {
      const mockConnection = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      }

      Object.defineProperty(navigator, 'connection', {
        value: mockConnection,
        configurable: true,
      })

      const network = getNetworkInfo()

      expect(network).toEqual({
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      })
    })

    it('navigator.connection이 없으면 null을 반환해야 한다', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        configurable: true,
      })

      const network = getNetworkInfo()

      expect(network).toBeNull()
    })
  })

  describe('warnIfSlow', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('임계값을 초과하면 경고를 출력해야 한다', () => {
      warnIfSlow('slow-operation', 1500, 1000)

      expect(console.warn).toHaveBeenCalledWith(
        '[Performance Warning] slow-operation took 1500.00ms (threshold: 1000ms)'
      )
    })

    it('임계값 이하면 경고를 출력하지 않아야 한다', () => {
      warnIfSlow('fast-operation', 500, 1000)

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('기본 임계값(1000ms)을 사용해야 한다', () => {
      warnIfSlow('operation', 1500)

      expect(console.warn).toHaveBeenCalledWith(
        '[Performance Warning] operation took 1500.00ms (threshold: 1000ms)'
      )
    })
  })

  describe('WEB_VITALS_THRESHOLDS', () => {
    it('올바른 임계값을 가져야 한다', () => {
      expect(WEB_VITALS_THRESHOLDS.LCP).toEqual({ good: 2500, poor: 4000 })
      expect(WEB_VITALS_THRESHOLDS.FID).toEqual({ good: 100, poor: 300 })
      expect(WEB_VITALS_THRESHOLDS.CLS).toEqual({ good: 0.1, poor: 0.25 })
      expect(WEB_VITALS_THRESHOLDS.FCP).toEqual({ good: 1800, poor: 3000 })
      expect(WEB_VITALS_THRESHOLDS.TTFB).toEqual({ good: 800, poor: 1800 })
      expect(WEB_VITALS_THRESHOLDS.INP).toEqual({ good: 200, poor: 500 })
    })
  })
})

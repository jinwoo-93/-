import { prisma } from './db';

// 기본 환율 (API 실패 시 fallback)
const DEFAULT_EXCHANGE_RATES = {
  KRW_TO_CNY: 0.0054, // 1 KRW = 0.0054 CNY
  CNY_TO_KRW: 185.19, // 1 CNY = 185.19 KRW
};

// 메모리 캐시 (5분)
let exchangeRateCache: {
  krwToCny: number;
  cnyToKrw: number;
  lastUpdated: Date;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 외부 환율 API에서 환율 데이터 가져오기
 * @returns 환율 데이터 또는 null
 */
async function fetchExternalExchangeRate(): Promise<{
  krwToCny: number;
  cnyToKrw: number;
} | null> {
  try {
    // exchangerate-api.com 사용 (무료 티어 지원)
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey) {
      console.warn('EXCHANGE_RATE_API_KEY not configured, using fallback');
      return null;
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/KRW/CNY`,
      { next: { revalidate: 3600 } } // 1시간 캐시
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error(`API error: ${data['error-type']}`);
    }

    const krwToCny = data.conversion_rate;
    const cnyToKrw = 1 / krwToCny;

    return { krwToCny, cnyToKrw };
  } catch (error) {
    console.error('Failed to fetch exchange rate from external API:', error);
    return null;
  }
}

/**
 * DB에서 최신 환율 데이터 가져오기
 * @returns 환율 데이터 또는 null
 */
async function fetchFromDatabase(): Promise<{
  krwToCny: number;
  cnyToKrw: number;
} | null> {
  try {
    const [krwToCnyRate, cnyToKrwRate] = await Promise.all([
      prisma.exchangeRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: 'KRW',
            toCurrency: 'CNY',
          },
        },
      }),
      prisma.exchangeRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: 'CNY',
            toCurrency: 'KRW',
          },
        },
      }),
    ]);

    if (krwToCnyRate && cnyToKrwRate) {
      // 24시간 이내의 데이터만 유효
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (krwToCnyRate.updatedAt > oneDayAgo) {
        return {
          krwToCny: krwToCnyRate.rate,
          cnyToKrw: cnyToKrwRate.rate,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch exchange rate from database:', error);
    return null;
  }
}

/**
 * DB에 환율 데이터 저장
 */
async function saveToDatabase(krwToCny: number, cnyToKrw: number): Promise<void> {
  try {
    await Promise.all([
      prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: 'KRW',
            toCurrency: 'CNY',
          },
        },
        update: {
          rate: krwToCny,
          updatedAt: new Date(),
        },
        create: {
          fromCurrency: 'KRW',
          toCurrency: 'CNY',
          rate: krwToCny,
        },
      }),
      prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: 'CNY',
            toCurrency: 'KRW',
          },
        },
        update: {
          rate: cnyToKrw,
          updatedAt: new Date(),
        },
        create: {
          fromCurrency: 'CNY',
          toCurrency: 'KRW',
          rate: cnyToKrw,
        },
      }),
    ]);
  } catch (error) {
    console.error('Failed to save exchange rate to database:', error);
  }
}

/**
 * 환율 가져오기 (캐시 → API → DB → 기본값 순서로 fallback)
 */
export async function getExchangeRate(): Promise<{
  krwToCny: number;
  cnyToKrw: number;
  source: 'cache' | 'api' | 'database' | 'default';
}> {
  // 1. 캐시 확인
  if (exchangeRateCache && Date.now() - exchangeRateCache.lastUpdated.getTime() < CACHE_DURATION) {
    return {
      ...exchangeRateCache,
      source: 'cache',
    };
  }

  // 2. 외부 API 호출
  const externalRate = await fetchExternalExchangeRate();
  if (externalRate) {
    // 캐시 업데이트
    exchangeRateCache = {
      ...externalRate,
      lastUpdated: new Date(),
    };

    // DB에도 저장 (비동기로 처리)
    saveToDatabase(externalRate.krwToCny, externalRate.cnyToKrw);

    return {
      ...externalRate,
      source: 'api',
    };
  }

  // 3. DB에서 최신 데이터 조회
  const dbRate = await fetchFromDatabase();
  if (dbRate) {
    // 캐시 업데이트
    exchangeRateCache = {
      ...dbRate,
      lastUpdated: new Date(),
    };

    return {
      ...dbRate,
      source: 'database',
    };
  }

  // 4. 기본값 반환
  return {
    krwToCny: DEFAULT_EXCHANGE_RATES.KRW_TO_CNY,
    cnyToKrw: DEFAULT_EXCHANGE_RATES.CNY_TO_KRW,
    source: 'default',
  };
}

/**
 * 환율 강제 업데이트 (Cron Job에서 호출)
 */
export async function updateExchangeRate(): Promise<{
  success: boolean;
  source: string;
  rates?: { krwToCny: number; cnyToKrw: number };
  error?: string;
}> {
  try {
    // 외부 API에서 최신 환율 가져오기
    const externalRate = await fetchExternalExchangeRate();

    if (externalRate) {
      // DB에 저장
      await saveToDatabase(externalRate.krwToCny, externalRate.cnyToKrw);

      // 캐시 업데이트
      exchangeRateCache = {
        ...externalRate,
        lastUpdated: new Date(),
      };

      return {
        success: true,
        source: 'api',
        rates: externalRate,
      };
    }

    return {
      success: false,
      source: 'api',
      error: 'Failed to fetch from external API',
    };
  } catch (error) {
    return {
      success: false,
      source: 'api',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * KRW를 CNY로 변환
 */
export async function convertKRWtoCNY(amountKRW: number): Promise<number> {
  const { krwToCny } = await getExchangeRate();
  return Math.round(amountKRW * krwToCny * 100) / 100;
}

/**
 * CNY를 KRW로 변환
 */
export async function convertCNYtoKRW(amountCNY: number): Promise<number> {
  const { cnyToKrw } = await getExchangeRate();
  return Math.round(amountCNY * cnyToKrw);
}

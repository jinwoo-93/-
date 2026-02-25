/**
 * Validation 시스템 테스트
 */

import {
  phoneNumberSchema,
  emailSchema,
  passwordSchema,
  urlSchema,
  priceSchema,
  quantitySchema,
  percentageSchema,
  usernameSchema,
  userRegistrationSchema,
  userLoginSchema,
  productSchema,
  orderSchema,
  reviewSchema,
  searchQuerySchema,
  paginationSchema,
  safeParseData,
  formatValidationErrors,
  validateField,
} from '../validation'

describe('Validation 시스템', () => {
  describe('공통 검증 스키마', () => {
    describe('phoneNumberSchema', () => {
      it('올바른 전화번호를 검증해야 한다', () => {
        const result = phoneNumberSchema.safeParse('010-1234-5678')
        expect(result.success).toBe(true)
      })

      it('잘못된 전화번호를 거부해야 한다', () => {
        expect(phoneNumberSchema.safeParse('01012345678').success).toBe(false)
        expect(phoneNumberSchema.safeParse('010-12-5678').success).toBe(false)
        expect(phoneNumberSchema.safeParse('010-1234-567').success).toBe(false)
      })
    })

    describe('emailSchema', () => {
      it('올바른 이메일을 검증해야 한다', () => {
        expect(emailSchema.safeParse('test@example.com').success).toBe(true)
        expect(emailSchema.safeParse('user.name@domain.co.kr').success).toBe(true)
      })

      it('잘못된 이메일을 거부해야 한다', () => {
        expect(emailSchema.safeParse('invalid').success).toBe(false)
        expect(emailSchema.safeParse('test@').success).toBe(false)
        expect(emailSchema.safeParse('@example.com').success).toBe(false)
      })

      it('이메일 길이를 검증해야 한다', () => {
        expect(emailSchema.safeParse('a@b.c').success).toBe(false) // 너무 짧음
        expect(emailSchema.safeParse('a'.repeat(100) + '@example.com').success).toBe(false) // 너무 김
      })
    })

    describe('passwordSchema', () => {
      it('강력한 비밀번호를 검증해야 한다', () => {
        expect(passwordSchema.safeParse('Password123!').success).toBe(true)
        expect(passwordSchema.safeParse('MyP@ssw0rd').success).toBe(true)
      })

      it('약한 비밀번호를 거부해야 한다', () => {
        expect(passwordSchema.safeParse('short1!').success).toBe(false) // 너무 짧음
        expect(passwordSchema.safeParse('password123').success).toBe(false) // 특수문자 없음
        expect(passwordSchema.safeParse('Password!').success).toBe(false) // 숫자 없음
        expect(passwordSchema.safeParse('12345678!').success).toBe(false) // 영문 없음
      })
    })

    describe('urlSchema', () => {
      it('올바른 URL을 검증해야 한다', () => {
        expect(urlSchema.safeParse('https://example.com').success).toBe(true)
        expect(urlSchema.safeParse('http://localhost:3000/path').success).toBe(true)
      })

      it('잘못된 URL을 거부해야 한다', () => {
        expect(urlSchema.safeParse('not-a-url').success).toBe(false)
        expect(urlSchema.safeParse('just-text').success).toBe(false)
        expect(urlSchema.safeParse('//example.com').success).toBe(false)
      })
    })

    describe('priceSchema', () => {
      it('올바른 가격을 검증해야 한다', () => {
        expect(priceSchema.safeParse(100).success).toBe(true)
        expect(priceSchema.safeParse(9999.99).success).toBe(true)
      })

      it('잘못된 가격을 거부해야 한다', () => {
        expect(priceSchema.safeParse(0).success).toBe(false) // 0
        expect(priceSchema.safeParse(-100).success).toBe(false) // 음수
        expect(priceSchema.safeParse(2000000000).success).toBe(false) // 너무 큼
      })
    })

    describe('quantitySchema', () => {
      it('올바른 수량을 검증해야 한다', () => {
        expect(quantitySchema.safeParse(1).success).toBe(true)
        expect(quantitySchema.safeParse(100).success).toBe(true)
      })

      it('잘못된 수량을 거부해야 한다', () => {
        expect(quantitySchema.safeParse(0).success).toBe(false) // 0
        expect(quantitySchema.safeParse(-1).success).toBe(false) // 음수
        expect(quantitySchema.safeParse(1.5).success).toBe(false) // 실수
        expect(quantitySchema.safeParse(2000000).success).toBe(false) // 너무 큼
      })
    })

    describe('percentageSchema', () => {
      it('올바른 퍼센트를 검증해야 한다', () => {
        expect(percentageSchema.safeParse(0).success).toBe(true)
        expect(percentageSchema.safeParse(50).success).toBe(true)
        expect(percentageSchema.safeParse(100).success).toBe(true)
      })

      it('범위를 벗어난 퍼센트를 거부해야 한다', () => {
        expect(percentageSchema.safeParse(-1).success).toBe(false)
        expect(percentageSchema.safeParse(101).success).toBe(false)
      })
    })
  })

  describe('사용자 검증 스키마', () => {
    describe('usernameSchema', () => {
      it('올바른 사용자 이름을 검증해야 한다', () => {
        expect(usernameSchema.safeParse('john_doe').success).toBe(true)
        expect(usernameSchema.safeParse('홍길동').success).toBe(true)
        expect(usernameSchema.safeParse('user-123').success).toBe(true)
      })

      it('잘못된 사용자 이름을 거부해야 한다', () => {
        expect(usernameSchema.safeParse('a').success).toBe(false) // 너무 짧음
        expect(usernameSchema.safeParse('user@name').success).toBe(false) // 특수문자
        expect(usernameSchema.safeParse('a'.repeat(51)).success).toBe(false) // 너무 김
      })
    })

    describe('userRegistrationSchema', () => {
      it('올바른 회원가입 데이터를 검증해야 한다', () => {
        const data = {
          email: 'test@example.com',
          password: 'Password123!',
          name: '홍길동',
          agreeToTerms: true,
          agreeToPrivacy: true,
        }
        expect(userRegistrationSchema.safeParse(data).success).toBe(true)
      })

      it('약관 동의하지 않으면 거부해야 한다', () => {
        const data = {
          email: 'test@example.com',
          password: 'Password123!',
          name: '홍길동',
          agreeToTerms: false,
          agreeToPrivacy: true,
        }
        expect(userRegistrationSchema.safeParse(data).success).toBe(false)
      })
    })

    describe('userLoginSchema', () => {
      it('올바른 로그인 데이터를 검증해야 한다', () => {
        const data = {
          email: 'test@example.com',
          password: 'any-password',
        }
        expect(userLoginSchema.safeParse(data).success).toBe(true)
      })
    })
  })

  describe('상품 검증 스키마', () => {
    describe('productSchema', () => {
      it('올바른 상품 데이터를 검증해야 한다', () => {
        const data = {
          name: '테스트 상품',
          description: '이것은 테스트 상품 설명입니다.',
          price: 10000,
          stock: 100,
          category: 'electronics',
          images: ['https://example.com/image.jpg'],
        }
        expect(productSchema.safeParse(data).success).toBe(true)
      })

      it('이미지가 없으면 거부해야 한다', () => {
        const data = {
          name: '테스트 상품',
          description: '이것은 테스트 상품 설명입니다.',
          price: 10000,
          stock: 100,
          category: 'electronics',
          images: [],
        }
        expect(productSchema.safeParse(data).success).toBe(false)
      })
    })
  })

  describe('주문 검증 스키마', () => {
    describe('orderSchema', () => {
      it('올바른 주문 데이터를 검증해야 한다', () => {
        const data = {
          items: [
            {
              productId: '123e4567-e89b-12d3-a456-426614174000',
              quantity: 2,
              price: 10000,
            },
          ],
          shippingAddress: {
            recipientName: '홍길동',
            phoneNumber: '010-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            postalCode: '12345',
            city: '서울',
            country: '대한민국',
          },
          paymentMethod: 'card',
        }
        expect(orderSchema.safeParse(data).success).toBe(true)
      })

      it('주문 항목이 없으면 거부해야 한다', () => {
        const data = {
          items: [],
          shippingAddress: {
            recipientName: '홍길동',
            phoneNumber: '010-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            postalCode: '12345',
            city: '서울',
            country: '대한민국',
          },
          paymentMethod: 'card',
        }
        expect(orderSchema.safeParse(data).success).toBe(false)
      })
    })
  })

  describe('리뷰 검증 스키마', () => {
    describe('reviewSchema', () => {
      it('올바른 리뷰 데이터를 검증해야 한다', () => {
        const data = {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          rating: 5,
          title: '좋은 상품입니다',
          content: '매우 만족스러운 구매였습니다. 추천합니다!',
        }
        expect(reviewSchema.safeParse(data).success).toBe(true)
      })

      it('평점 범위를 벗어나면 거부해야 한다', () => {
        const data = {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          rating: 6,
          title: '좋은 상품입니다',
          content: '매우 만족스러운 구매였습니다.',
        }
        expect(reviewSchema.safeParse(data).success).toBe(false)
      })
    })
  })

  describe('검색 검증 스키마', () => {
    describe('searchQuerySchema', () => {
      it('올바른 검색 쿼리를 검증해야 한다', () => {
        const data = {
          query: '노트북',
          category: 'electronics',
          minPrice: 500000,
          maxPrice: 2000000,
          sortBy: 'price_asc',
          page: 1,
          limit: 20,
        }
        expect(searchQuerySchema.safeParse(data).success).toBe(true)
      })

      it('기본값을 적용해야 한다', () => {
        const data = { query: '노트북' }
        const result = searchQuerySchema.safeParse(data)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.page).toBe(1)
          expect(result.data.limit).toBe(20)
        }
      })
    })
  })

  describe('헬퍼 함수', () => {
    describe('safeParseData', () => {
      it('유효한 데이터를 파싱해야 한다', () => {
        const result = safeParseData(emailSchema, 'test@example.com')
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe('test@example.com')
        }
      })

      it('유효하지 않은 데이터는 에러를 반환해야 한다', () => {
        const result = safeParseData(emailSchema, 'invalid')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors).toBeDefined()
        }
      })
    })

    describe('formatValidationErrors', () => {
      it('검증 에러를 포맷해야 한다', () => {
        const result = userLoginSchema.safeParse({
          email: 'invalid',
          password: '',
        })
        
        if (!result.success) {
          const formatted = formatValidationErrors(result.error)
          expect(formatted).toHaveProperty('email')
          expect(formatted).toHaveProperty('password')
        }
      })
    })

    describe('validateField', () => {
      it('단일 필드를 검증해야 한다', () => {
        const result = validateField(emailSchema, 'test@example.com')
        expect(result.valid).toBe(true)
        if (result.valid) {
          expect(result.value).toBe('test@example.com')
        }
      })

      it('유효하지 않은 필드는 에러를 반환해야 한다', () => {
        const result = validateField(emailSchema, 'invalid')
        expect(result.valid).toBe(false)
        if (!result.valid) {
          expect(result.error).toBeDefined()
        }
      })
    })
  })

  describe('페이지네이션 스키마', () => {
    it('올바른 페이지네이션을 검증해야 한다', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 20 })
      expect(result.success).toBe(true)
    })

    it('기본값을 적용해야 한다', () => {
      const result = paginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('limit 최대값을 검증해야 한다', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 101 })
      expect(result.success).toBe(false)
    })
  })
})

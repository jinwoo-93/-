import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

// 에러를 발생시키는 테스트 컴포넌트
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Console.error를 mock하여 테스트 출력 정리
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('에러가 없을 때 자식 컴포넌트를 정상적으로 렌더링해야 한다', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('자식 컴포넌트에서 에러가 발생하면 에러 UI를 표시해야 한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument()
    expect(
      screen.getByText(/예상치 못한 문제가 발생했습니다/)
    ).toBeInTheDocument()
  })

  it('다시 시도 버튼을 클릭하면 에러를 리셋해야 한다', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    // 에러 UI가 표시됨
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument()

    // 에러 조건 해제
    shouldThrow = false

    // 다시 시도 버튼 클릭
    const retryButton = screen.getByText('다시 시도')
    await user.click(retryButton)

    // 리렌더링 (에러가 해결된 상태로)
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )
  })

  it('페이지 새로고침 버튼이 존재해야 한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('페이지 새로고침')).toBeInTheDocument()
  })

  it('홈으로 버튼이 존재해야 한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('홈으로')).toBeInTheDocument()
  })

  it('커스텀 fallback UI를 렌더링할 수 있어야 한다', () => {
    const CustomFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(
      screen.queryByText('오류가 발생했습니다')
    ).not.toBeInTheDocument()
  })

  it('onError 콜백이 에러 정보와 함께 호출되어야 한다', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('개발 환경에서 에러 상세 정보를 표시해야 한다', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('상세 정보 (개발 환경)')).toBeInTheDocument()
    expect(screen.getByText(/Test error/)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('프로덕션 환경에서 에러 상세 정보를 숨겨야 한다', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.queryByText('상세 정보 (개발 환경)')
    ).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('에러 메시지가 표시되어야 한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('에러 메시지:')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('고객센터 링크가 존재해야 한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const supportLink = screen.getByText('고객센터')
    expect(supportLink).toBeInTheDocument()
    expect(supportLink.closest('a')).toHaveAttribute('href', '/help/contact')
  })
})

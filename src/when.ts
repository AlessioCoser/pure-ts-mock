import type { AsyncMockedMethodResult, Fn, InternalMock, Methods, Mock } from './mock'
import type { Any } from './any'

type ParametersWithAny<T extends (...args: any) => any> =
  Parameters<T> extends [...infer P] ? { [K in keyof P]: P[K] | Any } : never

type WhenFn<T extends Fn> = {
  (...args: ParametersWithAny<T>): {
    willReturn: (value: ReturnType<T>) => void
    willReturnOnce: (value: ReturnType<T>) => void
    willThrow: (error: Error | string) => void
    willThrowOnce: (error: Error | string) => void
  }
}

type AsyncWhenOptions = { delay?: number | null }
type AsyncWhenFn<T extends Fn> = {
  (...args: ParametersWithAny<T>): {
    willResolve: (value: Awaited<ReturnType<T>>, options?: AsyncWhenOptions) => void
    willResolveOnce: (value: Awaited<ReturnType<T>>, options?: AsyncWhenOptions) => void
    willReject: (error: Error | string, options?: AsyncWhenOptions) => void
    willRejectOnce: (error: Error | string, options?: AsyncWhenOptions) => void
  }
}

type WhenFnSelector<T extends Fn> = ReturnType<T> extends Promise<any> ? AsyncWhenFn<T> : WhenFn<T>

type When<T extends object> = {
  [K in Methods<T>]: WhenFnSelector<Extract<T[K], Fn>>
}

export const when = <T extends object>(mock: Mock<T>) => {
  const _mock = mock as InternalMock<T>
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const method = prop as unknown as Methods<T>
        return (...anyArgs: any[]) => {
          const args = anyArgs as Parameters<Extract<T[Methods<T>], Fn>>

          return {
            willReturn: (value: any) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'return', options: {} }),
            willReturnOnce: (value: any) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'return', options: {} }),
            willThrow: (value: any) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'throw', options: {} }),
            willThrowOnce: (value: any) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'throw', options: {} }),
            willResolve: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'resolve', options: asyncWhenOpts(options) }),
            willResolveOnce: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'resolve', options: asyncWhenOpts(options) }),
            willReject: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'reject', options: asyncWhenOpts(options) }),
            willRejectOnce: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'reject', options: asyncWhenOpts(options) }),
          }
        }
      },
    }
  ) as When<T>
}

function asyncWhenOpts(options: Partial<AsyncWhenOptions>): AsyncMockedMethodResult<any>['options'] {
  return { delay: null, ...options }
}

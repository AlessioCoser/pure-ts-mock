import type { AsyncMockedMethodResult, Fn, InternalMock, Methods, Mock, ParametersWithDeepAny } from './mock'

type WhenFn<T extends Fn> = {
  (...args: ParametersWithDeepAny<T>): {
    /**
     * Programs the method to return the given value every time for these arguments.
     */
    willAlwaysReturn: (value: ReturnType<T>) => void
    /**
     * Programs the method to return the given value only once for these arguments.
     * After one call, the behavior is removed.
     */
    willReturn: (value: ReturnType<T>) => void
    /**
     * Programs the method to throw the given error every time for these arguments.
     */
    willAlwaysThrow: (error: Error | string) => void
    /**
     * Programs the method to throw the given error only once for these arguments.
     * After one call, the behavior is removed.
     */
    willThrow: (error: Error | string) => void
  }
}

/**
 * Async version of WhenFn for methods returning promises.
 */
type AsyncWhenFn<T extends Fn> = {
  (...args: ParametersWithDeepAny<T>): {
    /**
     * Programs the async method to resolve with the given value every time for these arguments.
     * Optionally, specify a delay in milliseconds.
     */
    willAlwaysResolve: (value: Awaited<ReturnType<T>>, options?: AsyncWhenOptions) => void
    /**
     * Programs the async method to resolve with the given value only once for these arguments.
     * After one call, the behavior is removed.
     * Optionally, specify a delay in milliseconds.
     */
    willResolve: (value: Awaited<ReturnType<T>>, options?: AsyncWhenOptions) => void
    /**
     * Programs the async method to reject with the given error every time for these arguments.
     * Optionally, specify a delay in milliseconds.
     */
    willAlwaysReject: (error: Error | string, options?: AsyncWhenOptions) => void
    /**
     * Programs the async method to reject with the given error only once for these arguments.
     * After one call, the behavior is removed.
     * Optionally, specify a delay in milliseconds.
     */
    willReject: (error: Error | string, options?: AsyncWhenOptions) => void
  }
}

type AsyncWhenOptions = { delay?: number | null }

type WhenFnSelector<T extends Fn> = ReturnType<T> extends Promise<any> ? AsyncWhenFn<T> : WhenFn<T>

type When<T extends object> = {
  [K in Methods<T>]: WhenFnSelector<Extract<T[K], Fn>>
} & (T extends Fn ? { call: WhenFnSelector<T> } : {})
/**
 * Programs the behavior of a mocked function or object.method for specific arguments.
 * Use the returned methods to specify what the mock should do when called with those arguments.
 *
 * @example
 * when(mockedRepo).findById('id').willReturn(model)
 * when(mockedRepo).findById('id').willThrow(new Error('Not found'))
 * when(mockedFn).call('arg').willReturn('some result')
 */
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
            willAlwaysReturn: (value: any) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'return', options: {} }),
            willReturn: (value: any) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'return', options: {} }),
            willAlwaysThrow: (value: any) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'throw', options: {} }),
            willThrow: (value: any) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'throw', options: {} }),
            willAlwaysResolve: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'resolve', options: asyncWhenOpts(options) }),
            willResolve: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: true, type: 'resolve', options: asyncWhenOpts(options) }),
            willAlwaysReject: (value: any, options: AsyncWhenOptions) =>
              _mock.__mockCall(method, { args, value, once: false, type: 'reject', options: asyncWhenOpts(options) }),
            willReject: (value: any, options: AsyncWhenOptions) =>
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

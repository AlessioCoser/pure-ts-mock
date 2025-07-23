import { Any, equal } from './equal.js'

type Fn = (...args: any[]) => any

type Methods<T> = {
  [K in keyof T]: T[K] extends Fn ? K : never
}[keyof T]

type AllProperties<T> = {
  [K in keyof T as T[K] extends Fn ? never : K]: T[K]
}

type MockedMethodReturn<T extends Fn> = {
  args: Parameters<T>
  returnValue: ReturnType<T>
}
type MockedMethodThrow<T extends Fn> = {
  args: Parameters<T>
  throwError: Error | string
}
type MockedMethodResolve<T extends Fn> = {
  args: Parameters<T>
  resolveValue: Awaited<ReturnType<T>>
}
type MockedMethodReject<T extends Fn> = {
  args: Parameters<T>
  rejectValue: Error | string
}
type MockedMethodArray<T extends Fn> =
  | Array<MockedMethodReturn<T> | MockedMethodThrow<T> | MockedMethodResolve<T> | MockedMethodReject<T>>
  | undefined
type MockedMethods<T> = {
  [K in Methods<T>]: MockedMethodArray<Extract<T[K], Fn>>
}

type Calls<T> = {
  [K in Methods<T>]: Array<Parameters<Extract<T[K], Fn>>>
}

export type Mock<T extends object> = T & { __isMock: true }
type InternalMock<T extends object> = Mock<T> & {
  __calls: Calls<T>
  __mockedMethods: MockedMethods<T>
  __mockCall(
    method: Methods<T>,
    args: Parameters<Extract<T[Methods<T>], Fn>>,
    value: any,
    type: 'return' | 'throw' | 'resolve' | 'reject'
  ): void
}

export function mock<T extends object>(defaultProperties: Partial<AllProperties<T>> = {}): Mock<T> {
  const __mockedMethods: Partial<MockedMethods<T>> = {}
  const __calls: Partial<Calls<T>> = {}
  const internalMock = {
    ...defaultProperties,
    __calls,
    __mockedMethods,
    __isMock: true,
    __mockCall(
      method: Methods<T>,
      args: Parameters<Extract<T[Methods<T>], Fn>>,
      value: any,
      type: 'return' | 'throw' | 'resolve' | 'reject'
    ) {
      if (!__mockedMethods[method]) {
        __mockedMethods[method] = []
      }
      if (type === 'return') {
        __mockedMethods[method].push({ args, returnValue: value })
      } else if (type === 'throw') {
        __mockedMethods[method].push({ args, throwError: value })
      } else if (type === 'resolve') {
        __mockedMethods[method].push({ args, resolveValue: value })
      } else if (type === 'reject') {
        __mockedMethods[method].push({ args, rejectValue: value })
      }
    },
  }
  return new Proxy(internalMock as InternalMock<T>, {
    get(internal, prop) {
      const method = prop as unknown as Methods<T>
      if (method in internal) {
        return internal[method]
      }
      return (...args: any[]) => {
        const callArgs = args as Parameters<Extract<T[Methods<T>], Fn>>
        if (!internal.__calls[method]) {
          internal.__calls[method] = []
        }
        internal.__calls[method].push(callArgs)
        const results = internal.__mockedMethods[method] || []
        const matchingResult = results.find(r => equal(r.args, callArgs))
        if (!matchingResult) {
          throw new Error(`method <${String(method)}> has no matching returnValue`)
        }
        if ('returnValue' in matchingResult) return matchingResult.returnValue
        if ('throwError' in matchingResult) throw matchingResult.throwError
        if ('resolveValue' in matchingResult) return Promise.resolve(matchingResult.resolveValue)
        if ('rejectValue' in matchingResult) return Promise.reject(matchingResult.rejectValue)
      }
    },
  }) as Mock<T>
}

type VerifyFn<T extends Fn> = {
  toHaveBeenCalled: (times?: number) => void
  toHaveBeenCalledWith: (...args: Parameters<T>) => void
}
type Verify<T extends object> = {
  [K in Methods<T>]: VerifyFn<Extract<T[K], Fn>>
}

export const verify = <T extends object>(mock: Mock<T>) => {
  const internalMock = mock as InternalMock<T>
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const method = prop as unknown as Methods<T>
        return {
          toHaveBeenCalled: (times: number = 1) => {
            const numberOfCalls = internalMock.__calls[method]?.length || 0
            if (numberOfCalls !== times) {
              throw new Error(
                `Expected method ${String(method)} to be called ${times} times, but was called ${numberOfCalls} times.`
              )
            }
          },
          toHaveBeenCalledWith: (...args: Parameters<Extract<T[Methods<T>], Fn>>) => {
            const methodCalls = internalMock.__calls[method] || []
            if (!methodCalls.some(call => equal(call, args))) {
              throw new Error(
                `Expected method ${String(method)} to be called with [${args}], but it was not called with those arguments.\n\nCalls: ${JSON.stringify(methodCalls, null, 2)}`
              )
            }
          },
        } as Verify<Extract<T[Methods<T>], Fn>>
      },
    }
  ) as Verify<T>
}

type ParametersWithAny<T extends (...args: any) => any> =
  Parameters<T> extends [...infer P] ? { [K in keyof P]: P[K] | Any } : never

type WhenFn<T extends Fn> = {
  (...args: ParametersWithAny<T>): {
    willReturn: (value: ReturnType<T>) => void
    willThrow: (error: Error | string) => void
  }
}

type AsyncWhenFn<T extends Fn> = {
  (...args: ParametersWithAny<T>): {
    willResolve: (value: Awaited<ReturnType<T>>) => void
    willReject: (error: Error | string) => void
  }
}

type WhenFnSelector<T extends Fn> = ReturnType<T> extends Promise<any> ? AsyncWhenFn<T> : WhenFn<T>

type When<T extends object> = {
  [K in Methods<T>]: WhenFnSelector<Extract<T[K], Fn>>
}

export const when = <T extends object>(mock: Mock<T>) => {
  const internalMock = mock as InternalMock<T>
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const method = prop as unknown as Methods<T>
        return (...args: any[]) => {
          const allArgs = args as Parameters<Extract<T[Methods<T>], Fn>>
          return {
            willReturn: (returnValue: any) => internalMock.__mockCall(method, allArgs, returnValue, 'return'),
            willThrow: (error: any) => internalMock.__mockCall(method, allArgs, error, 'throw'),
            willResolve: (resolveValue: any) => internalMock.__mockCall(method, allArgs, resolveValue, 'resolve'),
            willReject: (rejectValue: any) => internalMock.__mockCall(method, allArgs, rejectValue, 'reject'),
          }
        }
      },
    }
  ) as When<T>
}

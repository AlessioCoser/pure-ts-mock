import { equal } from './equal'
import type { Any } from './any'

type Fn = (...args: any[]) => any

type Methods<T> = {
  [K in keyof T]: T[K] extends Fn ? K : never
}[keyof T]

type AllProperties<T> = {
  [K in keyof T as T[K] extends Fn ? never : K]: T[K]
}

type MockMethodOptions = { once: boolean }
type MockedMethodReturn<T extends Fn> = {
  args: Parameters<T>
  returnValue: ReturnType<T>
  options: MockMethodOptions
}
type MockedMethodThrow<T extends Fn> = {
  args: Parameters<T>
  throwError: Error | string
  options: MockMethodOptions
}
type MockMethodAsyncOptions = MockMethodOptions & { delay: number | null }
type MockedMethodResolve<T extends Fn> = {
  args: Parameters<T>
  resolveValue: Awaited<ReturnType<T>>
  options: MockMethodAsyncOptions
}
type MockedMethodReject<T extends Fn> = {
  args: Parameters<T>
  rejectValue: Error | string
  options: MockMethodAsyncOptions
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
    type: 'return' | 'throw' | 'resolve' | 'reject',
    options: object
  ): void
}

type HasProperties<T> = keyof AllProperties<T> extends never ? false : true

export function mock<T extends object>(
  defaultProperties?: HasProperties<T> extends true ? AllProperties<T> : never
): Mock<T> {
  const __mockedMethods: Partial<MockedMethods<T>> = {}
  const __calls: Partial<Calls<T>> = {}
  const internalMock = {
    ...(defaultProperties || {}),
    __calls,
    __mockedMethods,
    __isMock: true,
    __mockCall(
      method: Methods<T>,
      args: Parameters<Extract<T[Methods<T>], Fn>>,
      value: any,
      type: 'return' | 'throw' | 'resolve' | 'reject',
      options: object
    ) {
      if (!__mockedMethods[method]) {
        __mockedMethods[method] = []
      }
      const syncOptions = options as MockMethodOptions
      if (type === 'return') return __mockedMethods[method].push({ args, returnValue: value, options: syncOptions })
      if (type === 'throw') return __mockedMethods[method].push({ args, throwError: value, options: syncOptions })

      const asyncOptions: MockMethodAsyncOptions = { delay: null, once: false, ...options }
      if (type === 'resolve') __mockedMethods[method].push({ args, resolveValue: value, options: asyncOptions })
      if (type === 'reject') __mockedMethods[method].push({ args, rejectValue: value, options: asyncOptions })
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
        const matchingResult = results.findLast(r => equal(r.args, callArgs))
        if (!matchingResult) {
          throw `No match found for method <${String(method)}> called with arguments: ${JSON.stringify(callArgs)}`
        }
        if (matchingResult.options.once) {
          internal.__mockedMethods[method] = internal.__mockedMethods[method]?.filter(r => r !== matchingResult)
        }
        if ('returnValue' in matchingResult) return matchingResult.returnValue
        if ('throwError' in matchingResult) throw matchingResult.throwError
        if ('resolveValue' in matchingResult) return delayedPromise(matchingResult)
        if ('rejectValue' in matchingResult) return delayedPromise(matchingResult)
      }
    },
  }) as Mock<T>
}

const delayedPromise = (result: MockedMethodResolve<any> | MockedMethodReject<any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (result.options.delay === null) {
      if ('resolveValue' in result) return resolve(result.resolveValue)
      return reject(result.rejectValue)
    }
    setTimeout(() => {
      if ('resolveValue' in result) return resolve(result.resolveValue)
      if ('rejectValue' in result) return reject(result.rejectValue)
    }, result.options.delay)
  })
}

type VerifyFn<T extends Fn> = {
  toHaveBeenCalled: (times?: number) => void
  toNotHaveBeenCalled: () => void
  toHaveBeenCalledWith: (...args: Parameters<T>) => void
  toNotHaveBeenCalledWith: (...args: Parameters<T>) => void
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
        const methodCalls = internalMock.__calls[method] || []
        const callsLog = `[\n\t${methodCalls.map(call => JSON.stringify(call)).join(',\n\t')}\n]`
        return {
          toNotHaveBeenCalled: () => {
            if (methodCalls.length > 0) {
              throw `Expected method ${String(method)} to not be called, but it was called ${methodCalls.length} times.\n\nRegistered calls: ${callsLog}`
            }
          },
          toHaveBeenCalled: (times?: number) => {
            if (times === undefined && methodCalls.length === 0) {
              throw `Expected method ${String(method)} to be called at least once, but it was never called.`
            }
            if (times !== undefined && methodCalls.length === 0) {
              throw `Expected method ${String(method)} to be called ${times} times, but it was never called.`
            }
            if (times !== undefined && methodCalls.length !== times) {
              throw `Expected method ${String(method)} to be called ${times} times, but was called ${methodCalls.length} times.\n\nRegistered calls: ${callsLog}`
            }
          },
          toNotHaveBeenCalledWith: (...args: Parameters<Extract<T[Methods<T>], Fn>>) => {
            if (methodCalls.some(call => equal(call, args))) {
              throw `Expected method ${String(method)} to not be called with arguments:\n${JSON.stringify(args)}\nBut it was called with those arguments.\n\nRegistered calls: ${callsLog}`
            }
          },
          toHaveBeenCalledWith: (...args: Parameters<Extract<T[Methods<T>], Fn>>) => {
            if (!methodCalls.some(call => equal(call, args))) {
              throw `Expected method ${String(method)} to be called with arguments:\n${JSON.stringify(args)}\nBut it was not called.\n\nRegistered calls: ${callsLog}`
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
  const internalMock = mock as InternalMock<T>
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const method = prop as unknown as Methods<T>
        return (...anyArgs: any[]) => {
          const args = anyArgs as Parameters<Extract<T[Methods<T>], Fn>>
          return {
            willReturn: (value: any) => internalMock.__mockCall(method, args, value, 'return', { once: false }),
            willReturnOnce: (value: any) => internalMock.__mockCall(method, args, value, 'return', { once: true }),
            willThrow: (error: any) => internalMock.__mockCall(method, args, error, 'throw', { once: false }),
            willThrowOnce: (error: any) => internalMock.__mockCall(method, args, error, 'throw', { once: true }),
            willResolve: (value: any, options: AsyncWhenOptions) =>
              internalMock.__mockCall(method, args, value, 'resolve', {...options, once: false }),
            willResolveOnce: (value: any, options: AsyncWhenOptions) =>
              internalMock.__mockCall(method, args, value, 'resolve', {...options, once: true }),
            willReject: (value: any, options: AsyncWhenOptions) =>
              internalMock.__mockCall(method, args, value, 'reject', {...options, once: false }),
            willRejectOnce: (rejectValue: any, options: AsyncWhenOptions) =>
              internalMock.__mockCall(method, args, rejectValue, 'reject', {...options, once: true }),
          }
        }
      },
    }
  ) as When<T>
}

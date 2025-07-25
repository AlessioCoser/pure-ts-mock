import { equal } from './equal'
import type { Any } from './any'

type Fn = (...args: any[]) => any

type Methods<T> = {
  [K in keyof T]: T[K] extends Fn ? K : never
}[keyof T]

type AllProperties<T> = {
  [K in keyof T as T[K] extends Fn ? never : K]: T[K]
}

type SyncMockedMethodResult<T extends Fn> = {
  args: Parameters<T>
  value: ReturnType<T>
  once: boolean
  type: 'return' | 'throw'
  options: {}
}

type AsyncMockedMethodResult<T extends Fn> = {
  args: Parameters<T>
  value: ReturnType<T>
  once: boolean
  type: 'resolve' | 'reject'
  options: { delay: number | null }
}

type MockedMethodResult<T extends Fn> = SyncMockedMethodResult<T> | AsyncMockedMethodResult<T>

type MockedMethodArray<T extends Fn> = Array<MockedMethodResult<T>> | undefined

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
  __mockCall<K extends Methods<T>>(method: K, result: MockedMethodResult<Extract<T[K], Fn>>): void
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
    __mockCall<K extends Methods<T>>(method: Methods<T>, result: MockedMethodResult<Extract<T[K], Fn>>) {
      if (!__mockedMethods[method]) {
        __mockedMethods[method] = []
      }
      return __mockedMethods[method].push(result)
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
        if (matchingResult.once) {
          internal.__mockedMethods[method] = internal.__mockedMethods[method]?.filter(r => r !== matchingResult)
        }

        switch (matchingResult.type) {
          case 'return':
            return syncExecution<T>(matchingResult)
          case 'throw':
            return syncExecution<T>(matchingResult)
          case 'resolve':
            return asyncExecution<T>(matchingResult)
          case 'reject':
            return asyncExecution<T>(matchingResult)
        }
      }
    },
  }) as Mock<T>
}

const syncExecution = <T extends object>(res: SyncMockedMethodResult<Extract<T[Methods<T>], Fn>>): any => {
  if (res.type === 'return') return res.value
  throw res.value
}

const asyncExecution = <T extends object>(res: AsyncMockedMethodResult<Extract<T[Methods<T>], Fn>>): Promise<any> => {
  return new Promise((resolve, reject) => {
    const promiseExecution = () => {
      if (res.type === 'resolve') return resolve(res.value)
      reject(res.value)
    }

    if (res.options.delay !== null) {
      return setTimeout(promiseExecution, res.options.delay)
    }
    return promiseExecution()
  })
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

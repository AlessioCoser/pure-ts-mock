import { Any, equal } from './equal.js'

type Fn = (...args: any[]) => any

type Methods<T> = {
  [K in keyof T]: T[K] extends Fn ? K : never
}[keyof T]

type MockedMethodReturns<T extends Fn> =
  | Array<{
      args: Parameters<T>
      returnValue: ReturnType<T>
    }>
  | undefined
type MockedReturns<T> = {
  [K in Methods<T>]: MockedMethodReturns<Extract<T[K], Fn>>
}

type Calls<T> = {
  [K in Methods<T>]: Array<Parameters<Extract<T[K], Fn>>>
}

export type Mock<T extends object> = T & { __isMock: true }
type InternalMock<T extends object> = Mock<T> & {
  __calls: Calls<T>
  __mockedReturns: MockedReturns<T>
}

export function mock<T extends object>(): Mock<T> {
  const __mockedReturns: Partial<MockedReturns<T>> = {}
  const __calls: Partial<Calls<T>> = {}
  return { __calls, __mockedReturns, __isMock: true } as unknown as Mock<T>
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

export type WhenFn<T extends Fn> = {
  (...args: ParametersWithAny<T>): {
    willReturn: (value: ReturnType<T>) => void
  }
}
type When<T extends object> = {
  [K in Methods<T>]: WhenFn<Extract<T[K], Fn>>
}

export const when = <T extends object>(mock: Mock<T>) => {
  const internalMock = mock as InternalMock<T>
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const method = prop as unknown as Methods<T>
        return (...args: any[]) => {
          return {
            willReturn: (returnValue: any) => {
              if (!internalMock.__mockedReturns[method]) {
                internalMock.__mockedReturns[method] = []
              }
              internalMock.__mockedReturns[method].push({
                args: args as Parameters<Extract<T[Methods<T>], Fn>>,
                returnValue,
              })

              ;(internalMock as T)[method as keyof T] = ((...callArgs: any[]) => {
                if (!internalMock.__calls[method]) {
                  internalMock.__calls[method] = []
                }
                internalMock.__calls[method].push(callArgs as Parameters<Extract<T[Methods<T>], Fn>>)
                const returns = internalMock.__mockedReturns[method] || []
                const matchingReturn = returns.find(r => equal(r.args, callArgs))
                if (!matchingReturn) {
                  throw new Error(`method <${String(method)}> has no matching returnValue`)
                }
                return matchingReturn.returnValue
              }) as T[keyof T]
            },
          }
        }
      },
    }
  ) as When<T>
}

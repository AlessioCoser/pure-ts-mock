import type { Fn, InternalMock, Methods, Mock, ParametersWithDeepAny } from './mock'
import { equal } from './equal'

/**
 * Provides verification methods for mocked method calls.
 * Use to assert how and when a mock's methods were called in your tests.
 *
 * @example
 * verify(mockedRepo).findById.toHaveBeenCalled()
 * verify(mockedRepo).findById.toHaveBeenCalledWith('id')
 */
type VerifyFn<T extends Fn> = {
  /**
   * Asserts the method was called at least once, or a specific number of times.
   * - without arguments, checks method called at least once.
   * - with times argument, checks method called the exact number of times.
   */
  toHaveBeenCalled: (times?: number) => void
  /**
   * Asserts the method was never called.
   */
  toNotHaveBeenCalled: () => void
  /**
   * Asserts the method was called at least once with the specified arguments.
   */
  toHaveBeenCalledWith: (...args: ParametersWithDeepAny<T>) => void
  /**
   * Asserts the method was never called with the specified arguments.
   */
  toNotHaveBeenCalledWith: (...args: ParametersWithDeepAny<T>) => void
}

type Verify<T extends object> = {
  [K in Methods<T>]: VerifyFn<Extract<T[K], Fn>>
}

/**
 * Verifies the calls made to the mocked methods.
 * Use this to assert how many times a method was called, with what arguments, etc.
 *
 * @example
 * verify(mockedRepo).findById.toHaveBeenCalled()
 * verify(mockedRepo).findById.toHaveBeenCalledWith('id')
 * verify(mockedRepo).findById.toNotHaveBeenCalled()
 */
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
          toNotHaveBeenCalledWith: (...args: ParametersWithDeepAny<Extract<T[Methods<T>], Fn>>) => {
            if (methodCalls.some(call => equal(call, args))) {
              throw `Expected method ${String(method)} to not be called with arguments:\n${JSON.stringify(args)}\nBut it was called with those arguments.\n\nRegistered calls: ${callsLog}`
            }
          },
          toHaveBeenCalledWith: (...args: ParametersWithDeepAny<Extract<T[Methods<T>], Fn>>) => {
            if (!methodCalls.some(call => equal(call, args))) {
              throw `Expected method ${String(method)} to be called with arguments:\n${JSON.stringify(args)}\nBut it was not called.\n\nRegistered calls: ${callsLog}`
            }
          },
        } as Verify<Extract<T[Methods<T>], Fn>>
      },
    }
  ) as Verify<T>
}

import type { Fn, InternalMock, Methods, Mock } from './mock'
import { equal } from './equal'

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

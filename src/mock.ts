import { equal } from './equal'
import type { DeepAny } from './matchers/any-matcher'

export type Fn = (...args: any[]) => any

export type ParametersWithDeepAny<T extends Fn> =
  Parameters<T> extends [...infer P] ? { [K in keyof P]: DeepAny<P[K]> } : never

export type Methods<T> = {
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

export type AsyncMockedMethodResult<T extends Fn> = {
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

type HasProperties<T> = keyof AllProperties<T> extends never ? false : true

const allMocks: Mock<any>[] = []

/**
 * Resets all mocks created by pure-ts-mock, clearing all calls and behaviors.
 * Use this to ensure a clean slate between tests.
 */
export function resetAllMocks() {
  allMocks.forEach(mock => mock.resetMock())
}

export type Mock<T extends object> = T & { resetMock: () => void }
export type InternalMock<T extends object> = Mock<T> & {
  __calls: Calls<T>
  __mockedMethods: MockedMethods<T>
  __mockCall<K extends Methods<T>>(method: K, result: MockedMethodResult<Extract<T[K], Fn>>): void
}

/**
 * Creates a mock object for the given interface, class, or function type.
 * Optionally, provide default property values for non-method fields.
 * The returned mock tracks calls and allows you to program method behaviors.
 * Function types are fully supported. For function mocks, use `.call` in `when` and `verify`.
 */
export function mock<T extends object>(
  defaultProperties?: HasProperties<T> extends true ? AllProperties<T> : never
): Mock<T> {
  const __mockedMethods: Partial<MockedMethods<T>> = {}
  const __calls: Partial<Calls<T>> = {}
  const internalMock = {
    ...(defaultProperties || {}),
    __calls,
    __mockedMethods,
    resetMock() {
      for (const key in __calls) {
        __calls[key as keyof Calls<T>] = []
      }
      for (const key in __mockedMethods) {
        __mockedMethods[key as keyof Calls<T>] = []
      }
    },
    __mockCall<K extends Methods<T>>(method: Methods<T>, result: MockedMethodResult<Extract<T[K], Fn>>) {
      if (!__mockedMethods[method]) {
        __mockedMethods[method] = []
      }
      return __mockedMethods[method].push(result)
    },
  } as InternalMock<T>

  const mockFn = mockFunction(internalMock, 'call' as unknown as Methods<T>) as Fn
  const mock = new Proxy(Object.assign(mockFn, internalMock), {
    get: (internal, prop) => mockFunction(internal, prop as unknown as Methods<T>),
  }) as Mock<T>
  allMocks.push(mock)
  return mock
}

function mockFunction<T extends object>(internal: InternalMock<T>, method: Methods<T>) {
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
      throw new Error(
        `No match found for ${targetMethodLog(method)} called with arguments: ${JSON.stringify(callArgs)}`
      )
    }
    if (matchingResult.once) {
      internal.__mockedMethods[method] = internal.__mockedMethods[method]?.filter(r => r !== matchingResult)
    }

    switch (matchingResult.type) {
      case 'return':
      case 'throw':
        return syncExecution<T>(matchingResult)
      case 'resolve':
      case 'reject':
        return asyncExecution<T>(matchingResult)
    }
  }
}

export function targetMethodLog(method: any): string {
  return method === 'call' ? 'function' : `method <${String(method)}>`
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

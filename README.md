# pure-ts-mock

[![npm version](https://img.shields.io/npm/v/pure-ts-mock.svg)](https://www.npmjs.com/package/pure-ts-mock)
[![license](https://img.shields.io/github/license/AlessioCoser/pure-ts-mock.svg)](https://github.com/AlessioCoser/pure-ts-mock/blob/main/LICENSE)
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/pure-ts-mock?activeTab=dependencies)
<br/>[![Tests](https://github.com/AlessioCoser/pure-ts-mock/actions/workflows/tests.yml/badge.svg)](https://app.codecov.io/gh/AlessioCoser/pure-ts-mock/tests)
[![codecov](https://codecov.io/gh/AlessioCoser/pure-ts-mock/branch/main/graph/badge.svg)](https://codecov.io/gh/AlessioCoser/pure-ts-mock)

**pure-ts-mock** is a minimalist, type-safe mocking library for TypeScript. It's expressive, framework-agnostic, and has zero dependencies. Mock interfaces, classes, and functions with ease: no boilerplate, no fuss.

# Table of Contents
- [Why pure-ts-mock?](#why-pure-ts-mock)
- [Philosophy](#philosophy)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Mocking interfaces or classes](#mocking-interfaces-or-classes)
  - [Mocking Standalone Functions](#mocking-standalone-functions)
- [API Documentation](#api-documentation)
  - [`mock<T>(options?)`](#mocktoptions)
  - [`when(mock).method(...args)`](#whenmockmethodargs)
  - [`verify(mock).method`](#verifymockmethod)
  - [`any()` matchers](#any-matchers)
  - [`resetAllMocks()`](#resetallmocks)

# Why pure-ts-mock?
- ✨ **Simple**: Just `mock`, `when`, `verify`, `any` and `resetAllMocks` keywords.
- 🧑‍💻 **Expressive**: Readable, intention-revealing API.
- 🛡 **Type-Safe**: Type-checked `mock`, `when`, `verify` with their `methods` and `arguments`.
- 🔌 **Framework-Agnostic**: Works with any test runner.
- 🚫 **No Dependencies**: Pure TypeScript, zero runtime dependencies.

# Philosophy

**pure-ts-mock** is built for simplicity and productivity. As you write tests, your editor instantly guides you with smart auto-suggestions: showing only the right methods and arguments for your types. You stay focused on your test logic, not the API. **Every test becomes effortless and error-free.**

> If you’re looking for more, use it as a chance to refactor: simplify your communication with mocked dependencies, and watch your software become more resilient and easier to maintain.

If you still think a feature could be useful, please create an issue [here](https://github.com/AlessioCoser/pure-ts-mock/issues) or open a PR. The project is free, open source, and any contribution is welcomed.

# Installation

```bash
npm install --save-dev pure-ts-mock
# or
pnpm add --save-dev pure-ts-mock
# or
yarn add --dev pure-ts-mock
```

# Quick Start

## Mocking interfaces or classes:

```typescript
interface ModelRepository {
  property: string
  findById(id: string): Model | null
  all(): Promise<Model[]>
}
// Create a mock for the interface:
const mockedRepo = mock<ModelRepository>()
// Program the behavior for any argument
when(mockedRepo).findById(any()).returnOnce({ id: 'all', externalId: 'ext-all' })
// Use the mock
mockedRepo.findById('first')
// Verify the method was called with any argument
verify(mockedRepo).findById.toHaveBeenCalledWith('first')
```

## Mocking standalone functions

```typescript
type FindById = (id: string) => User | null
// Create a mock for the function:
const mockedFindById = mock<FindById>()
// Program the function's behavior:
when(mockedFindById).call('first').alwaysReturn({ id: 'first', name: 'Thor' })
// Use the mock:
mockedFindById('first')
// Verify the function was called with specific arguments:
verify(mockedFindById).call.toHaveBeenCalledWith('first')
```

**Note**: the use of `.call` in both `when` and `verify` to program and assert calls.

# API Documentation

## `mock<T>(options?)`
Creates a mock object for the given function, interface or class.

### Parameters
- `options?` (optional): Configuration object with the following properties:
  - `mode` (`relaxed | strict`, default: `strict`): Controls the mock's behavior for unprogrammed methods

### Strict and Relaxed Modes

**Strict Mode (default)**: When `mode: 'strict'` or no options are provided, the mock operates in strict mode. Calling a method or function that has not been programmed with `when` and the correct input will throw an error.

**Relaxed Mode**: When `mode: 'relaxed'` is set, the mock will return `undefined` for unprogrammed methods or functions instead of throwing.

> We strongly recommend using the 'strict' mode for most scenarios. This is why it's the default.

Strict mode provides valuable feedback about your code's design and helps you create better abstractions:
- **Forces explicit communication**: Every interaction must be intentionally programmed, making your test more precise and revealing the actual contract between components
- **Reveals coupling issues**: If you need to mock many methods, it might indicate that your code is too tightly coupled or that your interfaces are too broad
- **Guides toward better design**: The "pain" of mocking complex interactions often points to opportunities for refactoring and simplification
- **Prevents silent failures**: Unprogrammed calls fail fast, helping you catch bugs early

Relaxed mode should be used with caution, but it can be useful in specific scenarios.
One example is when working with **legacy codebases** that have broad interfaces or complex dependencies that are difficult to refactor immediately. 
It can also be used as a temporary measure while incrementally improving code design.

**Remember**: if you find yourself frequently needing relaxed mode, consider it a signal to refactor your code toward smaller, more focused interfaces and better separation of concerns.

### Usage Examples
```typescript
// Basic usage (strict mode by default)
const mockRepo = mock<ModelRepository>()
const mockFn = mock<FindById>()

// Strict mode (default behavior)
const strictMock = mock<MyInterface>({ mode: 'strict' });
strictMock.notProgrammedMethod(); // throws Error: no match found for method <notProgrammedMethod> called with arguments: []

// Relaxed mode
const relaxedMock = mock<MyInterface>({ mode: 'relaxed' });
relaxedMock.notProgrammedMethod(); // returns undefined
```

---

## `when(mock).method(...args)`
Programs the behavior of a mocked method for specific arguments. The returned object exposes:
- For sync methods:
  - `returnOnce(value)` — returns the specified value **only once** for matching arguments, then falls back to previous behavior
  - `alwaysReturn(value)` — always returns the specified value for matching arguments
  - `throwOnce(error)` — throws the specified error **only once** for matching arguments, then falls back to previous behavior
  - `alwaysThrow(error)` — always throws the specified error for matching arguments
- For async methods:
  - `resolveOnce(value, options?)` — resolves with the specified value **only once** (optionally delayed), then falls back to previous behavior
  - `alwaysResolve(value, options?)` — always resolves with the specified value (optionally delayed) for matching arguments
  - `rejectOnce(error, options?)` — rejects with the specified error **only once** (optionally delayed), then falls back to previous behavior
  - `alwaysReject(error, options?)` — always rejects with the specified error (optionally delayed) for matching arguments

If the mock is a function mock the available 'when' method will ever be only `call`: `when(mockFn).call(...args)`.

### 'when' Behavior Explained

**pure-ts-mock** does not provide any default behavior such as returning, throwing, resolving, or rejecting values.
Instead, you must explicitly define how each mock should behave.

- The "Once" variants (`returnOnce`, `throwOnce`, `resolveOnce`, `rejectOnce`) only affect the **next matching call**. After being used once, the behavior is removed and later calls use the previous behavior, if any.
- The "Always" variants (`alwaysReturn`, `alwaysThrow`, `alwaysResolve`, `alwaysReject`) persist for all matching calls until overridden.
- If multiple behaviors are programmed for the same method/arguments, the **last defined behavior takes precedence**.

> Mock interactions, not just values. Be explicit: let your tests guide better design.

Unlike most libraries, which default to "always return" behavior, **pure-ts-mock** requires you to specify the behavior you want.
This explicitness helps you:
- **reflect real interactions** and expose temporal dependencies in your code
- **reveal hidden dependencies** on repeated values
- **spot refactoring opportunities:** if you need many different responses for the same mock, your code may be too complex or tightly coupled. This clarity helps you identify where to simplify or refactor.

**Tip**: Prefer using "Once" variants to avoid unexpected behaviors in your tests.
Use "Always" variants only when you truly intend for the same value to be returned every time.

### Usage Examples
```typescript
// Sync methods
when(repo).findById('first').returnOnce(model) // returns model only once, then falls back
when(repo).findById('first').alwaysReturn(model) // always returns model
when(repo).findById('second').throwOnce(new Error('Not found')) // throws only once, then falls back
when(repo).findById('second').alwaysThrow(new Error('Not found')) // always throws

// Async methods
when(repo).all().alwaysResolve([]) // always resolves to []
when(repo).all().resolveOnce([]) // resolves to [] only once, then falls back
when(repo).all().alwaysReject(new Error('Failed'), { delay: 200 }) // always rejects
when(repo).all().rejectOnce(new Error('Failed'), { delay: 200 }) // rejects only once, then falls back

// Using any() matcher
when(repo).findById(any()).returnOnce(model)
when(repo).findById(any()).alwaysReturn(model)

// function mocks
when(mockSyncFn).call('any arg').returnOnce({ id: 'first', name: 'Thor' })
when(mockAsyncFn).call('any arg').resolveOnce('some result')
```

---

## `verify(mock).method`
Verifies how a mocked method was called. The returned object exposes:
- `toNotHaveBeenCalled()` — asserts the method was never called
- `toHaveBeenCalled(times?)` — asserts the method was called at least once, or a specific number of times
- `toNotHaveBeenCalledWith(...args)` — asserts the method was never called with the specified arguments
- `toHaveBeenCalledWith(...args)` — asserts the method was called with the specified arguments

If the mock is a function mock the available 'verify' method will ever be only `call`: `verify(mockFn).call`.

### Usage Examples
```typescript
verify(repo).findById.toHaveBeenCalled()
verify(repo).findById.toHaveBeenCalled(2)
verify(repo).findById.toHaveBeenCalledWith('first')
verify(repo).findById.toNotHaveBeenCalled()
verify(repo).findById.toNotHaveBeenCalledWith('second')
// function mocks
verify(mockFn).call.toNotHaveBeenCalled()
```

---

## `any()` matchers

pure-ts-mock provides flexible matchers for arguments and object properties using the `any` API. Matchers allow you to verify calls with flexible or custom logic.

### Built-in Matchers

- `any()` — matches any value
- `any.string()` — matches any string
- `any.string.includes(substring)` — matches strings containing `substring`
- `any.string.startsWith(prefix)` — matches strings starting with `prefix`
- `any.string.endsWith(suffix)` — matches strings ending with `suffix`
- `any.string.match(regexp)` — matches strings matching the given RegExp
- `any.number()` — matches any number
- `any.number.greaterThan(value)` — matches numbers greater than `value`
- `any.number.lowerThan(value)` — matches numbers lower than `value`
- `any.number.positive()` — matches positive numbers (>= 0)
- `any.number.negative()` — matches negative numbers (< 0)
- `any.boolean()` — matches any boolean
- `any.function()` — matches any function
- `any.object()` — matches any object (not array)
- `any.array()` — matches any array
- `any.map()` — matches any Map
- `any.instanceOf(Class)` — matches any instance of the given class (including subclasses)
- `any.uuid()` — matches any uuid-like string

### Custom Matchers
You can create custom matchers by passing a predicate function to `any<T>(predicate)`:

```typescript
import { any } from 'pure-ts-mock'

// Type-safe custom matcher: only matches numbers > 5
const anyMoreThanFiveMatcher = any<number>(actual => actual > 5)
// Type-safe custom matcher fn: only matches numbers > x
const anyMoreThanXMatcher = (x: number) => any<number>(actual => actual > x)

// Usage in when/verify:
when(mockedRepo).save({ id: any.string(), value: anyMoreThanFiveMatcher }).resolveOnce()
verify(mockedRepo).save.toHaveBeenCalledWith({ id: any.string(), value: anyMoreThanFiveMatcher })
verify(mockedRepo).save.toHaveBeenCalledWith({ id: any.string(), value: anyMoreThanXMatcher(5) })
```

- Custom matchers are type-safe: specify the type parameter so your matcher is checked for the property you use it on.
- If you don't specify a type, your matcher will be treated as `any`.
- You can use custom matchers for arguments, properties, and deep matching inside objects/arrays.

### Deep Matching
Matchers can be used inside objects and arrays for deep matching. This is useful for verifying complex structures with flexible rules:

```typescript
const expected = {
  id: any.string(),
  data: {
    value: any.number.greaterThan(10),
    tags: [any.string(), 'fixed']
  }
}
verify(mockedRepo).save.toHaveBeenCalledWith(expected)
```

---

## `resetAllMocks()`
Resets the state of all mocks created via `mock()`. Useful for ensuring a clean slate between tests.

It internally calls the public method `mock.resetMock()` on each mock instance created by `mock()`.

```typescript
const repo = mock<ModelRepository>()
const another = mock<AnotherInterface>()
repo.all()
another.aMethod()

resetAllMocks()

verify(repo).all.toNotHaveBeenCalled()
verify(another).aMethod.toNotHaveBeenCalled()
```

If you want to reset a single mock, use `resetMock()` on that specific mock instance instead.

```typescript
const repo = mock<ModelRepository>()
when(repo).all().resolveOnce([])
await repo.all()

repo.resetMock()

verify(repo).all.toNotHaveBeenCalled()
```

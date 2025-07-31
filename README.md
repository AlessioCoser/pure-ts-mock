# pure-ts-mock

[![npm version](https://img.shields.io/npm/v/pure-ts-mock.svg)](https://www.npmjs.com/package/pure-ts-mock)
[![license](https://img.shields.io/github/license/AlessioCoser/pure-ts-mock.svg)](https://github.com/AlessioCoser/pure-ts-mock/blob/main/LICENSE)
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/pure-ts-mock?activeTab=dependencies)
<br/>[![Tests](https://github.com/AlessioCoser/pure-ts-mock/actions/workflows/tests.yml/badge.svg)](https://app.codecov.io/gh/AlessioCoser/pure-ts-mock/tests)
[![codecov](https://codecov.io/gh/AlessioCoser/pure-ts-mock/branch/main/graph/badge.svg)](https://codecov.io/gh/AlessioCoser/pure-ts-mock)

**pure-ts-mock** is a minimalist, type-safe mocking library for TypeScript. It’s expressive, framework-agnostic, and has zero dependencies. Mock interfaces and classes with ease: no boilerplate, no fuss.

## Why pure-ts-mock?
- ✨ **Simple**: Just `mock`, `when`, `verify` and `any` keywords.
- 🧑‍💻 **Expressive**: Readable, intention-revealing API.
- 🛡 **Type-Safe**: Type-checked `mock`, `when`, `verify` with their `methods` and `arguments`.
- 🔌 **Framework-Agnostic**: Works with any test runner.
- 🚫 **No Dependencies**: Pure TypeScript, zero runtime dependencies.

## Philosophy

**pure-ts-mock** is built for simplicity and productivity. As you write tests, your editor instantly guides you with smart auto-suggestions: showing only the right methods and arguments for your types. You stay focused on your test logic, not the API. **Every test becomes effortless and error-free.**

> If you’re looking for more, use it as a chance to refactor: make your communication with mocked dependencies simpler, and watch your software become more resilient and easier to maintain.

If you still think a feature could be useful, please create an issue [here](https://github.com/AlessioCoser/pure-ts-mock/issues) or open a PR. The project is free, open source, and any contribution is welcomed.

## Installation

```bash
npm install --save-dev pure-ts-mock
# or
pnpm add --save-dev pure-ts-mock
# or
yarn add --dev pure-ts-mock
```

## Quick Start

Suppose you have an interface:
```typescript
interface ModelRepository {
  property: string
  findById(id: string): Model | null
  all(): Promise<Model[]>
}
```

Create a mock:
```typescript
const mockedRepo = mock<ModelRepository>()
```

Program a method and verify calls:
```typescript
// Program the behavior for any argument
when(mockedRepo).findById(any()).willReturn({ id: 'all', externalId: 'ext-all' })

// Use the mock
mockedRepo.findById('first')

// Verify the method was called with any argument
verify(mockedRepo).findById.toHaveBeenCalledWith('first')
```

## API Documentation

---

### `mock<T>(defaultProperties?)`
Creates a mock object for the given interface or class. Optionally, you can set default property values.
```typescript
const repo = mock<ModelRepository>()
const repoWithDefaults = mock<ModelRepository>({ property: 'default-value' })
```

---

### `when(mock).method(...args)`
Programs the behavior of a mocked method for specific arguments. The returned object exposes:
- For sync methods:
  - `willReturn(value)` — always returns the specified value for matching arguments
  - `willReturnOnce(value)` — returns the specified value **only once** for matching arguments, then falls back to previous behavior
  - `willThrow(error)` — always throws the specified error for matching arguments
  - `willThrowOnce(error)` — throws the specified error **only once** for matching arguments, then falls back to previous behavior
- For async methods:
  - `willResolve(value, options?)` — always resolves with the specified value (optionally delayed) for matching arguments
  - `willResolveOnce(value, options?)` — resolves with the specified value **only once** (optionally delayed), then falls back to previous behavior
  - `willReject(error, options?)` — always rejects with the specified error (optionally delayed) for matching arguments
  - `willRejectOnce(error, options?)` — rejects with the specified error **only once** (optionally delayed), then falls back to previous behavior

#### Behavior explanation
- The "Once" variants (`willReturnOnce`, `willThrowOnce`, `willResolveOnce`, `willRejectOnce`) only affect the **next matching call**. After being used once, the behavior is removed and subsequent calls use the previous (non-once) behavior, if any.
- The original variants (`willReturn`, `willThrow`, `willResolve`, `willReject`) persist for all matching calls until overridden.
- If multiple behaviors are programmed for the same method/arguments, the **last defined behavior takes precedence**.

#### Usage Examples
```typescript
// Sync methods
when(repo).findById('first').willReturn(model) // always returns model
when(repo).findById('first').willReturnOnce(model) // returns model only once, then falls back
when(repo).findById('second').willThrow(new Error('Not found')) // always throws
when(repo).findById('second').willThrowOnce(new Error('Not found')) // throws only once, then falls back

// Async methods
when(repo).all().willResolve([]) // always resolves to []
when(repo).all().willResolveOnce([]) // resolves to [] only once, then falls back
when(repo).all().willReject(new Error('Failed'), { delay: 200 }) // always rejects
when(repo).all().willRejectOnce(new Error('Failed'), { delay: 200 }) // rejects only once, then falls back

// Using any() matcher
when(repo).findById(any()).willReturn(model)
when(repo).findById(any()).willReturnOnce(model)
```

---

### `verify(mock).method`
Verifies how a mocked method was called. The returned object exposes:
- `toNotHaveBeenCalled()` — asserts the method was never called
- `toHaveBeenCalled(times?)` — asserts the method was called at least once, or a specific number of times
- `toNotHaveBeenCalledWith(...args)` — asserts the method was never called with the specified arguments
- `toHaveBeenCalledWith(...args)` — asserts the method was called with the specified arguments

**Usage Examples:**
```typescript
verify(repo).findById.toHaveBeenCalled()
verify(repo).findById.toHaveBeenCalled(2)
verify(repo).findById.toHaveBeenCalledWith('first')
verify(repo).findById.toNotHaveBeenCalled()
verify(repo).findById.toNotHaveBeenCalledWith('second')
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

### Custom Matchers
You can create custom matchers by passing a predicate function to `any<T>(predicate)`:

```ts
import { any } from 'pure-ts-mock'

// Type-safe custom matcher: only matches numbers > 5
const anyMoreThanFiveMatcher = any<number>(actual => actual > 5)

// Usage in when/verify:
when(mockedRepo).save({ id: any.string(), value: anyMoreThanFiveMatcher }).willResolve()
verify(mockedRepo).save.toHaveBeenCalledWith({ id: any.string(), value: anyMoreThanFiveMatcher })
```

- Custom matchers are type-safe: specify the type parameter so your matcher is checked for the property you use it on.
- If you don't specify a type, your matcher will be treated as `any`.
- You can use custom matchers for arguments, properties, and deep matching inside objects/arrays.

### Deep Matching
Matchers can be used inside objects and arrays for deep matching. This is useful for verifying complex structures with flexible rules:

```ts
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

### `resetMock()`
Resets the state of a single mock instance. This clears all recorded calls and programmed behaviors for that mock.

```typescript
const repo = mock<ModelRepository>()
when(repo).all().willResolve([])
await repo.all()

repo.resetMock()

verify(repo).all.toNotHaveBeenCalled()
```

---

### `resetAllMocks()`
Resets the state of all mocks created via `mock()`. Useful for ensuring a clean slate between tests.

```typescript
const repo = mock<ModelRepository>()
const another = mock<AnotherInterface>()
repo.all()
another.aMethod()

resetAllMocks()

verify(repo).all.toNotHaveBeenCalled()
verify(another).aMethod.toNotHaveBeenCalled()
```

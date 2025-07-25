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
**pure-ts-mock** is intentionally simple. If you need more, consider refactoring your code for better testability.

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

For details on programming method behaviors and verifying calls, see the [API Documentation](#api-documentation) below.

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
  - `willReturn(value)` — returns the specified value
  - `willThrow(error)` — throws the specified error
- For async methods:
  - `willResolve(value, options?)` — resolves with the specified value (optionally delayed)
  - `willReject(error, options?)` — rejects with the specified error (optionally delayed)

**Usage Examples:**
```typescript
when(repo).findById('first').willReturn(model)
when(repo).findById('second').willThrow(new Error('Not found'))
when(repo).all().willResolve([])
when(repo).all().willReject(new Error('Failed'), { delay: 200 })
when(repo).findById(any()).willReturn(model)
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

### `any(type?)`
Matches any value of the given type in argument matching. Useful for flexible argument matching in `when` and `verify`.
```typescript
when(repo).findById(any(String)).willReturn(model)
when(repo).findById(any()).willReturn(model)
```

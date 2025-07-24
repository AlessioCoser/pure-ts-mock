# pure-ts-mock

![Tests](https://github.com/AlessioCoser/pure-ts-mock/actions/workflows/tests.yml/badge.svg)
[![codecov](https://codecov.io/gh/AlessioCoser/pure-ts-mock/branch/main/graph/badge.svg)](https://codecov.io/gh/AlessioCoser/pure-ts-mock)

[![license](https://img.shields.io/github/license/AlessioCoser/pure-ts-mock.svg)](https://github.com/AlessioCoser/pure-ts-mock/blob/main/LICENSE)
![dependencies](https://img.shields.io/npm/dependencies/pure-ts-mock)
[![npm version](https://img.shields.io/npm/v/pure-ts-mock.svg)](https://www.npmjs.com/package/pure-ts-mock)
[![bundle size](https://img.shields.io/bundlephobia/minzip/pure-ts-mock)](https://bundlephobia.com/result?p=pure-ts-mock)

pure-ts-mock is a minimalist, type-safe mocking library for TypeScript. It’s designed to be expressive, framework-agnostic, and dependency-free—giving you everything you need for effective mocking, and nothing you don’t.

> If you feel the need for more, it’s probably time to refactor your code.

## Features
- 🪶 **Minimal**: No bloat, no dependencies.
- 🧑‍💻 **Expressive**: Readable, intention-revealing API.
- 🛡 **Type-Safe**: Type-checked when, verify, methods and arguments.
- 🧩 **No Boilerplate**: Just mock, when, verify and any.
- 🔌 **Framework-Agnostic**: Works with any test runner.
- 🚫 **No Dependencies**: Pure TypeScript, zero runtime dependencies.

## Philosophy
pure-ts-mock is intentionally simple. If you need more, consider refactoring your code for better testability.

## Prerequisites
- Node.js
- pnpm

## Install
_Coming soon..._

## Quick Start
Suppose you have a ModelRepository interface:
```typescript
interface ModelRepository {
  property: string
  findById(id: string): Model | null
  all(): Promise<Model[]>
}
```

### Create a Mock

To create a mock, simply call the `mock` function with your interface type:

```typescript
const mockedRepo = mock<ModelRepository>()
```

You can now use `mockedRepo` anywhere a real `ModelRepository` is expected. This mock will have all the properties and methods of your interface, but you must **program** its behavior before using it in tests.

Optionally, you can set default property values at creation:

```typescript
const mockedRepo = mock<ModelRepository>({ property: 'default-value' })
```

This sets the initial value for the `property` field. You can still override it later in your tests.

### Program Methods

You can program your mock's methods to return, throw, resolve, or reject values based on the arguments provided. This allows you to precisely control your mock's behavior in different scenarios.

```typescript
// Program a method to resolve a value (for async methods)
when(mockedRepo).all().willResolve([])

// Program a method to reject with an error (for async methods)
when(mockedRepo).all().willReject(new Error('this is an error'))

// Program a method to return a value based on a specific argument
when(mockedRepo).findById('first').willReturn({ id: 'first', externalId: 'ext-first' })

// Program a method to throw an error for a specific argument
when(mockedRepo).findById('first').willThrow(new Error('this is an error'))

// Use `any()` to match any argument of a given type
when(mockedRepo).findById(any()).willReturn({ id: 'any', externalId: 'ext-any' })
```

If a method is called but not programmed, it throws:
```
Not found matching result for method <all> called with arguments: []
```

### Verify Calls

After exercising your code, you can verify how your mock was used. The `verify` API lets you assert that methods were called, how many times, and with which arguments.

```typescript
// Verify a method was called at least once
verify(mockedRepo).findById.toHaveBeenCalled()

// Verify a method was called a specific number of times
verify(mockedRepo).findById.toHaveBeenCalled(2)

// Verify a method was called with specific arguments
verify(mockedRepo).findById.toHaveBeenCalledWith('second')

// Verify a method was called with complex/nested arguments
verify(someOtherMock).complex.toHaveBeenCalledWith({
  some: 'data',
  also: {
    nested: 'data',
    canBe: any(String),
    orAnyNumber: any(Number),
    orAny: any()
  }
})
```

If the verification fails, a clear error message will be thrown, showing what was expected and what was actually called. This helps you quickly diagnose test failures.

### Set Default Properties

You can set default property values when creating your mock. This is useful for interfaces or classes that require certain properties to be initialized:

```typescript
const mockedRepo = mock<ModelRepository>({ property: 'default-value' })
expect(mockedRepo.property).toBe('default-value')
```

You can still override these properties later in your tests.

### Program Properties

You can program (set) or update properties on your mock just like you would on a real object:

```typescript
mockedRepo.property = 'a-property-value'
expect(mockedRepo.property).toBe('a-property-value')
```

This makes it easy to simulate state changes or test how your code reacts to different property values.

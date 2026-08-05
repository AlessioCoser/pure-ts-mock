

# pure-ts-mock

[![npm version](https://img.shields.io/npm/v/pure-ts-mock.svg)](https://www.npmjs.com/package/pure-ts-mock)
[![license](https://img.shields.io/github/license/AlessioCoser/pure-ts-mock.svg)](https://github.com/AlessioCoser/pure-ts-mock/blob/main/LICENSE)
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/pure-ts-mock?activeTab=dependencies)
<br/>[![Tests](https://github.com/AlessioCoser/pure-ts-mock/actions/workflows/tests.yml/badge.svg)](https://app.codecov.io/gh/AlessioCoser/pure-ts-mock/tests)
[![codecov](https://codecov.io/gh/AlessioCoser/pure-ts-mock/branch/main/graph/badge.svg)](https://codecov.io/gh/AlessioCoser/pure-ts-mock)

**pure-ts-mock** es una biblioteca de *mocking* minimalista y segura en tipos para TypeScript. Es expresiva, agnóstica al framework y tiene cero dependencias. Simula interfaces, clases y funciones con facilidad: sin código repetitivo (*boilerplate*), sin complicaciones.

# Tabla de Contenidos
- [¿Por qué pure-ts-mock?](#why-pure-ts-mock)
- [Filosofía](#philosophy)
- [Instalación](#installation)
- [Inicio Rápido](#quick-start)
  - [Simulación de interfaces o clases](#mocking-interfaces-or-classes)
  - [Simulación de funciones independientes](#mocking-standalone-functions)
- [Documentación de la API](#api-documentation)
  - [`mock<T>(options?)`](#mocktoptions)
  - [`when(mock).method(...args)`](#whenmockmethodargs)
  - [`verify(mock).method`](#verifymockmethod)
  - [Validadores `any()`](#any-matchers)
  - [`resetAllMocks()`](#resetallmocks)

# ¿Por qué pure-ts-mock?
- ✨ **Simple**: Solo palabras clave `mock`, `when`, `verify`, `any` y `resetAllMocks`.
- 🧑‍💻 **Expresiva**: API legible que revela la intención.
- 🛡 **Segura en tipos (Type-Safe)**: `mock`, `when` y `verify` con sus `métodos` y `argumentos` son verificados por tipos.
- 🧠 **Sugerencias automáticas inteligentes**: Sugerencias del editor basadas en tipos que exponen solo métodos válidos y formas de argumentos para tus tipos simulados.
- 🔌 **Agnóstica al Framework**: Funciona con cualquier ejecutor de pruebas.
- 🚫 **Sin Dependencias**: TypeScript puro, cero dependencias en tiempo de ejecución.

# Filosofía

**pure-ts-mock** está construido para la simplicidad y la productividad. Mientras escribes pruebas, tu editor te guía instantáneamente con sugerencias automáticas inteligentes: mostrando solo los métodos y argumentos correctos para tus tipos. Te mantienes enfocado en la lógica de tu prueba, no en la API. **Cada prueba se vuelve sin esfuerzo y libre de errores.**

> Si buscas más funcionalidades, úsalo como una oportunidad para refactorizar: simplifica tu comunicación con dependencias simuladas y observa cómo tu software se vuelve más resiliente y fácil de mantener.

Si aún crees que una función podría ser útil, por favor crea un issue [aquí](https://github.com/AlessioCoser/pure-ts-mock/issues) o abre un PR. El proyecto es gratuito, de código abierto y cualquier contribución es bienvenida.

# Instalación

```bash
npm install --save-dev pure-ts-mock
# or
pnpm add --save-dev pure-ts-mock
# or
yarn add --dev pure-ts-mock
```

# Inicio Rápido

## Simulación de interfaces o clases:

```typescript
interface ModelRepository {
  property: string
  findById(id: string): Model | null
  all(): Promise<Model[]>
}
// Crea un simulacro para la interfaz:
const mockedRepo = mock<ModelRepository>()
// Programa el comportamiento para cualquier argumento
when(mockedRepo).findById(any()).returnOnce({ id: 'all', externalId: 'ext-all' })
// Usa el simulacro
mockedRepo.findById('first')
// Verifica que el método fue llamado con cualquier argumento
verify(mockedRepo).findById.toHaveBeenCalledWith('first')
```

No necesitas una interfaz explícita. Puedes simular directamente desde una clase o el tipo inferido de un objeto:

```typescript
// Desde una clase:
const mockedRepo = mock<UserRepositoryImplementation>()

// Desde el tipo de un objeto:
const realService = { findById: (id: string): User | null => { /* ... */ } }
const mockedService = mock<typeof realService>()
```

## Simulación de funciones independientes

```typescript
type FindById = (id: string) => User | null
// Crea un simulacro para la función:
const mockedFindById = mock<FindById>()
// Programa el comportamiento de la función:
when(mockedFindById).call('first').alwaysReturn({ id: 'first', name: 'Thor' })
// Usa el simulacro:
mockedFindById('first')
// Verifica que la función fue llamada con argumentos específicos:
verify(mockedFindById).call.toHaveBeenCalledWith('first')
```

**Nota**: el uso de `.call` tanto en `when` como en `verify` para programar y verificar las llamadas.

# Documentación de la API

## `mock<T>(options?)`
Crea un objeto simulado para la función, interfaz o clase dada.

### Parámetros
- `options?` (opcional): Objeto de configuración con las siguientes propiedades:
  - `mode` (`relaxed | strict`, por defecto: `strict`): Controla el comportamiento del simulacro para métodos no programados

### Modos Estricto y Relajado

**Modo Estricto (por defecto)**: Cuando `mode: 'strict'` o no se proporcionan opciones, el simulacro opera en modo estricto. Llamar a un método o función que no haya sido programado con `when` y la entrada correcta generará un error.

**Modo Relajado**: Cuando se establece `mode: 'relaxed'`, el simulacro devolverá `undefined` para métodos o funciones no programados en lugar de generar un error.

> Recomendamos encarecidamente usar el modo 'strict' para la mayoría de los escenarios. Esta es la razón por la que es el valor predeterminado.

El modo estricto proporciona información valiosa sobre el diseño de tu código y te ayuda a crear mejores abstracciones:
- **Exige comunicación explícita**: Cada interacción debe ser programada intencionalmente, haciendo que tu prueba sea más precisa y revelando el contrato real entre componentes
- **Revela problemas de acoplamiento**: Si necesitas simular muchos métodos, podría indicar que tu código está demasiado acoplado o que tus interfaces son demasiado amplias
- **Orienta hacia un mejor diseño**: El "dolor" de simular interacciones complejas a menudo apunta a oportunidades de refactorización y simplificación
- **Previene fallos silenciosos**: Las llamadas no programadas fallan rápido, ayudándote a detectar errores temprano

El modo relajado debe usarse con precaución, pero puede ser útil en escenarios específicos.
Un ejemplo es cuando se trabaja con **bases de código heredadas (legacy)** que tienen interfaces amplias o dependencias complejas que son difíciles de refactorizar de inmediato.
También puede usarse como una medida temporal mientras se mejora incrementalmente el diseño del código.

**Recuerda**: si te encuentras necesitando frecuentemente el modo relajado, considéralo una señal para refactorizar tu código hacia interfaces más pequeñas y enfocadas, y una mejor separación de responsabilidades.

### Ejemplos de Uso
```typescript
// Uso básico (modo estricto por defecto)
const mockRepo = mock<ModelRepository>()
const mockFn = mock<FindById>()

// Modo estricto (comportamiento por defecto)
const strictMock = mock<MyInterface>({ mode: 'strict' });
strictMock.notProgrammedMethod(); // throws Error: no match found for method <notProgrammedMethod> called with arguments: []

// Modo relajado
const relaxedMock = mock<MyInterface>({ mode: 'relaxed' });
relaxedMock.notProgrammedMethod(); // returns undefined
```

---

## `when(mock).method(...args)`
Programa el comportamiento de un método simulado para argumentos específicos. El objeto devuelto expone:
- Para métodos síncronos:
  - `returnOnce(value)` — devuelve el valor especificado **solo una vez** para argumentos coincidentes, luego vuelve al comportamiento anterior
  - `alwaysReturn(value)` — siempre devuelve el valor especificado para argumentos coincidentes
  - `throwOnce(error)` — lanza el error especificado **solo una vez** para argumentos coincidentes, luego vuelve al comportamiento anterior
  - `alwaysThrow(error)` — siempre lanza el error especificado para argumentos coincidentes
- Para métodos asíncronos:
  - `resolveOnce(value, options?)` — resuelve con el valor especificado **solo una vez** (opcionalmente con retraso), luego vuelve al comportamiento anterior
  - `alwaysResolve(value, options?)` — siempre resuelve con el valor especificado (opcionalmente con retraso) para argumentos coincidentes
  - `rejectOnce(error, options?)` — rechaza con el error especificado **solo una vez** (opcionalmente con retraso), luego vuelve al comportamiento anterior
  - `alwaysReject(error, options?)` — siempre rechaza con el error especificado (opcionalmente con retraso) para argumentos coincidentes

Si el simulacro es una función, el método 'when' disponible será siempre solo `call`: `when(mockFn).call(...args)`.

### Explicación del comportamiento de 'when'

**pure-ts-mock** no proporciona ningún comportamiento predeterminado como devolver, lanzar, resolver o rechazar valores.
En su lugar, debes definir explícitamente cómo debe comportarse cada simulacro.

- Las variantes "Once" (`returnOnce`, `throwOnce`, `resolveOnce`, `rejectOnce`) solo afectan la **próxima llamada coincidente**. Después de usarse una vez, el comportamiento se elimina y las llamadas posteriores usan el comportamiento anterior, si lo hay.
- Las variantes "Always" (`alwaysReturn`, `alwaysThrow`, `alwaysResolve`, `alwaysReject`) persisten para todas las llamadas coincidentes hasta que se anulen.
- Si se programan varios comportamientos para el mismo método/argumentos, el **último comportamiento definido tiene prioridad**.

> Simula interacciones, no solo valores. Sé explícito: deja que tus pruebas guíen un mejor diseño.

A diferencia de la mayoría de las bibliotecas, que usan por defecto el comportamiento de "siempre devolver", **pure-ts-mock** requiere que especifiques el comportamiento que deseas.
Esta explicitud te ayuda a:
- **reflejar interacciones reales** y exponer dependencias temporales en tu código
- **revelar dependencias ocultas** en valores repetidos
- **identificar oportunidades de refactorización:** si necesitas muchas respuestas diferentes para el mismo simulacro, tu código puede ser demasiado complejo o estar demasiado acoplado. Esta claridad te ayuda a identificar dónde simplificar o refactorizar.

**Consejo**: Prefiere usar las variantes "Once" para evitar comportamientos inesperados en tus pruebas.
Usa las variantes "Always" solo cuando realmente intendes que se devuelva el mismo valor cada vez.

### Ejemplos de Uso
```typescript
// Métodos síncronos
when(repo).findById('first').returnOnce(model) // devuelve model solo una vez, luego vuelve al anterior
when(repo).findById('first').alwaysReturn(model) // siempre devuelve model
when(repo).findById('second').throwOnce(new Error('Not found')) // lanza solo una vez, luego vuelve al anterior
when(repo).findById('second').alwaysThrow(new Error('Not found')) // siempre lanza

// Métodos asíncronos
when(repo).all().alwaysResolve([]) // siempre resuelve a []
when(repo).all().resolveOnce([]) // resuelve a [] solo una vez, luego vuelve al anterior
when(repo).all().alwaysReject(new Error('Failed'), { delay: 200 }) // siempre rechaza
when(repo).all().rejectOnce(new Error('Failed'), { delay: 200 }) // rechaza solo una vez, luego vuelve al anterior

// Usando el validador any()
when(repo).findById(any()).returnOnce(model)
when(repo).findById(any()).alwaysReturn(model)

// simulacros de función
when(mockSyncFn).call('any arg').returnOnce({ id: 'first', name: 'Thor' })
when(mockAsyncFn).call('any arg').resolveOnce('some result')
```

---

## `verify(mock).method`
Verifica cómo se llamó a un método simulado. El objeto devuelto expone:
- `toNotHaveBeenCalled()` — afirma que el método nunca fue llamado
- `toHaveBeenCalled(times?)` — afirma que el método fue llamado al menos una vez, o un número específico de veces
- `toNotHaveBeenCalledWith(...args)` — afirma que el método nunca fue llamado con los argumentos especificados
- `toHaveBeenCalledWith(...args)` — afirma que el método fue llamado con los argumentos especificados

Si el simulacro es una función, el método 'verify' disponible será siempre solo `call`: `verify(mockFn).call`.

### Ejemplos de Uso
```typescript
verify(repo).findById.toHaveBeenCalled()
verify(repo).findById.toHaveBeenCalled(2)
verify(repo).findById.toHaveBeenCalledWith('first')
verify(repo).findById.toNotHaveBeenCalled()
verify(repo).findById.toNotHaveBeenCalledWith('second')
// simulacros de función
verify(mockFn).call.toNotHaveBeenCalled()
```

---

## Validadores `any()`

pure-ts-mock proporciona validadores flexibles para argumentos y propiedades de objetos usando la API `any`. Los validadores te permiten verificar llamadas con lógica flexible o personalizada.

### Validadores Integrados

- `any()` — coincide con cualquier valor
- `any.string()` — coincide con cualquier cadena
- `any.string.includes(substring)` — coincide con cadenas que contienen `substring`
- `any.string.startsWith(prefix)` — coincide con cadenas que comienzan con `prefix`
- `any.string.endsWith(suffix)` — coincide con cadenas que terminan con `suffix`
- `any.string.match(regexp)` — coincide con cadenas que coinciden con el RegExp dado
- `any.number()` — coincide con cualquier número
- `any.number.greaterThan(value)` — coincide con números mayores que `value`
- `any.number.lowerThan(value)` — coincide con números menores que `value`
- `any.number.positive()` — coincide con números positivos (> 0)
- `any.number.negative()` — coincide con números negativos (< 0)
- `any.boolean()` — coincide con cualquier booleano
- `any.function()` — coincide con cualquier función
- `any.object()` — coincide con cualquier objeto (no array)
- `any.object.containing(partial)` — coincide con cualquier objeto que contenga al menos las propiedades especificadas (soporta validadores anidados)
- `any.array()` — coincide con cualquier array
- `any.array.ofLength(n)` — coincide con arrays de longitud exacta
- `any.array.containing(items)` — coincide con arrays que contienen al menos los elementos especificados (cualquier orden)
- `any.array.containingExactly(items)` — coincide con arrays que contienen exactamente los elementos especificados (cualquier orden)
- `any.map()` — coincide con cualquier Map
- `any.set()` — coincide con cualquier Set
- `any.date()` — coincide con cualquier instancia de Date
- `any.truthy()` — coincide con cualquier valor verdaderos (truthy)
- `any.falsy()` — coincide con cualquier valor falsos (falsy)
- `any.instanceOf(Class)` — coincide con cualquier instancia de la clase dada (incluyendo subclases)
- `any.uuid()` — coincide con cualquier cadena tipo uuid

### Validadores Personalizados
Puedes crear validadores personalizados pasando una función predicada a `any<T>(predicate)`:

```typescript
import { any } from 'pure-ts-mock'

// Validador personalizado seguro en tipos: solo coincide con números > 5
const anyMoreThanFiveMatcher = any<number>(actual => actual > 5)
// Función de validador personalizada segura en tipos: solo coincide con números > x
const anyMoreThanXMatcher = (x: number) => any<number>(actual => actual > x)

// Uso en when/verify:
when(mockedRepo).save({ id: any.string(), value: anyMoreThanFiveMatcher }).resolveOnce()
verify(mockedRepo).save.toHaveBeenCalledWith({ id: any.string(), value: anyMoreThanFiveMatcher })
verify(mockedRepo).save.toHaveBeenCalledWith({ id: any.string(), value: anyMoreThanXMatcher(5) })
```

- Los validadores personalizados son seguros en tipos: especifica el parámetro de tipo para que tu validador se verifique para la propiedad en la que lo usas.
- Si no especificas un tipo, tu validador se tratará como `any`.
- Puedes usar validadores personalizados para argumentos, propiedades y coincidencias profundas dentro de objetos/arrays.

### Coincidencia Profunda (Deep Matching)
Los validadores pueden usarse dentro de objetos y arrays para coincidencia profunda. Esto es útil para verificar estructuras complejas con reglas flexibles:

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
Reinicia el estado de todos los simulacros creados mediante `mock()`. Útil para asegurar un estado limpio entre pruebas.

Internamente llama al método público `mock.resetMock()` en cada instancia de simulacro creada por `mock()`.

```typescript
const repo = mock<ModelRepository>()
const another = mock<AnotherInterface>()
repo.all()
another.aMethod()

resetAllMocks()

verify(repo).all.toNotHaveBeenCalled()
verify(another).aMethod.toNotHaveBeenCalled()
```

Si quieres reiniciar un solo simulacro, usa `resetMock()` en esa instancia específica en su lugar.

```typescript
const repo = mock<ModelRepository>()
when(repo).all().resolveOnce([])
await repo.all()

repo.resetMock()

verify(repo).all.toNotHaveBeenCalled()
```

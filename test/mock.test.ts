import { describe, expect, it } from 'vitest'
import { any, mock, verify, when, resetAllMocks } from '../src'

describe('mock', () => {
  it('should set a property', async () => {
    const mockedRepo = mock<ModelRepository>()
    mockedRepo.property = 'a-property-value'
    expect(mockedRepo.property).toEqual('a-property-value')
  })

  it('should throwError on a non-mocked method', async () => {
    const mockedRepo = mock<ModelRepository>()
    expect(() => mockedRepo.all()).toThrow('No match found for method <all> called with arguments: []')
  })

  it('should resolve the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysResolve([])
    expect(await mockedRepo.all()).toEqual([])
  })

  it('should resolve with a 200ms delay the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysResolve([], { delay: 200 })
    expect(await mockedRepo.all()).toEqual([])
  })

  it('should return the mocked value based on the parameter used', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById('first').alwaysReturn({ id: 'first', externalId: 'ext-first' })
    when(mockedRepo).findById('second').alwaysReturn({ id: 'second', externalId: 'ext-second' })
    expect(mockedRepo.findById('first')).toEqual({ id: 'first', externalId: 'ext-first' })
    expect(mockedRepo.findById('second')).toEqual({ id: 'second', externalId: 'ext-second' })
  })

  it('should return the mocked value ignoring the parameter used', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'all', externalId: 'ext-all' })
    expect(mockedRepo.findById('first')).toEqual({ id: 'all', externalId: 'ext-all' })
    expect(mockedRepo.findById('second')).toEqual({ id: 'all', externalId: 'ext-all' })
  })

  it('should throw the mocked value', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysThrow(new Error('this is an error'))
    expect(() => mockedRepo.findById('second')).toThrow(new Error('this is an error'))
  })

  it('should reject the mocked value', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysReject(new Error('this is an error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('this is an error'))
  })

  it('should reject with a 200ms delay the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysReject(new Error('this is an error'), { delay: 200 })
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('this is an error'))
  })

  it('should handle a default property value', async () => {
    const mockedRepo = mock<ModelRepository>({ property: 'default' })
    expect(mockedRepo.property).toStrictEqual('default')
  })

  it('should set a single property', async () => {
    const mockedRepo = mock<ModelRepository>()
    mockedRepo.property = 'updated-value'
    expect(mockedRepo.property).toStrictEqual('updated-value')
  })

  it('should verify a method to have been called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalled()
  })

  it('should verify a method to not have been called', async () => {
    const mockedRepo = mock<ModelRepository>()
    verify(mockedRepo).findById.toNotHaveBeenCalled()
  })

  it('should verify a method to not have been called, but it is called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toNotHaveBeenCalled()).toThrow(
      'Expected method <findById> to not be called, but it was called 1 times.\n' +
      '\n' +
      'Registered calls: [\n' +
      '\t["first"]\n' +
      ']'
    )
  })

  it('should verify a method to not have been called with argument, but it is called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toNotHaveBeenCalledWith('first')).toThrow(
      'Expected method <findById> to not be called with arguments:\n' +
      '["first"]\n' +
      'But it was called with those arguments.\n\n' +
      'Registered calls: [\n\t' +
      '["first"]\n' +
      ']'
    )
  })

  it('should verify a method to have been called, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })

    expect(() => verify(mockedRepo).findById.toHaveBeenCalled()).toThrow(
      'Expected method <findById> to be called at least once, but it was never called.'
    )
  })

  it('should verify a method to have been called nth times', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalled(2)
  })

  it('should verify a method to have been called nth times, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    expect(() => verify(mockedRepo).findById.toHaveBeenCalled(1)).toThrow(
      'Expected method <findById> to be called 1 times, but was called 2 times.\n' +
      '\n' +
      'Registered calls: [\n' +
      '\t["first"],\n' +
      '\t["second"]\n' +
      ']'
    )
  })

  it('should verify a method to have been called 1 time, but it is called zero times', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })

    expect(() => verify(mockedRepo).findById.toHaveBeenCalled(1)).toThrow(
      'Expected method <findById> to be called 1 times, but it was never called.'
    )
  })

  it('should verify a method to have been called with arguments', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalledWith('second')
  })

  it('should verify a method to have been called with arguments, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toHaveBeenCalledWith('second')).toThrow(
      'Expected method <findById> to be called with arguments:\n["second"]\nBut it was not called.\n' +
        '\n' +
        'Registered calls: [\n\t' +
        '["first"]\n' +
        ']'
    )
  })

  it('should verify a not-mocked method to have been called with arguments, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()

    expect(() => verify(mockedRepo).findById.toHaveBeenCalledWith('second')).toThrow(
      'Expected method <findById> to be called with arguments:\n["second"]\nBut it was not called.\n' +
        '\n' +
        'Registered calls: [\n\t' +
        '\n' +
        ']'
    )
  })

  it('should mock a class', async () => {
    const mockedRepo = mock<UserRepository>()
    mockedRepo.property = 'an-user-property'
    when(mockedRepo).all().alwaysResolve([])
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', name: 'Thor' })

    mockedRepo.findById('first')
    const allUsers = await mockedRepo.all()

    expect(mockedRepo.property).toEqual('an-user-property')
    expect(allUsers).toEqual([])
    verify(mockedRepo).findById.toHaveBeenCalledWith('first')
    verify(mockedRepo).all.toHaveBeenCalled()
  })

  it('should mock a sync function', async () => {
    const mockedFindById = mock<UserRepository['findById']>()

    when(mockedFindById).call('first').alwaysReturn({ id: 'first', name: 'Thor' })

    const result = mockedFindById('first')

    expect(result?.id).toEqual('first')
    verify(mockedFindById).call.toHaveBeenCalledWith('first')
  })

  it('should mock an async function', async () => {
    const mockedAll = mock<UserRepository['all']>()

    when(mockedAll).call().alwaysResolve([])

    const result = await mockedAll()

    expect(result).toHaveLength(0)
    verify(mockedAll).call.toHaveBeenCalled()
  })

  it('override the behavior of a method. The last defined behavior will take precedence.', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysResolve([{ id: 'first', externalId: 'ext-first' }])
    when(mockedRepo).all().alwaysResolve([{ id: 'second', externalId: 'ext-second' }])

    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
  })

  it('do not keep the programmed method with resolveOnceOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysResolve([{ id: 'first', externalId: 'ext-first' }])
    when(mockedRepo).all().resolveOnce([{ id: 'second', externalId: 'ext-second' }])

    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'first', externalId: 'ext-first' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'first', externalId: 'ext-first' }])
  })

  it('do not keep the programmed method with rejectOnceOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysReject(new Error('first programmed error'))
    when(mockedRepo).all().rejectOnce(new Error('second programmed once error'))

    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('second programmed once error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('first programmed error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('first programmed error'))
  })

  it('do not keep the programmed method with returnOnceOnce ', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysReturn({ id: 'first', externalId: 'ext-first' })
    when(mockedRepo).findById(any()).returnOnce({ id: 'second', externalId: 'ext-second' })

    expect(mockedRepo.findById('any')).toEqual({ id: 'second', externalId: 'ext-second' })
    expect(mockedRepo.findById('any')).toEqual({ id: 'first', externalId: 'ext-first' })
    expect(mockedRepo.findById('any')).toEqual({ id: 'first', externalId: 'ext-first' })
  })

  it('do not keep the programmed method with throwOnceOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).alwaysThrow(new Error('first programmed error'))
    when(mockedRepo).findById(any()).throwOnce(new Error('second programmed once error'))

    expect(() => mockedRepo.findById('any')).toThrow(new Error('second programmed once error'))
    expect(() => mockedRepo.findById('any')).toThrow(new Error('first programmed error'))
    expect(() => mockedRepo.findById('any')).toThrow(new Error('first programmed error'))
  })

  it('reset a single mock', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().alwaysResolve([])
    await mockedRepo.all()
    verify(mockedRepo).all.toHaveBeenCalled(1)

    mockedRepo.resetMock()

    verify(mockedRepo).all.toNotHaveBeenCalled()
    expect(() => mockedRepo.all()).toThrow('No match found for method <all> called with arguments: []')
  })

  it('reset all mocks', async () => {
    const mockedRepo = mock<ModelRepository>()
    const anotherMock = mock<AnotherInterface>()
    const mockFindById = mock<ModelRepository['findById']>()
    when(mockedRepo).all().alwaysResolve([])
    when(anotherMock).aMethod(any()).alwaysReturn('')
    when(mockFindById).call('2').alwaysReturn(null)
    await mockedRepo.all()
    anotherMock.aMethod(1)
    mockFindById('2')
    verify(mockedRepo).all.toHaveBeenCalled(1)
    verify(anotherMock).aMethod.toHaveBeenCalled(1)

    resetAllMocks()

    verify(mockedRepo).all.toNotHaveBeenCalled()
    verify(anotherMock).aMethod.toNotHaveBeenCalled()
    verify(mockFindById).call.toNotHaveBeenCalled()
    expect(() => mockedRepo.all()).toThrow('No match found for method <all> called with arguments: []')
    expect(() => anotherMock.aMethod(1)).toThrow('No match found for method <aMethod> called with arguments: [1]')
    expect(() => mockFindById('2')).toThrow('No match found for function called with arguments: ["2"]')
  })
})

interface User {
  id: string
  name: string
}

class UserRepository {
  property: string

  constructor() {
    this.property = 'default'
  }

  findById(id: string): User | null {
    return { id, name: Math.random().toString(36) }
  }

  all(): Promise<User[]> {
    return Promise.resolve([])
  }
}

interface ModelRepository {
  property: string

  findById(id: string): Model | null

  all(): Promise<Model[]>
}

interface AnotherInterface {
  aMethod(arg: number): string
}

interface Model {
  id: string
  externalId: string
}

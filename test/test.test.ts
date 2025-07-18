import { describe, expect, it } from 'vitest'
import { mock, when, verify, type Mock } from '../src/mock.js'
import type { Expect, SameShape, SameType } from './test-types.js'

interface ModelRepository {
  property: string
  findById(id: string): Promise<Model | null>
  all(): Promise<Model[]>
}

interface Model {
  id: string
  externalModelId: string
}

describe('test', () => {
  it('xxx', async () => {
    const realrepo: ModelRepository = {} as ModelRepository
    const mockedRepo = mock<ModelRepository>()

    when(mockedRepo).findById('123').willReturn(Promise.resolve({ id: '123', externalModelId: 'ext-123' }))
    when(mockedRepo).all().willReturn(Promise.resolve([]))
    when(mockedRepo).findById('456').willReturn(Promise.resolve({ id: '456', externalModelId: 'ext-456' }))

    console.log('2', mockedRepo)

    const t = await mockedRepo.findById('123')
    const a = await mockedRepo.all()
    const t2 = await mockedRepo.findById('456')

    expect(mockedRepo.property).toBeUndefined()
    expect(a).toEqual([])
    expect(t).toEqual({ id: '123', externalModelId: 'ext-123' })
    expect(t2).toEqual({ id: '456', externalModelId: 'ext-456' })
    verify(mockedRepo).all.toHaveBeenCalled(1)
    verify(mockedRepo).findById.toHaveBeenCalled(2)
    verify(mockedRepo).findById.toHaveBeenCalledWith('123')
    verify(mockedRepo).findById.toHaveBeenCalledWith('456')
    expect(() => mockedRepo.findById('678')).toThrowError('method <findById> has no matching returnValue')
  })
})

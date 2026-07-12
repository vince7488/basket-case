import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createList, getList, updateList } from '@/api/listsApi'
import { useGroceryListStore } from '@/stores/groceryList'
import type { GroceryList } from '@/types/grocery'

vi.mock('@/api/listsApi', () => ({
  createList: vi.fn(),
  getList: vi.fn(),
  updateList: vi.fn(),
}))

const savedList: GroceryList = {
  id: '3f87c1a0-33a5-4c2d-a9f0-10beee537010',
  name: 'Saturday groceries',
  budget: 80,
  items: [
    {
      id: '6d8a099b-05b6-46c5-a8f8-44b60fc1c799',
      name: 'Milk',
      price: 4.5,
      quantity: 2,
    },
    {
      id: 'c3882e4b-b7f4-4dd6-b481-d56660c18a9a',
      name: 'Bread',
      price: 3,
      quantity: 1,
    },
  ],
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

describe('useGroceryListStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(createList).mockReset()
    vi.mocked(getList).mockReset()
    vi.mocked(updateList).mockReset()
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
    })
  })

  it('starts with MVP defaults and derived budget state', () => {
    const store = useGroceryListStore()

    expect(store.id).toBeNull()
    expect(store.name).toBe('My grocery list')
    expect(store.budget).toBe(100)
    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
    expect(store.remaining).toBe(100)
    expect(store.overBudgetBy).toBe(0)
    expect(store.isOverBudget).toBe(false)
    expect(store.isValid).toBe(true)
  })

  it('adds items with UUIDs and clamps invalid prices and quantities', () => {
    const store = useGroceryListStore()

    store.addItem('  Apples  ', -2, 2.9)
    store.addItem('Bananas', Number.NaN, Number.NaN)

    expect(store.items).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Apples',
        price: 0,
        quantity: 2,
      },
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Bananas',
        price: 0,
        quantity: 1,
      },
    ])
  })

  it('updates quantities, removes by UUID, and recalculates totals', () => {
    const store = useGroceryListStore()
    store.setList(savedList)

    store.updateQuantity(savedList.items[0].id, 4.8)
    store.updateQuantity('missing-id', 20)
    store.removeItem(savedList.items[1].id)

    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toMatchObject({ name: 'Milk', quantity: 4 })
    expect(store.total).toBe(18)
    expect(store.difference).toBe(62)
    expect(store.remaining).toBe(62)
  })

  it('detects over-budget and invalid list states', () => {
    const store = useGroceryListStore()

    store.setList({
      ...savedList,
      budget: 5,
    })

    expect(store.total).toBe(12)
    expect(store.isOverBudget).toBe(true)
    expect(store.remaining).toBe(0)
    expect(store.overBudgetBy).toBe(7)

    store.name = ''
    expect(store.isValid).toBe(false)

    store.name = 'Valid'
    store.items[0].quantity = 0
    expect(store.isValid).toBe(false)
  })

  it('normalizes loaded API data and reset state', () => {
    const store = useGroceryListStore()

    store.setList({
      ...savedList,
      budget: '25.50' as unknown as number,
      items: [
        {
          id: savedList.items[0].id,
          name: 'Rice',
          price: '-2' as unknown as number,
          quantity: '0' as unknown as number,
        },
      ],
    })

    expect(store.budget).toBe(25.5)
    expect(store.items[0]).toMatchObject({ price: 0, quantity: 1 })

    store.error = 'Old error'
    store.resetList()

    expect(store.id).toBeNull()
    expect(store.name).toBe('My grocery list')
    expect(store.budget).toBe(100)
    expect(store.items).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('creates a new list and updates an existing list through the API module', async () => {
    const store = useGroceryListStore()
    vi.mocked(createList).mockResolvedValue(savedList)
    vi.mocked(updateList).mockResolvedValue({ ...savedList, name: 'Updated groceries' })

    store.name = ' Saturday groceries '
    store.budget = 80
    store.addItem('Milk', 4.5, 2)

    await expect(store.saveList()).resolves.toEqual(savedList)

    expect(createList).toHaveBeenCalledWith({
      name: 'Saturday groceries',
      budget: 80,
      items: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Milk',
          price: 4.5,
          quantity: 2,
        },
      ],
    })
    expect(store.id).toBe(savedList.id)
    expect(store.saving).toBe(false)

    await expect(store.saveList()).resolves.toMatchObject({ name: 'Updated groceries' })

    expect(updateList).toHaveBeenCalledWith(savedList.id, {
      name: savedList.name,
      budget: savedList.budget,
      items: savedList.items.map((item) => ({ ...item })),
    })
  })

  it('blocks duplicate, invalid, and failed saves without clearing editable data', async () => {
    const store = useGroceryListStore()
    const saveFailure = new Error('Network failed')

    store.name = ''
    await expect(store.saveList()).rejects.toThrow('Fix the list details before saving.')
    expect(store.error).toBe('Fix the list details before saving.')

    store.name = 'Valid'
    store.addItem('Milk', 4, 1)
    vi.mocked(createList).mockRejectedValue(saveFailure)

    await expect(store.saveList()).rejects.toThrow('Network failed')
    expect(store.error).toBe('Network failed')
    expect(store.items).toHaveLength(1)

    const pending = deferred<GroceryList>()
    vi.mocked(createList).mockReturnValue(pending.promise)
    const firstSave = store.saveList()

    await expect(store.saveList()).rejects.toThrow('The list is already being saved.')

    pending.resolve(savedList)
    await firstSave
  })

  it('loads lists, reports failures, and ignores stale load responses', async () => {
    const store = useGroceryListStore()
    vi.mocked(getList).mockResolvedValue(savedList)

    await store.loadList(savedList.id)

    expect(store.loading).toBe(false)
    expect(store.id).toBe(savedList.id)

    const failure = new Error('Missing list')
    vi.mocked(getList).mockRejectedValue(failure)

    await expect(store.loadList('missing-id')).rejects.toThrow('Missing list')
    expect(store.error).toBe('Missing list')
    expect(store.loading).toBe(false)

    const first = deferred<GroceryList>()
    const second = deferred<GroceryList>()
    vi.mocked(getList).mockReset()
    vi.mocked(getList).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    const firstLoad = store.loadList('first-id')
    const secondLoad = store.loadList('second-id')

    second.resolve({ ...savedList, id: '22222222-2222-4222-8222-222222222222' })
    await secondLoad

    first.resolve({ ...savedList, id: '33333333-3333-4333-8333-333333333333' })
    await firstLoad

    expect(store.id).toBe('22222222-2222-4222-8222-222222222222')
    expect(store.loading).toBe(false)
  })
})

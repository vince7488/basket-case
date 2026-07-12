import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GroceryList } from '@/types/grocery'

const savedList: GroceryList = {
  id: '3f87c1a0-33a5-4c2d-a9f0-10beee537010',
  name: 'Saturday groceries',
  budget: 42,
  items: [
    {
      id: '6d8a099b-05b6-46c5-a8f8-44b60fc1c799',
      name: 'Milk',
      price: 4.5,
      quantity: 2,
    },
  ],
}

function mockFetchResponse(ok: boolean, data = savedList) {
  return {
    ok,
    json: vi.fn().mockResolvedValue({ data }),
  } as unknown as Response
}

async function importApi(baseUrl: string | undefined = 'http://localhost:8000/api') {
  vi.resetModules()
  vi.stubEnv('VITE_API_BASE_URL', baseUrl)

  return await import('@/api/listsApi')
}

describe('listsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('creates lists with the configured API base URL', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(mockFetchResponse(true))
    const { createList } = await importApi()
    const payload = {
      name: 'Saturday groceries',
      budget: 42,
      items: savedList.items,
    }

    await expect(createList(payload)).resolves.toEqual(savedList)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/lists', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })

  it('falls back to the local Laravel API URL when no Vite API base URL is configured', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(mockFetchResponse(true))
    const { getList } = await importApi(undefined)

    await getList(savedList.id)

    expect(fetchMock).toHaveBeenCalledWith(`http://localhost:8000/api/lists/${savedList.id}`, {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('loads a saved list by UUID', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(mockFetchResponse(true))
    const { getList } = await importApi()

    await expect(getList(savedList.id)).resolves.toEqual(savedList)

    expect(fetchMock).toHaveBeenCalledWith(`http://localhost:8000/api/lists/${savedList.id}`, {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('updates an existing list by UUID', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(mockFetchResponse(true))
    const { updateList } = await importApi()
    const payload = {
      name: 'Updated groceries',
      budget: 50,
      items: [],
    }

    await expect(updateList(savedList.id, payload)).resolves.toEqual(savedList)

    expect(fetchMock).toHaveBeenCalledWith(`http://localhost:8000/api/lists/${savedList.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })

  it('reports create, read, and update failures with user-facing messages', async () => {
    const fetchMock = vi.mocked(fetch)
    const { createList, getList, updateList } = await importApi()

    fetchMock.mockResolvedValue(mockFetchResponse(false))
    await expect(createList({ name: 'Bad', budget: 1, items: [] })).rejects.toThrow('The list could not be saved.')

    fetchMock.mockResolvedValue(mockFetchResponse(false))
    await expect(getList(savedList.id)).rejects.toThrow('The list could not be loaded.')

    fetchMock.mockResolvedValue(mockFetchResponse(false))
    await expect(updateList(savedList.id, { name: 'Bad', budget: 1, items: [] })).rejects.toThrow('The list could not be updated.')
  })
})

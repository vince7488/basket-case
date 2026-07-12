import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GroceryListView from '@/views/GroceryListView.vue'
import { createList, getList, updateList } from '@/api/listsApi'
import { useGroceryListStore } from '@/stores/groceryList'
import { vuetifyStubs } from '@/__tests__/testUtils'
import type { GroceryList } from '@/types/grocery'

vi.mock('@/api/listsApi', () => ({
  createList: vi.fn(),
  getList: vi.fn(),
  updateList: vi.fn(),
}))

const validUuid = '3f87c1a0-33a5-4c2d-a9f0-10beee537010'
const savedList: GroceryList = {
  id: validUuid,
  name: 'Saturday groceries',
  budget: 50,
  items: [
    {
      id: '6d8a099b-05b6-46c5-a8f8-44b60fc1c799',
      name: 'Milk',
      price: 4.5,
      quantity: 2,
    },
  ],
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'new-list',
        component: GroceryListView,
      },
      {
        path: '/list/:uuid',
        name: 'saved-list',
        component: GroceryListView,
      },
    ],
  })
}

async function mountView(path = '/', primeStore?: (store: ReturnType<typeof useGroceryListStore>) => void) {
  const pinia = createPinia()
  const router = makeRouter()

  await router.push(path)
  await router.isReady()

  const store = useGroceryListStore(pinia)
  primeStore?.(store)

  const wrapper = mount(GroceryListView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router],
      stubs: vuetifyStubs,
    },
  })
  await flushPromises()

  return {
    wrapper,
    router,
    store,
  }
}

function findButton(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('GroceryListView', () => {
  beforeEach(() => {
    vi.mocked(createList).mockReset()
    vi.mocked(getList).mockReset()
    vi.mocked(updateList).mockReset()
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts a fresh unsaved list on the root route', async () => {
    const { wrapper, store } = await mountView('/', (draftStore) => {
      draftStore.setList(savedList)
    })

    expect(store.id).toBeNull()
    expect(store.name).toBe('My grocery list')
    expect(wrapper.text()).toContain('Add your first grocery item')
    expect(wrapper.text()).toContain('Save list')
    expect(wrapper.text()).not.toContain('Anyone with this link')
  })

  it('shows an invalid saved-list URL error without silently redirecting', async () => {
    const { wrapper, router, store } = await mountView('/list/not-a-uuid')

    expect(router.currentRoute.value.fullPath).toBe('/list/not-a-uuid')
    expect(store.error).toBe('The list could not be loaded. Check the link and try again.')
    expect(wrapper.text()).toContain('This saved list could not be loaded.')

    await findButton(wrapper, 'Create a new list')?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('new-list')
  })

  it('loads saved UUID routes and reconstructs totals', async () => {
    vi.mocked(getList).mockResolvedValue(savedList)

    const { wrapper, store } = await mountView(`/list/${validUuid}`)

    expect(getList).toHaveBeenCalledWith(validUuid)
    expect(store.id).toBe(validUuid)
    expect((wrapper.find('input[aria-label="List name"]').element as HTMLInputElement).value).toBe('Saturday groceries')
    expect(wrapper.text()).toContain('Milk')
    expect(wrapper.text()).toContain('$9.00')
    expect(wrapper.text()).toContain('Anyone with this link can open and edit this list.')
  })

  it('skips saved-route reloads when the requested UUID is already in state', async () => {
    const { store } = await mountView(`/list/${validUuid}`, (draftStore) => {
      draftStore.setList(savedList)
    })

    expect(store.id).toBe(validUuid)
    expect(getList).not.toHaveBeenCalled()
  })

  it('shows load failure recovery when a saved UUID cannot be loaded', async () => {
    vi.mocked(getList).mockRejectedValue(new Error('The list could not be loaded.'))

    const { wrapper, store } = await mountView(`/list/${validUuid}`)

    expect(store.error).toBe('The list could not be loaded.')
    expect(wrapper.text()).toContain('This saved list could not be loaded.')
    expect(wrapper.text()).toContain('Create a new list')
  })

  it('saves a new list, replaces the route, and reports success', async () => {
    vi.mocked(createList).mockResolvedValue(savedList)
    const { wrapper, router, store } = await mountView('/')

    store.name = ' Saturday groceries '
    store.budget = 50
    store.addItem('Milk', 4.5, 2)
    await nextTick()

    await findButton(wrapper, 'Save list')?.trigger('click')
    await flushPromises()

    expect(createList).toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe(`/list/${validUuid}`)
    expect(wrapper.text()).toContain('Save changes')
    expect(wrapper.text()).toContain('List saved.')
  })

  it('updates an existing list without replacing the current saved route', async () => {
    vi.mocked(updateList).mockResolvedValue({
      ...savedList,
      items: [
        {
          ...savedList.items[0],
          quantity: 3,
        },
      ],
    })
    const { wrapper, router, store } = await mountView(`/list/${validUuid}`, (draftStore) => {
      draftStore.setList(savedList)
    })

    store.updateQuantity(savedList.items[0].id, 3)
    await nextTick()

    await findButton(wrapper, 'Save changes')?.trigger('click')
    await flushPromises()

    expect(updateList).toHaveBeenCalledWith(validUuid, {
      name: savedList.name,
      budget: savedList.budget,
      items: [
        {
          ...savedList.items[0],
          quantity: 3,
        },
      ],
    })
    expect(router.currentRoute.value.fullPath).toBe(`/list/${validUuid}`)
    expect(wrapper.text()).toContain('List saved.')
  })

  it('keeps visible work and lets the store surface save failures', async () => {
    vi.mocked(createList).mockRejectedValue(new Error('The list could not be saved.'))
    const { wrapper, store } = await mountView('/')

    store.name = 'Saturday groceries'
    store.addItem('Milk', 4.5, 2)
    await nextTick()

    await findButton(wrapper, 'Save list')?.trigger('click')
    await flushPromises()

    expect(store.error).toBe('The list could not be saved.')
    expect(wrapper.text()).toContain('The list could not be saved.')
    expect(wrapper.text()).toContain('Milk')

    await findButton(wrapper, 'Close')?.trigger('click')

    expect(store.error).toBeNull()
  })

  it('does not submit invalid or duplicate save actions from the view', async () => {
    const { wrapper, store } = await mountView('/')

    store.name = ''
    await nextTick()

    expect(wrapper.text()).toContain('Enter a list name before saving.')
    expect(findButton(wrapper, 'Save list')?.attributes('disabled')).toBeDefined()

    store.name = 'Valid'
    store.saving = true
    await nextTick()
    await findButton(wrapper, 'Save list')?.trigger('click')

    expect(createList).not.toHaveBeenCalled()
  })

  it('normalizes budget input and shows specific list-name validation', async () => {
    const { wrapper, store } = await mountView('/')
    const inputs = wrapper.findAll('input')

    await inputs[1].setValue('-10')
    await inputs[1].trigger('blur')

    expect(store.budget).toBe(0)

    store.name = 'x'.repeat(121)
    await nextTick()

    expect(wrapper.text()).toContain('List name must be 120 characters or fewer.')
    expect(wrapper.text()).toContain('Fix the list details before saving.')
  })

  it('adds items from the child form and focuses the next item name entry', async () => {
    const { wrapper, store } = await mountView('/')
    const inputs = wrapper.findAll('input')
    const itemNameInput = inputs[2].element

    await inputs[2].setValue('Eggs')
    await inputs[3].setValue('2.5')
    await inputs[4].setValue('2')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(store.items).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Eggs',
        price: 2.5,
        quantity: 2,
      },
    ])
    expect(document.activeElement).toBe(itemNameInput)
  })

  it('copies the saved-list URL and reports clipboard failures', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })
    const { wrapper, store } = await mountView('/')

    store.setList(savedList)
    await nextTick()

    await findButton(wrapper, 'Copy link')?.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith(`http://localhost:3000/list/${validUuid}`)
    expect(wrapper.text()).toContain('Link copied.')

    writeText.mockRejectedValue(new Error('Clipboard unavailable'))
    await findButton(wrapper, 'Copy link')?.trigger('click')
    await flushPromises()

    expect(store.error).toBe('The list link could not be copied.')
  })

  it('pulses the budget summary only when crossing over budget', async () => {
    vi.useFakeTimers()
    const { wrapper, store } = await mountView('/')

    store.budget = 5
    store.addItem('Milk', 4, 1)
    await nextTick()

    expect(wrapper.find('.budget-summary--pulse').exists()).toBe(false)

    store.updateQuantity(store.items[0].id, 2)
    await nextTick()

    expect(wrapper.find('.budget-summary--pulse').exists()).toBe(true)

    vi.advanceTimersByTime(600)
    await nextTick()

    expect(wrapper.find('.budget-summary--pulse').exists()).toBe(false)
  })
})

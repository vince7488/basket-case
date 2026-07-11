import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { createList, getList, updateList } from '@/api/listsApi'
import type { GroceryItem, GroceryList } from '@/types/grocery'

// defineStore() names the Pinia store that owns grocery-list business state outside components.
export const useGroceryListStore = defineStore('groceryList', () => {
  // ref() creates reactive state values that templates and computed values update from automatically.
  const id = ref<string | null>(null)
  const name = ref('My grocery list')
  const budgetAmount = ref(100)
  const items = ref<GroceryItem[]>([])

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // Writable computed refs can validate assignments while still working naturally with v-model later.
  const budget = computed({
    get: () => budgetAmount.value,
    set: (value: number) => {
      budgetAmount.value = toNonNegativeNumber(Number(value))
    },
  })

  // computed() derives totals from state so every item edit recalculates budget status immediately.
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const difference = computed(() => budget.value - total.value)
  const isOverBudget = computed(() => total.value > budget.value)
  const remaining = computed(() => Math.max(difference.value, 0))
  const overBudgetBy = computed(() => Math.max(-difference.value, 0))

  function toNonNegativeNumber(value: number) {
    return Number.isFinite(value) ? Math.max(0, value) : 0
  }

  function toWholeQuantity(value: number) {
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1
  }

  function addItem(itemName: string, price: number, quantity: number) {
    items.value.push({
      // Grocery items use UUIDs for identity so Vue lists never need array indexes as keys.
      id: crypto.randomUUID(),
      name: itemName.trim(),
      price: toNonNegativeNumber(price),
      quantity: toWholeQuantity(quantity),
    })
  }

  function removeItem(itemId: string) {
    items.value = items.value.filter((item) => item.id !== itemId)
  }

  function updateQuantity(itemId: string, quantity: number) {
    const item = items.value.find((candidate) => candidate.id === itemId)

    if (!item) {
      return
    }

    item.quantity = toWholeQuantity(quantity)
  }

  function setList(data: GroceryList) {
    // API data replaces the editable list when a saved list is loaded in later phases.
    id.value = data.id
    name.value = data.name
    budget.value = Number(data.budget)
    items.value = data.items.map((item) => ({
      ...item,
      price: toNonNegativeNumber(Number(item.price)),
      quantity: toWholeQuantity(Number(item.quantity)),
    }))
  }

  async function saveList() {
    saving.value = true
    error.value = null

    const payload = {
      name: name.value,
      budget: budget.value,
      items: items.value,
    }

    try {
      // The store chooses POST for unsaved lists and PUT once Laravel has assigned a UUID.
      const savedList = id.value ? await updateList(id.value, payload) : await createList(payload)

      setList(savedList)

      return savedList
    } catch (exception) {
      // Failed saves report the problem but intentionally leave the current editable list untouched.
      error.value = exception instanceof Error ? exception.message : 'The list could not be saved.'

      throw exception
    } finally {
      saving.value = false
    }
  }

  async function loadList(uuid: string) {
    loading.value = true
    error.value = null

    try {
      // GET replaces state only after Laravel returns a valid saved list.
      const savedList = await getList(uuid)
      setList(savedList)
    } catch (exception) {
      error.value = exception instanceof Error ? exception.message : 'The list could not be loaded.'
    } finally {
      loading.value = false
    }
  }

  return {
    id,
    name,
    budget,
    items,
    loading,
    saving,
    error,
    total,
    difference,
    isOverBudget,
    remaining,
    overBudgetBy,
    addItem,
    removeItem,
    updateQuantity,
    setList,
    saveList,
    loadList,
  }
})

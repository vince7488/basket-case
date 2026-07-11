import type { GroceryItem, GroceryList } from '@/types/grocery'

// Vite exposes client-safe variables with the VITE_ prefix; this keeps backend URLs out of components.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

interface ListPayload {
  name: string
  budget: number
  items: GroceryItem[]
}

export async function createList(payload: ListPayload): Promise<GroceryList> {
  const response = await fetch(`${apiBaseUrl}/lists`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('The list could not be saved.')
  }

  const result = await response.json()

  return result.data
}

export async function getList(uuid: string): Promise<GroceryList> {
  const response = await fetch(`${apiBaseUrl}/lists/${uuid}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('The list could not be loaded.')
  }

  const result = await response.json()

  return result.data
}

export async function updateList(uuid: string, payload: ListPayload): Promise<GroceryList> {
  const response = await fetch(`${apiBaseUrl}/lists/${uuid}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('The list could not be updated.')
  }

  const result = await response.json()

  return result.data
}

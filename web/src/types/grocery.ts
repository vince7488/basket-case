export interface GroceryItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface GroceryList {
  id: string | null
  name: string
  budget: number
  items: GroceryItem[]
}

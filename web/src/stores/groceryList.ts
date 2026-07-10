import { defineStore } from 'pinia'

// defineStore() names the Pinia store that will own grocery-list business state in later phases.
export const useGroceryListStore = defineStore('groceryList', {
  state: () => ({
    name: 'My grocery list',
  }),
})

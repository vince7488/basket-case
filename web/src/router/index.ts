import { createRouter, createWebHistory } from 'vue-router'
import GroceryListView from '@/views/GroceryListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'new-list',
      component: GroceryListView,
    },
    {
      // The uuid route parameter will identify saved lists once persistence is added.
      path: '/list/:uuid',
      name: 'saved-list',
      component: GroceryListView,
    },
  ],
})

export default router

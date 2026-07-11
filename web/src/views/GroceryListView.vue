<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { API_BASE_URL } from '@/api/listsApi'
import BudgetSummary from '@/components/BudgetSummary.vue'
import { useGroceryListStore } from '@/stores/groceryList'

const groceryList = useGroceryListStore()
// storeToRefs() preserves Pinia reactivity when destructuring store state for template binding.
const { name } = storeToRefs(groceryList)
</script>

<template>
  <v-container class="py-8" max-width="960">
    <v-row justify="center">
      <v-col cols="12" md="9" lg="8">
        <v-card class="pa-6" rounded="lg">
          <v-card-title class="text-h4 px-0">Basket Case</v-card-title>
          <v-card-subtitle class="px-0 pb-6">
            Welcome to Basket Case!
          </v-card-subtitle>

          <!-- v-model keeps the input value synchronized with the Pinia ref returned by storeToRefs(). -->
          <v-text-field v-model="name" label="List name" variant="outlined" />

          <BudgetSummary :api-base-url="API_BASE_URL" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

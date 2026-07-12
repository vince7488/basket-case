<script setup lang="ts">
// <script setup> keeps row props, emits, and derived values in one Composition API block.
import { computed } from 'vue'

import QuantityStepper from '@/components/QuantityStepper.vue'
import type { GroceryItem } from '@/types/grocery'

const props = defineProps<{
  item: GroceryItem
}>()

const emit = defineEmits<{
  delete: [itemId: string]
  quantityChange: [itemId: string, quantity: number]
}>()

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// computed() keeps each row total derived from item state instead of storing duplicate values.
const lineTotal = computed(() => props.item.price * props.item.quantity)
const quantityModel = computed({
  get: () => props.item.quantity,
  set: (quantity: number) => emit('quantityChange', props.item.id, quantity),
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}
</script>

<template>
  <v-card class="grocery-item-row" variant="outlined">
    <div class="grocery-item-row__details">
      <div class="grocery-item-row__name">
        <div class="text-subtitle-1 font-weight-medium">{{ props.item.name }}</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ formatCurrency(props.item.price) }} each
        </div>
      </div>

      <!-- v-model passes quantity changes through a computed setter so updates stay in the Pinia action. -->
      <QuantityStepper v-model="quantityModel" />

      <div class="grocery-item-row__total">
        <div class="text-caption text-medium-emphasis">Line total</div>
        <div class="text-subtitle-1 font-weight-medium">{{ formatCurrency(lineTotal) }}</div>
      </div>

      <v-btn
        :aria-label="`Delete ${props.item.name}`"
        color="error"
        icon="mdi-delete-outline"
        variant="text"
        @click="emit('delete', props.item.id)"
      />
    </div>
  </v-card>
</template>

<style scoped>
.grocery-item-row {
  border-radius: 8px;
  padding: 12px;
}

.grocery-item-row__details {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto minmax(104px, auto) 40px;
}

.grocery-item-row__name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.grocery-item-row__total {
  text-align: right;
}

@media (max-width: 700px) {
  .grocery-item-row__details {
    align-items: start;
    grid-template-columns: 1fr 40px;
  }

  .grocery-item-row__details > :first-child,
  .grocery-item-row__details > :nth-child(2),
  .grocery-item-row__total {
    grid-column: 1 / -1;
  }

  .grocery-item-row__total {
    text-align: left;
  }

  .grocery-item-row__details > :last-child {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }
}
</style>

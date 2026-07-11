<script setup lang="ts">
// <script setup> lets this small input component define its v-model contract inline.
import { computed } from 'vue'

// defineModel() creates the child side of v-model so the row can own item-specific quantity updates.
const model = defineModel<number>({
  required: true,
})

const quantity = computed({
  get: () => model.value,
  set: (value: number) => {
    model.value = Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1
  },
})

function decrease() {
  quantity.value -= 1
}

function increase() {
  quantity.value += 1
}
</script>

<template>
  <div class="quantity-stepper">
    <v-btn
      aria-label="Decrease quantity"
      icon="mdi-minus"
      size="small"
      variant="tonal"
      :disabled="quantity <= 1"
      @click="decrease"
    />

    <v-text-field
      v-model.number="quantity"
      aria-label="Quantity"
      class="quantity-stepper__input"
      type="number"
      min="1"
      step="1"
      density="compact"
      hide-details
      variant="outlined"
    />

    <v-btn
      aria-label="Increase quantity"
      icon="mdi-plus"
      size="small"
      variant="tonal"
      @click="increase"
    />
  </div>
</template>

<style scoped>
.quantity-stepper {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: 36px minmax(72px, 88px) 36px;
}

.quantity-stepper__input {
  min-width: 0;
}
</style>

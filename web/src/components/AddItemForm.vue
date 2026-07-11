<script setup lang="ts">
// <script setup> keeps the form's Composition API state local while exposing helpers to the template.
import { ref } from 'vue'

const emit = defineEmits<{
  add: [name: string, price: number, quantity: number]
}>()

// ref() keeps transient form input local so the Pinia store only receives valid grocery items.
const itemName = ref('')
const itemPrice = ref<number | null>(null)
const itemQuantity = ref(1)
const error = ref('')
const itemNameInput = ref<{ focus: () => void } | null>(null)

function normalizeQuantity(value: number) {
  return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1
}

function submitItem() {
  error.value = ''
  itemQuantity.value = normalizeQuantity(Number(itemQuantity.value))

  if (!itemName.value.trim()) {
    error.value = 'Enter an item name.'
    return
  }

  if (itemPrice.value === null || itemPrice.value < 0 || !Number.isFinite(itemPrice.value)) {
    error.value = 'Enter a valid price.'
    return
  }

  emit('add', itemName.value, itemPrice.value, itemQuantity.value)

  itemName.value = ''
  itemPrice.value = null
  itemQuantity.value = 1
}

function focusNameInput() {
  itemNameInput.value?.focus()
}

defineExpose({
  focusNameInput,
})
</script>

<template>
  <!-- Native form submission lets Enter add an item when the form data is valid. -->
  <v-form class="add-item-form" @submit.prevent="submitItem">
    <v-row dense>
      <v-col cols="12" md="5">
        <v-text-field
          ref="itemNameInput"
          v-model="itemName"
          label="Item name"
          maxlength="160"
          variant="outlined"
          autocomplete="off"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model.number="itemPrice"
          label="Unit price"
          prefix="$"
          type="number"
          min="0"
          step="0.01"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" sm="6" md="2">
        <v-text-field
          v-model.number="itemQuantity"
          label="Quantity"
          type="number"
          min="1"
          step="1"
          variant="outlined"
          @blur="itemQuantity = normalizeQuantity(Number(itemQuantity))"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-btn class="add-item-form__button" color="primary" type="submit" block>Add</v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" class="mt-2" type="error" variant="tonal" density="compact">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<style scoped>
.add-item-form__button {
  min-height: 56px;
}
</style>

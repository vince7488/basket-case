<script setup lang="ts">
// <script setup> makes these props and helpers available to the summary template without an options block.
const props = defineProps<{
  total: number
  budget: number
  remaining: number
  overBudgetBy: number
  isOverBudget: boolean
  pulse: boolean
}>()

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}
</script>

<template>
  <section class="budget-summary" :class="{ 'budget-summary--pulse': props.pulse }">
    <div class="budget-summary__grid">
      <div>
        <div class="text-caption text-medium-emphasis">Total</div>
        <div class="text-h5">{{ formatCurrency(props.total) }}</div>
      </div>

      <div>
        <div class="text-caption text-medium-emphasis">Budget</div>
        <div class="text-h6">{{ formatCurrency(props.budget) }}</div>
      </div>

      <div>
        <div class="text-caption text-medium-emphasis">
          {{ props.isOverBudget ? 'Over budget' : 'Remaining' }}
        </div>
        <div class="text-h6">
          {{
            props.isOverBudget
              ? formatCurrency(props.overBudgetBy)
              : formatCurrency(props.remaining)
          }}
        </div>
      </div>
    </div>

    <!-- v-if removes the warning from the DOM until it is relevant, so keyboard users do not tab through hidden error content. -->
    <v-alert v-if="props.isOverBudget" class="mt-4" type="error" variant="tonal">
      Over budget by {{ formatCurrency(props.overBudgetBy) }}.
    </v-alert>
  </section>
</template>

<style scoped>
.budget-summary {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 16px;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.budget-summary--pulse {
  border-color: rgb(var(--v-theme-error));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-error), 0.16);
}

.budget-summary__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .budget-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>

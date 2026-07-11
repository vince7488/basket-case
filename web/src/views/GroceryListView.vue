<script setup lang="ts">
// <script setup> runs once per component instance and exposes these bindings directly to the template.
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AddItemForm from '@/components/AddItemForm.vue'
import BudgetSummary from '@/components/BudgetSummary.vue'
import GroceryItemRow from '@/components/GroceryItemRow.vue'
import { useGroceryListStore } from '@/stores/groceryList'

const store = useGroceryListStore()
const route = useRoute()
const router = useRouter()
const addItemForm = ref<InstanceType<typeof AddItemForm> | null>(null)
const budgetPulse = ref(false)
const loadFailed = ref(false)
const snackbarMessage = ref('')
const snackbarVisible = ref(false)
const savedListUrl = computed(() => {
  if (!store.id) {
    return ''
  }

  const routeLocation = router.resolve({
    name: 'saved-list',
    params: {
      uuid: store.id,
    },
  })

  return `${window.location.origin}${routeLocation.href}`
})
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeBudget() {
  store.budget = Number.isFinite(Number(store.budget)) ? Math.max(0, Number(store.budget)) : 0
}

function showSnackbar(message: string) {
  snackbarMessage.value = message
  snackbarVisible.value = true
}

async function addItem(name: string, price: number, quantity: number) {
  store.addItem(name, price, quantity)

  // nextTick() waits for Vue to finish the form reset before returning focus to the name input.
  await nextTick()
  addItemForm.value?.focusNameInput()
}

async function save() {
  try {
    const wasNewList = !store.id
    const savedList = await store.saveList()

    if (wasNewList && savedList.id) {
      // Vue Router replace updates the URL after first save without leaving the unsaved route in history.
      await router.replace({
        name: 'saved-list',
        params: {
          uuid: savedList.id,
        },
      })
    }

    showSnackbar('List saved.')
  } catch {
    // The Pinia action sets store.error; the view only avoids an unhandled rejected click handler.
  }
}

async function copySavedListUrl() {
  if (!savedListUrl.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(savedListUrl.value)
    showSnackbar('Link copied.')
  } catch {
    store.error = 'The list link could not be copied.'
  }
}

function createNewList() {
  // Route replacement avoids leaving the invalid saved-list URL in browser history.
  router.replace({ name: 'new-list' })
}

// watch() is used for this local side effect: briefly pulse only when the total crosses the budget.
watch(
  () => store.total,
  (newTotal, oldTotal) => {
    const crossedBudget = oldTotal <= store.budget && newTotal > store.budget

    if (!crossedBudget) {
      return
    }

    budgetPulse.value = true

    window.setTimeout(() => {
      budgetPulse.value = false
    }, 600)
  },
)

watch(
  [() => route.name, () => route.params.uuid],
  async ([routeName, uuid]) => {
    loadFailed.value = false

    if (routeName === 'new-list') {
      // The root route always starts a fresh unsaved list instead of reusing a previously loaded UUID.
      store.resetList()
      return
    }

    if (routeName !== 'saved-list') {
      return
    }

    const savedUuid = Array.isArray(uuid) ? uuid[0] : uuid

    if (!savedUuid || !uuidPattern.test(savedUuid)) {
      store.resetList()
      store.error = 'The list could not be loaded. Check the link and try again.'
      loadFailed.value = true
      return
    }

    if (store.id === savedUuid) {
      return
    }

    try {
      // Vue Router params drive saved-list restoration when a shared UUID URL is opened.
      await store.loadList(savedUuid)
    } catch {
      loadFailed.value = true
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <v-container class="py-6 py-sm-8" max-width="960">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-4 pa-sm-6" rounded="lg">
          <v-card-title class="text-h4 px-0 pb-2">Basket Case</v-card-title>
          <v-card-subtitle class="px-0 pb-6">Grocery budget planner</v-card-subtitle>

          <v-progress-linear v-if="store.loading" class="mb-4" color="primary" indeterminate />

          <v-alert
            v-if="store.error"
            class="mb-4"
            type="error"
            variant="tonal"
            closable
            @click:close="store.error = null"
          >
            {{ store.error }}
          </v-alert>

          <v-alert v-if="loadFailed" class="mb-4" type="warning" variant="tonal">
            <div class="grocery-list-view__load-error">
              <span>This saved list could not be loaded.</span>
              <v-btn color="primary" variant="text" @click="createNewList">Create a new list</v-btn>
            </div>
          </v-alert>

          <template v-if="!store.loading && !loadFailed">
            <div class="grocery-list-view__section">
              <v-row dense>
                <v-col cols="12" md="7">
                  <!-- v-model keeps the input synchronized with Pinia state owned by the grocery-list store. -->
                  <v-text-field
                    v-model="store.name"
                    label="List name"
                    maxlength="120"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="5">
                  <v-text-field
                    v-model.number="store.budget"
                    label="Budget"
                    prefix="$"
                    type="number"
                    min="0"
                    step="0.01"
                    variant="outlined"
                    @blur="normalizeBudget"
                  />
                </v-col>
              </v-row>
            </div>


            <BudgetSummary
              class="grocery-list-view__section"
              :total="store.total"
              :budget="store.budget"
              :remaining="store.remaining"
              :over-budget-by="store.overBudgetBy"
              :is-over-budget="store.isOverBudget"
              :pulse="budgetPulse"
            />

            <v-divider class="my-6" />

            <section class="grocery-list-view__section">
              <h2 class="text-h6 mb-3">Add item</h2>
              <AddItemForm ref="addItemForm" @add="addItem" />
            </section>

            <section class="grocery-list-view__section">
              <h2 class="text-h6 mb-3">Items</h2>

              <!-- v-if swaps the empty state for rows only when there are no items to render. -->
              <v-alert v-if="store.items.length === 0" type="info" variant="tonal">
                Add your first grocery item to begin tracking the total.
              </v-alert>

              <div v-else class="grocery-list-view__items">
                <!-- UUID keys keep Vue row identity stable when deleting items from the middle of the list. -->
                <GroceryItemRow
                  v-for="item in store.items"
                  :key="item.id"
                  :item="item"
                  @delete="store.removeItem"
                  @quantity-change="store.updateQuantity"
                />
              </div>
            </section>

            <v-divider class="my-6" />

            <div class="grocery-list-view__actions">
              <v-btn
                color="primary"
                :loading="store.saving"
                :disabled="store.saving"
                @click="save"
              >
                {{ store.id ? 'Save changes' : 'Save list' }}
              </v-btn>
            </div>

            <v-alert v-if="store.id" class="mt-4" type="info" variant="tonal">
              <div class="grocery-list-view__share">
                <div>
                  <strong>Anyone with this link can open and edit this list.</strong>
                  <div class="text-body-2">{{ savedListUrl }}</div>
                </div>
                <v-btn color="primary" variant="tonal" @click="copySavedListUrl">Copy link</v-btn>
              </div>
            </v-alert>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbarVisible" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.grocery-list-view__section {
  margin-bottom: 24px;
}

.grocery-list-view__section:last-child {
  margin-bottom: 0;
}

.grocery-list-view__items {
  display: grid;
  gap: 12px;
}

.grocery-list-view__actions {
  display: flex;
  justify-content: flex-end;
}

.grocery-list-view__load-error,
.grocery-list-view__share {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.grocery-list-view__share {
  flex-wrap: wrap;
}


@media (max-width: 600px) {
  .grocery-list-view__load-error,
  .grocery-list-view__share {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

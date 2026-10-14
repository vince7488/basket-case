import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'

import { useGroceryListStore } from '@/stores/groceryList'
import GroceryListView from './GroceryListView.vue'

/**
 * GroceryListView is the single-screen surface of Basket Case:
 * List metadata (name & budget), budget calculations, add item form,
 * interactive grocery rows, persistence triggers, and share link generator.
 */
const meta = {
  title: 'Views/GroceryListView',
  component: GroceryListView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GroceryListView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Fresh empty grocery list.
 * Displays default list name, default budget ($100), and empty state alert.
 */
export const EmptyNewList: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Basket Case')).toBeInTheDocument()
    await expect(canvas.getByText('Add your first grocery item to begin tracking the total.')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /save list/i })).toBeInTheDocument()
  },
}

/**
 * Typical populated shopping trip safely under budget.
 * Shows item rows, stepper controls, line totals, and unspent budget remaining.
 */
export const PopulatedUnderBudget: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      store.setList({
        id: null,
        name: 'Weekly Trader Joes Haul',
        budget: 65,
        items: [
          { id: '1', name: 'Almond Milk (Unsweetened)', price: 3.49, quantity: 2 },
          { id: '2', name: 'Artisan Sourdough Boule', price: 5.99, quantity: 1 },
          { id: '3', name: 'Free-range Large Brown Eggs', price: 4.89, quantity: 1 },
          { id: '4', name: 'Avocados (Bag of 4)', price: 3.99, quantity: 1 },
        ],
      })
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText(/list name/i)).toHaveValue('Weekly Trader Joes Haul')
    await expect(canvas.getByText('Almond Milk (Unsweetened)')).toBeInTheDocument()
    await expect(canvas.getByText('$21.85')).toBeInTheDocument()
    await expect(canvas.getByText('$43.15')).toBeInTheDocument()
  },
}

/**
 * Budget overrun scenario with items exceeding the allocated spending ceiling.
 * Triggers over-budget banner and warning styling.
 */
export const PopulatedOverBudget: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      store.setList({
        id: null,
        name: 'BBQ Weekend Cookout',
        budget: 50,
        items: [
          { id: '1', name: 'Prime Ribeye Steaks (Twin Pack)', price: 36.99, quantity: 1 },
          { id: '2', name: 'Craft IPA 6-Pack', price: 14.49, quantity: 2 },
          { id: '3', name: 'Charcoal Briquettes (16 lb)', price: 12.99, quantity: 1 },
        ],
      })
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/over budget by \$28\.96/i)).toBeInTheDocument()
  },
}

/**
 * Saved list state showing the shareable link box, UUID identification,
 * and the "Save changes" button.
 */
export const SavedWithShareBanner: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      store.setList({
        id: '4c73d93b-e105-4f3b-b89e-2dc982c61148',
        name: 'Holiday Feast Ingredients',
        budget: 150,
        items: [
          { id: '1', name: 'Whole Free-range Turkey (14 lb)', price: 42.5, quantity: 1 },
          { id: '2', name: 'Fresh Cranberries (12 oz)', price: 2.99, quantity: 2 },
          { id: '3', name: 'Pecan Pie', price: 14.99, quantity: 1 },
        ],
      })
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Anyone with this link can open and edit this list.')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  },
}

/**
 * Loading state with active indeterminate progress bar.
 */
export const LoadingState: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      store.loading = true
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('progressbar')).toBeInTheDocument()
  },
}

/**
 * Server error alert state indicating save or synchronization failure.
 */
export const ErrorBanner: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      store.error = 'Network connection lost. The list could not be saved to the server.'
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Network connection lost. The list could not be saved to the server.')).toBeInTheDocument()
  },
}

/**
 * End-to-end interactive story:
 * Types a new grocery item into the form, submits it, and verifies that the item row
 * and updated financial summary render dynamically.
 */
export const InteractiveAddItem: Story = {
  render: () => ({
    components: { GroceryListView },
    setup() {
      const store = useGroceryListStore()
      store.resetList()
      return {}
    },
    template: '<GroceryListView />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const nameInput = canvas.getByLabelText(/item name/i)
    const priceInput = canvas.getByLabelText(/unit price/i)
    const addBtn = canvas.getByRole('button', { name: /add/i })

    await userEvent.type(nameInput, 'Organic Bananas')
    await userEvent.type(priceInput, '1.49')
    await userEvent.click(addBtn)

    // Item should now appear in the grocery list
    await expect(canvas.getByText('Organic Bananas')).toBeInTheDocument()
    await expect(canvas.getByText('$1.49 each')).toBeInTheDocument()
    // Both line total and budget total display $1.49
    await expect(canvas.getAllByText('$1.49')).toHaveLength(2)
    await expect(canvas.getByText('$98.51')).toBeInTheDocument()
  },
}

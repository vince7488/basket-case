import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import GroceryItemRow from './GroceryItemRow.vue'

/**
 * GroceryItemRow renders a single item in the grocery list with line total,
 * stepper controls for quantity adjustments, and a delete action.
 */
const meta = {
  title: 'Components/GroceryItemRow',
  component: GroceryItemRow,
  tags: ['autodocs'],
  argTypes: {
    item: {
      description: 'The grocery item model consisting of id, name, price, and quantity.',
    },
    onDelete: {
      action: 'delete',
      description: 'Emitted when the delete button is clicked.',
    },
    onQuantityChange: {
      action: 'quantityChange',
      description: 'Emitted when quantity is updated via the stepper.',
    },
  },
  args: {
    item: {
      id: 'item-101',
      name: 'Organic Honeycrisp Apples',
      price: 2.99,
      quantity: 2,
    },
    onDelete: fn(),
    onQuantityChange: fn(),
  },
} satisfies Meta<typeof GroceryItemRow>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default multi-quantity item showing item name, unit price, stepper, and calculated line total.
 */
export const Default: Story = {
  args: {
    item: {
      id: 'item-101',
      name: 'Organic Honeycrisp Apples',
      price: 2.99,
      quantity: 2,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Organic Honeycrisp Apples')).toBeInTheDocument()
    await expect(canvas.getByText('$2.99 each')).toBeInTheDocument()
    await expect(canvas.getByText('$5.98')).toBeInTheDocument()
  },
}

/**
 * Single quantity item (quantity = 1) ensuring the minus stepper button is disabled.
 */
export const SingleQuantity: Story = {
  args: {
    item: {
      id: 'item-102',
      name: 'Artisan Sourdough Loaf',
      price: 6.5,
      quantity: 1,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const decreaseBtn = canvas.getByRole('button', { name: /decrease quantity/i })
    await expect(decreaseBtn).toBeDisabled()
    await expect(canvas.getByText('$6.50')).toBeInTheDocument()
  },
}

/**
 * Long item name to stress visual regression testing on text wrapping and layout stability.
 */
export const LongItemName: Story = {
  args: {
    item: {
      id: 'item-103',
      name: 'San Marzano DOP Certified Organic Whole Peeled Plum Tomatoes 28 oz Can with Fresh Basil Leaf',
      price: 4.89,
      quantity: 3,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$14.67')).toBeInTheDocument()
  },
}

/**
 * High-value specialty item to verify multi-digit currency formatting.
 */
export const HighValueItem: Story = {
  args: {
    item: {
      id: 'item-104',
      name: 'First Cold Pressed Extra Virgin Olive Oil 3L Tin',
      price: 48.99,
      quantity: 2,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$97.98')).toBeInTheDocument()
  },
}

/**
 * Interaction test verifying delete button dispatches the delete event with item id.
 */
export const InteractiveDelete: Story = {
  args: {
    item: {
      id: 'item-to-delete',
      name: 'Item to Remove',
      price: 1.5,
      quantity: 1,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const deleteBtn = canvas.getByRole('button', { name: /delete item to remove/i })
    await userEvent.click(deleteBtn)
    await expect(args.onDelete).toHaveBeenCalledWith('item-to-delete')
  },
}

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import AddItemForm from './AddItemForm.vue'

/**
 * AddItemForm handles validation and submission of new grocery items:
 * name, unit price, and integer quantity.
 */
const meta = {
  title: 'Components/AddItemForm',
  component: AddItemForm,
  tags: ['autodocs'],
  argTypes: {
    onAdd: {
      action: 'add',
      description: 'Event emitted when a valid grocery item is added: (name, price, quantity).',
    },
  },
  args: {
    onAdd: fn(),
  },
} satisfies Meta<typeof AddItemForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default pristine form state.
 * The Add button must be disabled until required fields are valid.
 */
export const PristineEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const addBtn = canvas.getByRole('button', { name: /add/i })
    await expect(addBtn).toBeDisabled()
  },
}

/**
 * Form prefilled with valid data ready for submission.
 * Validates that the Add button enables once name and price are populated.
 */
export const ValidFilled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nameInput = canvas.getByLabelText(/item name/i)
    const priceInput = canvas.getByLabelText(/unit price/i)
    const quantityInput = canvas.getByLabelText(/quantity/i)
    const addBtn = canvas.getByRole('button', { name: /add/i })

    await userEvent.type(nameInput, 'Greek Yogurt (Plain)')
    await userEvent.type(priceInput, '4.99')
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '2')

    await expect(addBtn).toBeEnabled()
  },
}

/**
 * Full interactive submission test via Storybook play function:
 * Types inputs, submits, and verifies the onAdd action is dispatched.
 */
export const InteractiveAddSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const nameInput = canvas.getByLabelText(/item name/i)
    const priceInput = canvas.getByLabelText(/unit price/i)
    const addBtn = canvas.getByRole('button', { name: /add/i })

    await userEvent.type(nameInput, 'Organic Honeycrisp Apples')
    await userEvent.type(priceInput, '2.99')
    await userEvent.click(addBtn)

    await expect(args.onAdd).toHaveBeenCalledWith('Organic Honeycrisp Apples', 2.99, 1)
    // Form resets after submission
    await expect(nameInput).toHaveValue('')
  },
}

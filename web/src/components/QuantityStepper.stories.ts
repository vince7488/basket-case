import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import QuantityStepper from './QuantityStepper.vue'

/**
 * QuantityStepper provides increment, decrement, and direct numeric input
 * for adjusting grocery item quantities with a minimum threshold of 1.
 */
const meta = {
  title: 'Components/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'The numeric quantity value (min 1).',
    },
    'onUpdate:modelValue': {
      action: 'update:modelValue',
      description: 'Emitted when quantity changes via button click or text input.',
    },
  },
  args: {
    modelValue: 1,
  },
  render: (args) => ({
    components: { QuantityStepper },
    setup() {
      const quantity = ref(args.modelValue ?? 1)
      return { args, quantity }
    },
    template: `
      <div style="max-width: 200px;">
        <QuantityStepper v-model="quantity" />
      </div>
    `,
  }),
} satisfies Meta<typeof QuantityStepper>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Minimum boundary quantity (1).
 * Decrement button must be disabled to prevent zero or negative counts.
 */
export const MinimumQuantity: Story = {
  args: {
    modelValue: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const decreaseBtn = canvas.getByRole('button', { name: /decrease quantity/i })
    await expect(decreaseBtn).toBeDisabled()
  },
}

/**
 * Standard multiple-item quantity (3).
 * Both decrement and increment buttons are active.
 */
export const MultipleItems: Story = {
  args: {
    modelValue: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const decreaseBtn = canvas.getByRole('button', { name: /decrease quantity/i })
    const increaseBtn = canvas.getByRole('button', { name: /increase quantity/i })
    await expect(decreaseBtn).toBeEnabled()
    await expect(increaseBtn).toBeEnabled()
  },
}

/**
 * Large quantity test (99) to verify layout and text overflow within the stepper container.
 */
export const LargeQuantity: Story = {
  args: {
    modelValue: 99,
  },
}

/**
 * Interactive story testing user interactions:
 * Increments quantity from 2 to 3, then decrements back to 2.
 */
export const InteractiveStepping: Story = {
  args: {
    modelValue: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const decreaseBtn = canvas.getByRole('button', { name: /decrease quantity/i })
    const increaseBtn = canvas.getByRole('button', { name: /increase quantity/i })
    const input = canvas.getByRole('spinbutton', { name: /quantity/i })

    await expect(input).toHaveValue(2)
    await userEvent.click(increaseBtn)
    await expect(input).toHaveValue(3)
    await userEvent.click(decreaseBtn)
    await expect(input).toHaveValue(2)
  },
}

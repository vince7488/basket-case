import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import BudgetSummary from './BudgetSummary.vue'

/**
 * BudgetSummary displays financial telemetry for the grocery cart:
 * Total expenditure, allocated budget, and remaining funds or deficit warning.
 */
const meta = {
  title: 'Components/BudgetSummary',
  component: BudgetSummary,
  tags: ['autodocs'],
  argTypes: {
    total: {
      control: { type: 'number', min: 0, step: 0.01 },
      description: 'Current aggregate total cost of all cart items.',
    },
    budget: {
      control: { type: 'number', min: 0, step: 0.01 },
      description: 'Shopper budget ceiling in dollars.',
    },
    remaining: {
      control: { type: 'number', min: 0, step: 0.01 },
      description: 'Unspent budget allowance remaining.',
    },
    overBudgetBy: {
      control: { type: 'number', min: 0, step: 0.01 },
      description: 'Amount exceeding the allotted budget limit.',
    },
    isOverBudget: {
      control: 'boolean',
      description: 'Whether the current total exceeds the budget.',
    },
    pulse: {
      control: 'boolean',
      description: 'Triggers pulse highlight border animation on budget crossing.',
    },
  },
  args: {
    total: 42.5,
    budget: 100,
    remaining: 57.5,
    overBudgetBy: 0,
    isOverBudget: false,
    pulse: false,
  },
} satisfies Meta<typeof BudgetSummary>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Standard shopping session with expenditure safely below the budget target.
 */
export const UnderBudget: Story = {
  args: {
    total: 42.5,
    budget: 100,
    remaining: 57.5,
    overBudgetBy: 0,
    isOverBudget: false,
    pulse: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$42.50')).toBeInTheDocument()
    await expect(canvas.getByText('$100.00')).toBeInTheDocument()
    await expect(canvas.getByText('$57.50')).toBeInTheDocument()
    await expect(canvas.getByText('Remaining')).toBeInTheDocument()
  },
}

/**
 * Exact match between total expenditure and budget allowance ($0.00 remaining).
 */
export const ExactlyOnBudget: Story = {
  args: {
    total: 100,
    budget: 100,
    remaining: 0,
    overBudgetBy: 0,
    isOverBudget: false,
    pulse: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$0.00')).toBeInTheDocument()
  },
}

/**
 * Deficit scenario where basket total surpasses budget ceiling,
 * showing the warning banner and deficit calculation.
 */
export const OverBudget: Story = {
  args: {
    total: 134.85,
    budget: 100,
    remaining: 0,
    overBudgetBy: 34.85,
    isOverBudget: true,
    pulse: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Over budget')).toBeInTheDocument()
    await expect(canvas.getByText('$34.85')).toBeInTheDocument()
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await expect(canvas.getByText(/over budget by \$34\.85/i)).toBeInTheDocument()
  },
}

/**
 * Visual regression state capturing the pulsing error border glow
 * triggered immediately after a newly added item breaches the budget limit.
 */
export const PulseWarningActive: Story = {
  args: {
    total: 108.5,
    budget: 100,
    remaining: 0,
    overBudgetBy: 8.5,
    isOverBudget: true,
    pulse: true,
  },
}

/**
 * Initial empty basket state with untouched budget.
 */
export const EmptyBasket: Story = {
  args: {
    total: 0,
    budget: 150,
    remaining: 150,
    overBudgetBy: 0,
    isOverBudget: false,
    pulse: false,
  },
}

/**
 * Zero-budget constraint where any item purchased immediately triggers over-budget status.
 */
export const ZeroBudget: Story = {
  args: {
    total: 18.25,
    budget: 0,
    remaining: 0,
    overBudgetBy: 18.25,
    isOverBudget: true,
    pulse: false,
  },
}

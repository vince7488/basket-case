import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import AddItemForm from '@/components/AddItemForm.vue'
import BudgetSummary from '@/components/BudgetSummary.vue'
import GroceryItemRow from '@/components/GroceryItemRow.vue'
import QuantityStepper from '@/components/QuantityStepper.vue'
import { vuetifyStubs } from '@/__tests__/testUtils'
import type { GroceryItem } from '@/types/grocery'

const item: GroceryItem = {
  id: '6d8a099b-05b6-46c5-a8f8-44b60fc1c799',
  name: 'Milk',
  price: 2.5,
  quantity: 3,
}

function mountWithStubs(component: Parameters<typeof mount>[0], options: Parameters<typeof mount>[1]) {
  return mount(component, {
    ...options,
    global: {
      ...options?.global,
      stubs: {
        ...vuetifyStubs,
        ...options?.global?.stubs,
      },
    },
  })
}

describe('BudgetSummary', () => {
  it('shows total, budget, and remaining budget while within budget', () => {
    const wrapper = mountWithStubs(BudgetSummary, {
      props: {
        total: 20,
        budget: 100,
        remaining: 80,
        overBudgetBy: 0,
        isOverBudget: false,
        pulse: false,
      },
    })

    expect(wrapper.text()).toContain('Total')
    expect(wrapper.text()).toContain('$20.00')
    expect(wrapper.text()).toContain('Budget')
    expect(wrapper.text()).toContain('$100.00')
    expect(wrapper.text()).toContain('Remaining')
    expect(wrapper.text()).toContain('$80.00')
    expect(wrapper.text()).not.toContain('Over budget by')
  })

  it('shows explicit over-budget warning and pulse class', () => {
    const wrapper = mountWithStubs(BudgetSummary, {
      props: {
        total: 125,
        budget: 100,
        remaining: 0,
        overBudgetBy: 25,
        isOverBudget: true,
        pulse: true,
      },
    })

    expect(wrapper.classes()).toContain('budget-summary--pulse')
    expect(wrapper.text()).toContain('Over budget')
    expect(wrapper.text()).toContain('Over budget by $25.00.')
  })
})

describe('AddItemForm', () => {
  it('emits a normalized item and resets fields after valid submit', async () => {
    const wrapper = mountWithStubs(AddItemForm, {})
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('  Oats  ')
    await inputs[1].setValue('3.25')
    await inputs[2].setValue('2.8')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toEqual([['  Oats  ', 3.25, 2]])
    expect((inputs[0].element as HTMLInputElement).value).toBe('')
    expect((inputs[1].element as HTMLInputElement).value).toBe('')
    expect((inputs[2].element as HTMLInputElement).value).toBe('1')
  })

  it('keeps invalid submissions local with helpful errors', async () => {
    const wrapper = mountWithStubs(AddItemForm, {})

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.text()).toContain('Enter an item name.')

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Rice')
    await inputs[1].setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Enter a valid price.')
  })

  it('normalizes price and quantity on blur and exposes focus control', async () => {
    const wrapper = mountWithStubs(AddItemForm, {
      attachTo: document.body,
    })
    const inputs = wrapper.findAll('input')

    await inputs[1].setValue('-4')
    await inputs[1].trigger('blur')
    await inputs[2].setValue('0')
    await inputs[2].trigger('blur')
    await nextTick()

    expect((inputs[1].element as HTMLInputElement).value).toBe('0')
    expect((inputs[2].element as HTMLInputElement).value).toBe('1')

    wrapper.vm.focusNameInput()
    expect(document.activeElement).toBe(inputs[0].element)
  })
})

describe('QuantityStepper', () => {
  it('increases, decreases, and prevents quantities below one', async () => {
    const wrapper = mountWithStubs(QuantityStepper, {
      props: {
        modelValue: 2,
        'onUpdate:modelValue': async (value: number) => {
          await wrapper.setProps({ modelValue: value })
        },
      },
    })
    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click')
    expect(wrapper.props('modelValue')).toBe(3)

    await buttons[0].trigger('click')
    await buttons[0].trigger('click')
    expect(wrapper.props('modelValue')).toBe(1)
    expect(buttons[0].attributes('disabled')).toBeDefined()
  })

  it('normalizes typed decimal and invalid quantities', async () => {
    const Parent = defineComponent({
      components: { QuantityStepper },
      setup() {
        const quantity = ref(2)

        return { quantity }
      },
      template: '<QuantityStepper v-model="quantity" />',
    })
    const wrapper = mountWithStubs(Parent, {})
    const input = wrapper.find('input')

    await input.setValue('4.9')
    expect(wrapper.vm.quantity).toBe(4)

    await input.setValue('not-a-number')
    await input.trigger('blur')
    expect(wrapper.vm.quantity).toBe(1)
  })
})

describe('GroceryItemRow', () => {
  it('renders item details and emits delete by UUID', async () => {
    const wrapper = mountWithStubs(GroceryItemRow, {
      props: { item },
    })

    expect(wrapper.text()).toContain('Milk')
    expect(wrapper.text()).toContain('$2.50 each')
    expect(wrapper.text()).toContain('Line total')
    expect(wrapper.text()).toContain('$7.50')
    expect(wrapper.find('[aria-label="Delete Milk"]').exists()).toBe(true)

    await wrapper.find('[aria-label="Delete Milk"]').trigger('click')

    expect(wrapper.emitted('delete')).toEqual([[item.id]])
  })

  it('emits quantity changes through the row model setter', async () => {
    const wrapper = mountWithStubs(GroceryItemRow, {
      props: { item },
    })

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('quantityChange')).toEqual([[item.id, 4]])
  })
})

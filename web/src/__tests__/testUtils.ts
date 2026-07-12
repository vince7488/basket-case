import { defineComponent, h, ref } from 'vue'

export const VBtnStub = defineComponent({
  name: 'VBtn',
  props: {
    block: Boolean,
    color: String,
    disabled: Boolean,
    icon: String,
    loading: Boolean,
    type: String,
    variant: String,
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          disabled: props.disabled || props.loading,
          type: props.type || 'button',
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.() ?? props.icon ?? '',
      )
  },
})

export const VTextFieldStub = defineComponent({
  name: 'VTextField',
  props: {
    ariaLabel: String,
    autocomplete: String,
    class: String,
    density: String,
    errorMessages: [String, Array],
    hideDetails: Boolean,
    label: String,
    maxLength: [String, Number],
    min: [String, Number],
    modelModifiers: Object,
    modelValue: [String, Number, null],
    prefix: String,
    step: [String, Number],
    type: String,
    variant: String,
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, { attrs, emit, expose }) {
    const input = ref<HTMLInputElement | null>(null)

    function normalizeInputValue(value: string) {
      if (props.type === 'number' || props.modelModifiers?.number) {
        return value === '' ? null : Number(value)
      }

      return value
    }

    expose({
      focus: () => input.value?.focus(),
    })

    return () =>
      h('label', { class: props.class }, [
        props.label ? h('span', props.label) : null,
        h('input', {
          ...attrs,
          ref: input,
          'aria-label': attrs['aria-label'] ?? props.label,
          autocomplete: props.autocomplete,
          maxlength: props.maxLength,
          min: props.min,
          step: props.step,
          type: props.type || 'text',
          value: props.modelValue ?? '',
          onBlur: (event: FocusEvent) => emit('blur', event),
          onInput: (event: Event) => emit('update:modelValue', normalizeInputValue((event.target as HTMLInputElement).value)),
        }),
        props.errorMessages ? h('div', props.errorMessages) : null,
      ])
  },
})

export const vuetifyStubs = {
  VAlert: defineComponent({
    name: 'VAlert',
    props: {
      closable: Boolean,
      density: String,
      type: String,
      variant: String,
    },
    emits: ['click:close'],
    setup(_props, { emit, slots }) {
      return () =>
        h('div', { role: 'alert' }, [slots.default?.(), h('button', { type: 'button', onClick: () => emit('click:close') }, 'Close')])
    },
  }),
  VApp: defineComponent({
    name: 'VApp',
    setup(_props, { slots }) {
      return () => h('div', { class: 'v-app' }, slots.default?.())
    },
  }),
  VBtn: VBtnStub,
  VCard: defineComponent({
    name: 'VCard',
    setup(_props, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.())
    },
  }),
  VCardSubtitle: defineComponent({
    name: 'VCardSubtitle',
    setup(_props, { slots }) {
      return () => h('div', slots.default?.())
    },
  }),
  VCardTitle: defineComponent({
    name: 'VCardTitle',
    setup(_props, { slots }) {
      return () => h('div', slots.default?.())
    },
  }),
  VCol: defineComponent({
    name: 'VCol',
    setup(_props, { slots }) {
      return () => h('div', slots.default?.())
    },
  }),
  VContainer: defineComponent({
    name: 'VContainer',
    setup(_props, { attrs, slots }) {
      return () => h('main', attrs, slots.default?.())
    },
  }),
  VDivider: defineComponent({
    name: 'VDivider',
    setup() {
      return () => h('hr')
    },
  }),
  VForm: defineComponent({
    name: 'VForm',
    emits: ['submit'],
    setup(_props, { attrs, emit, slots }) {
      return () =>
        h(
          'form',
          {
            ...attrs,
            onSubmit: (event: Event) => {
              event.preventDefault()
              emit('submit', event)
            },
          },
          slots.default?.(),
        )
    },
  }),
  VMain: defineComponent({
    name: 'VMain',
    setup(_props, { slots }) {
      return () => h('main', slots.default?.())
    },
  }),
  VProgressLinear: defineComponent({
    name: 'VProgressLinear',
    setup() {
      return () => h('div', { role: 'progressbar' })
    },
  }),
  VRow: defineComponent({
    name: 'VRow',
    setup(_props, { slots }) {
      return () => h('div', slots.default?.())
    },
  }),
  VSnackbar: defineComponent({
    name: 'VSnackbar',
    props: {
      modelValue: Boolean,
      timeout: [String, Number],
    },
    setup(props, { slots }) {
      return () => (props.modelValue ? h('div', { role: 'status' }, slots.default?.()) : null)
    },
  }),
  VTextField: VTextFieldStub,
}

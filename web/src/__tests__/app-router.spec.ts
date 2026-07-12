import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'
import router from '@/router'
import { vuetifyStubs } from '@/__tests__/testUtils'

describe('App shell and router', () => {
  it('renders the active route inside the Vuetify app shell', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          ...vuetifyStubs,
          RouterView: {
            template: '<section>Matched route</section>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Matched route')
  })

  it('defines new-list and saved-list routes on the single grocery surface', () => {
    const routeNames = router.getRoutes().map((route) => route.name)

    expect(routeNames).toContain('new-list')
    expect(routeNames).toContain('saved-list')
    expect(router.resolve('/').name).toBe('new-list')
    expect(router.resolve('/list/3f87c1a0-33a5-4c2d-a9f0-10beee537010').name).toBe('saved-list')
  })
})

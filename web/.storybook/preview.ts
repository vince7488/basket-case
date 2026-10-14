import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import vuetify from '../src/plugins/vuetify'
import '../src/assets/main.css'

const memoryRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'storybook-preview',
      component: { template: '<div />' },
    },
    {
      path: '/new',
      name: 'new-list',
      component: { template: '<div />' },
    },
    {
      path: '/list/:uuid',
      name: 'saved-list',
      component: { template: '<div />' },
    },
  ],
})

setup((app) => {
  app.use(createPinia())
  app.use(memoryRouter)
  app.use(vuetify)
})

const preview: Preview = {
  decorators: [
    () => ({
      template: `
        <v-app>
          <v-main style="padding: 24px; background-color: #f7f8fa; min-height: 100vh;">
            <div style="max-width: 960px; margin: 0 auto; width: 100%;">
              <story />
            </div>
          </v-main>
        </v-app>
      `,
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview

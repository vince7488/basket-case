# Basket Case Frontend

This directory contains the Vue frontend for Basket Case v0.0.1.

The app is one grocery-list surface. Users can edit a list name and budget, add grocery items, see line totals and budget status, save to Laravel, reload a UUID route, and copy a shareable URL.

## Stack

- Vue 3 with the Composition API
- TypeScript
- Vite
- Pinia
- Vue Router
- Vuetify
- Node `^22.18.0 || >=24.12.0`
- Yarn 3.4.1 through Corepack

## Setup

Run these commands from `web/`:

```powershell
corepack enable
yarn install
```

Corepack reads the `packageManager` field in `package.json` and uses the pinned Yarn version.

## Environment

The frontend uses one configurable API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Put that value in `web/.env` when the Laravel API is running through `php artisan serve`.

Restart `yarn dev` after changing `.env` because Vite reads environment variables at startup.

Older `.test` API URLs are not part of the supported local workflow.

## Run

Start the frontend from `web/`:

```powershell
yarn dev
```

The app runs at:

```text
http://localhost:5173
```

The Laravel API must also be running for save, reload, update, and share flows to work.

## Useful Commands

```powershell
yarn dev
yarn build
yarn type-check
yarn preview
yarn lint
yarn test:unit
yarn coverage
yarn format
```

`yarn build` runs `vue-tsc --build` and then `vite build`.

## Source Layout

```text
src/
├── api/          Fetch functions for Laravel list endpoints
├── components/   Reusable list, item, summary, and quantity controls
├── plugins/      Vuetify setup
├── router/       `/` and `/list/:uuid` routes
├── stores/       Pinia grocery-list state and actions
├── types/        Shared TypeScript types
├── views/        Single grocery-list view
├── App.vue
└── main.ts
```

## Product Boundaries

Keep business state in the Pinia store and API calls in `src/api/listsApi.ts`.

Do not add dashboards, authentication, categories, notes, item completion, images, drag-and-drop, autosave, offline support, real-time collaboration, analytics, or broad design-system infrastructure for v0.0.1.

## Recommended Editor Setup

Use VS Code with the Vue Official extension. Disable Vetur if it is installed.

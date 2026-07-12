# Basket Case

Basket Case is a single-screen grocery budgeting web application. A user can name a shopping list, set a budget, add grocery items, see
running totals, save the list, reopen it through a UUID URL, and share the URL with another person.

## MVP release

VERSION: **v0.0.1**.

## Technology

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vuetify
- Frontend package manager: Yarn 3 (managed through Corepack)
- Backend: Laravel JSON API
- Development database: SQLite
- Persistence model: one `grocery_lists` record containing the complete item array as JSON

## Current status

The project foundation is in place:

- Laravel is configured as a JSON API backend with SQLite for local development.
- Vue is configured with Vite, TypeScript, Pinia, Vue Router, and Vuetify.
- Phase 0 includes a Laravel health endpoint at `http://localhost:8000/api/health`.

The MVP intentionally excludes accounts, authentication, categories, notes, drag-and-drop, autosave, offline support, real-time
collaboration, dashboards, analytics, Docker, and CI/CD.

## Project structure

```text
basket-case/
├── api/          Laravel application
├── web/          Vue application
├── docs/         Product and delivery specifications
└── README.md
```

## Run locally

Run the backend locally by executing:

```powershell
php artisan serve
```

You need to be in the `/api` (Laravel build) folder.

Then run the frontend locally by executing:

```powershell
yarn dev
```

You need to be in the `/web` (Laravel build) folder.

### Backend

```powershell
cd api
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
```

You can open the `api` directory and make sure the site is running. The API should be available at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health
```

### Frontend

```sh
cd web
corepack enable
yarn install
yarn dev
```

The frontend pins its Yarn version in `web/package.json`. Run frontend dependency and script commands with Yarn from the `web` directory.

The frontend runs at:

```text
http://localhost:5173
```

Optional frontend environment file:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

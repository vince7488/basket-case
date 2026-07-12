# Basket Case

Basket Case is a v0.0.1 single-screen grocery budgeting app. A shopper can name a list, set a budget, add items, see running totals, save the list, reopen it through a UUID URL, and share that URL with another person.

The product scope is defined in [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md). Anything outside that file is intentionally deferred for later releases.

## Stack

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vuetify
- Frontend runtime: Node `^22.18.0 || >=24.12.0`
- Frontend package manager: Yarn 3 through Corepack
- Backend: Laravel JSON API
- Backend runtime: PHP 8.3+
- Local database: SQLite
- Persistence model: one `grocery_lists` record with the full item array stored as JSON

## Project Structure

```text
basket-case/
├── api/          Laravel API application
├── web/          Vue frontend application
├── docs/         Product and delivery specifications
└── README.md
```

## Local URLs

Use these defaults when running the apps with Vite and Laravel's built-in server:

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
API:      http://127.0.0.1:8000/api
Health:   http://127.0.0.1:8000/api/health
```

The frontend reads its API URL from `web/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Keep `web/.env` on `127.0.0.1:8000` for the standard local workflow. Older `.test` examples are not part of the supported local setup.

## First-Time Setup

Install and prepare the backend:

```powershell
cd api
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan migrate
```

Laravel's SQLite connection defaults to `api/database/database.sqlite` when `DB_CONNECTION=sqlite`.

Install frontend dependencies:

```powershell
cd ..\web
corepack enable
yarn install
```

## Run Locally

Start the Laravel API from the `api` directory:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

In a second terminal, start the Vue app from the `web` directory:

```powershell
yarn dev
```

Open `http://localhost:5173`.

## Useful Commands

Backend commands, run from `api/`:

```powershell
php artisan migrate
php artisan test
composer test
vendor\bin\pint
```

Frontend commands, run from `web/`:

```powershell
yarn dev
yarn build
yarn type-check
yarn lint
yarn test:unit
yarn coverage
yarn format
```

## API Surface

The MVP exposes only these Laravel JSON API endpoints:

```text
GET  /api/health
POST /api/lists
GET  /api/lists/{uuid}
PUT  /api/lists/{uuid}
```

The app has no authentication. Anyone with a saved list URL can open and edit that list.

## Out of Scope for v0.0.1

Basket Case intentionally excludes accounts, authentication, categories, notes, item completion, images, drag-and-drop, autosave, offline support, real-time collaboration, dashboards, analytics, Docker, CI/CD, and broad service/repository/domain layers.

# Basket Case

Basket Case is a v0.0.1 single-screen grocery budgeting app. A shopper can name a list, set a budget, add items, see running totals, save the list, reopen it through a UUID URL, and share that URL with another person.

Forget dusty, sluggish notepad apps. **Basket Case** is engineered from the asphalt up to turn mundane supermarket runs into a high-precision, sub-millisecond fiscal operation.

The Alpha started with a stripped-down, lightweight track weapon (v0.0.1)—pure Vue 3 reactivity coupled with high-efficiency Laravel JSON telemetry. But under the hood? The chassis is architected for **limitless scale, modular upgrades, and extreme cross-platform domination.**

## Screenshots

<img width="1290" height="776" alt="v.0.0.1 Alpha" src="https://github.com/user-attachments/assets/6270146d-0dd2-4ba9-a635-ab82811e8b96" />

<img width="1705" height="890" alt="v.0.0.1 Alpha" src="https://github.com/user-attachments/assets/6717498f-41a0-496e-b407-595101c9f520" />

<img width="1467" height="946" alt="v.0.0.1 Alpha" src="https://github.com/user-attachments/assets/d86c9a8f-cbb8-423a-9d06-6e16954c4bd3" />

<img width="1238" height="601" alt="v.0.0.1 Alpha" src="https://github.com/user-attachments/assets/dfb9d07b-50e3-4a00-9b22-10f94dfe76a4" />

---

## Stack

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vuetify
- Frontend runtime: Node `^22.18.0 || >=24.12.0`
- Frontend package manager: Yarn 3 through Corepack
- Backend: Laravel JSON API
- Backend runtime: PHP 8.3+
- Local database: SQLite
- Persistence model: one `grocery_lists` record with the full item array stored as JSON

### Project Structure

```text
basket-case/
├── api/          Laravel API application
├── web/          Vue frontend application
├── docs/         Product and delivery specifications
└── README.md
```

## First-Time Setup

Consult the individual **Read Me Markdown files** from the `/api` (backend) and `/web` (frontend) folders. These contain precise instructions on how to start this app locally.

### Run Locally

Start the Laravel API from the `api` directory:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

In a second terminal, start the Vue app from the `web` directory:

```bash
yarn dev
```

Open `http://localhost:5173`.

### Useful Commands

### Backend commands, run from `api/`:

**macOS & Linux (Bash / Zsh):**
```bash
php artisan migrate
php artisan test
composer test
./vendor/bin/pint
```

**Windows (PowerShell):**
```powershell
php artisan migrate
php artisan test
composer test
vendor\bin\pint
```

### Frontend commands, run from `web/`:

*(Works identically across macOS, Linux, and Windows)*

```bash
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

The app has no authentication yet. Anyone with a saved list URL can open and edit that list.

## 🚀 The Flight Deck: Architectural Vision & Roadmap

We’re not just building a shopping list; we’re engineering a zero-latency shopping telemetry platform. Here is the trajectory:

### 1. 📱 Bare-Metal Native Mobile Propulsion (iOS & Android)

* **The Mission:** Break free of the mobile browser frame and unleash 120Hz fluid haptics in the palm of your hand.
* **The Tech:** Packaging our high-speed frontend into native iOS and Android runtimes. Think instant cold-starts, native camera hardware hooks, background synchronization, and biometric-secured offline storage that feels glued to your fingertips.

### 2. ⚡ Sub-Millisecond Optical Barcode Scanning (Computer Vision Ingestion)

* **The Mission:** Zero keyboard friction in the grocery aisle. 
* **The Tech:** Direct camera-stream ingestion using WebAssembly-accelerated barcode decoding (UPC/EAN). Point your lens at an item, fire the laser, and watch the product name, unit price, and itemized subtotal snap into your budget before the package even hits the cart.

### 3. 🛡️ The Zero-Friction Identity Gradient (Ghost Mode ➔ Hardened OAuth)

* **The Mission:** Instant utility with zero signup walls, but enterprise-grade security when you're ready.
* **The Tech:** 
  * **Default Track Mode (Local Ghost):** Instant anonymous utility. State lives entirely in local SQLite / IndexedDB. Zero sign-in, zero friction, zero tracking.
  * **Ludicrous Upgrade (OAuth 2.0 & Passkeys):** One tap links your anonymous session into a cloud-synced account via Apple, Google, or GitHub. Seamless state hydration—your local list instantly promotes to a persistent multi-device profile with zero data loss.

The product Alpha scope is defined in [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md). Anything outside that file is intentionally deferred for later releases.

## Out of Scope for v0.0.1

Basket Case intentionally excludes accounts, authentication, categories, notes, item completion, images, drag-and-drop, autosave, offline support, real-time collaboration, dashboards, analytics, Docker, CI/CD, and broad service/repository/domain layers.

# Basket Case API

This directory contains the Laravel JSON API for Basket Case v0.0.1.

The backend stores each grocery list as one `grocery_lists` record. List items are embedded in the record's `items` JSON column for this release.

## Stack

- Laravel 13.8+
- PHP 8.3+
- SQLite for local development
- UUID primary keys for saved list URLs

## Local URLs

```text
Backend: http://127.0.0.1:8000
Health:  http://127.0.0.1:8000/api/health
```

## Setup

Run these commands from `api/`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan migrate
```

The default `.env.example` uses SQLite:

```env
DB_CONNECTION=sqlite
```

No MySQL or PostgreSQL service is required for the MVP. Laravel defaults to `database/database.sqlite` for the local SQLite database file.

## Run

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

## API Endpoints

```text
GET  /api/health
POST /api/lists
GET  /api/lists/{groceryList}
PUT  /api/lists/{groceryList}
```

The `{groceryList}` route parameter is resolved by Laravel route model binding against the UUID primary key.

## Data Model

`grocery_lists` contains:

```text
id          UUID primary key
name        string, max 120
budget      decimal(10, 2), minimum 0
items       JSON array
created_at  timestamp
updated_at  timestamp
```

Each item in `items` must include:

```json
{
  "id": "63c2cc03-89da-49a9-a4e1-b55be7cd51ae",
  "name": "Milk",
  "price": 4.99,
  "quantity": 2
}
```

## Validation Rules

- `name`: required string, maximum 120
- `budget`: required numeric, minimum 0
- `items`: required array
- `items.*.id`: required UUID
- `items.*.name`: required string, maximum 160
- `items.*.price`: required numeric, minimum 0
- `items.*.quantity`: required integer, minimum 1

## Useful Commands

```powershell
php artisan migrate
php artisan route:list --path=api
php artisan test
composer test
vendor\bin\pint
```

The default `composer test` script clears configuration and runs `php artisan test`.

## Scope Notes

The API intentionally does not include authentication, ownership, delete endpoints, list indexes, item tables, Form Request classes, API Resources, service layers, queues, WebSockets, or real-time collaboration for v0.0.1.

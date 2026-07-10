# Basket Case Agent Instructions

These instructions apply to all repository work performed by ChatGPT, Codex, or another coding agent.

## Product boundary

Implement only the Basket Case v0.0.1 scope defined in `docs/PROJECT_SPEC.md` and the currently assigned GitHub issue.

Do not add speculative features, abstractions, dependencies, or infrastructure.

## Required stack

- Vue 3 with the Composition API
- TypeScript
- Vite
- Pinia
- Vue Router
- Vuetify
- Laravel JSON API
- SQLite for local development

Do not substitute another framework, state library, router, component library, backend, or database without an explicit issue changing the architecture.

## Repository layout

```text
api/    Laravel backend
web/    Vue frontend
docs/   Product and delivery documentation
```

Keep frontend and backend code inside these directories.

## Architecture constraints

- The product is one working grocery-list surface, not a dashboard.
- Use one `grocery_lists` table.
- Store items as JSON in the grocery-list record for v0.0.1.
- Use UUIDs for lists and grocery items.
- Expose only the required create, read, and update endpoints.
- Use one configurable frontend API base URL.
- Keep business state in the Pinia store.
- Keep API calls in `web/src/api/listsApi.ts`.
- Do not create service, repository, domain, command, event, or Form Request layers for this release.

## Explicit exclusions

Do not add:

- Authentication or user accounts
- Laravel Sanctum, Breeze, Jetstream, Inertia, or Livewire
- Categories, notes, item completion, images, or reordering
- Autosave, session recovery, or offline support
- WebSockets or real-time collaboration
- Multiple-list dashboards
- Relational item tables
- Charts or analytics
- Docker or CI/CD
- A general animation framework
- Premature performance helpers such as `v-memo` or `shallowRef`
- A broad design system beyond practical Vuetify configuration and spacing

## Implementation rules

1. Read the relevant phase issue and `docs/PROJECT_SPEC.md` before changing code.
2. Implement only the issue acceptance criteria.
3. Preserve user-entered list data when an API request fails.
4. Do not use array indexes as Vue keys.
5. Do not permit quantities below one or negative prices and budgets.
6. Do not communicate budget status through colour alone.
7. Add accessible labels to icon-only buttons.
8. Do not silently redirect an invalid saved-list URL.
9. After the first successful save, replace the route with `/list/:uuid`.
10. Make code changes small enough to review in one pull request.

## Verification expectations

Before marking an issue complete:

- Run the applicable formatter, linter, type check, and build commands.
- Run Laravel migrations when schema work is involved.
- Manually verify the issue acceptance criteria.
- Report commands run and any unverified behavior in the pull request.
- Do not claim tests passed unless they were executed successfully.

## Git workflow

- Create a focused branch from `main`.
- Use conventional commits where practical.
- Reference the issue in the pull request body with `Closes #<issue-number>`.
- Do not combine unrelated phases in one pull request.

## Definition of a good agent response

A useful implementation response states:

- What changed
- Which files changed
- Which acceptance criteria are satisfied
- Which commands were run
- Any remaining risk or manual verification needed

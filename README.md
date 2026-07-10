# Basket Case

Basket Case is a single-screen grocery budgeting web application. A user can name a shopping list, set a budget, add grocery items, see running totals, save the list, reopen it through a UUID URL, and share the URL with another person.

## MVP release

The first release is **v0.0.1**.

The MVP intentionally excludes accounts, authentication, categories, notes, drag-and-drop, autosave, offline support, real-time collaboration, dashboards, analytics, Docker, and CI/CD.

## Technology

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vuetify
- Backend: Laravel JSON API
- Development database: SQLite
- Persistence model: one `grocery_lists` record containing the complete item array as JSON

## Project structure

```text
basket-case/
├── api/          Laravel application
├── web/          Vue application
├── docs/         Product and delivery specifications
├── AGENTS.md     Instructions for ChatGPT and coding agents
└── README.md
```

## Delivery hierarchy

The GitHub delivery model is:

```text
Release epic
└── Phase issue
    ├── User story
    ├── Technical task checklist
    └── Acceptance criteria
```

For v0.0.1, each phase is represented by one tracking issue. User stories and implementation tasks live inside the phase issue so the MVP remains easy to navigate and execute.

## Documentation

- [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) – product scope, architecture, requirements, phases, stories, acceptance criteria, and definition of done
- [`docs/DELIVERY_WORKFLOW.md`](docs/DELIVERY_WORKFLOW.md) – branch, issue, commit, pull request, and ChatGPT execution workflow
- [`AGENTS.md`](AGENTS.md) – repository-level implementation constraints for ChatGPT and coding agents

## Starting development

Work from the current open phase issue. Create one branch per phase or user story, implement only the listed scope, verify the acceptance criteria, and open a pull request referencing the issue.

Recommended branch format:

```text
phase/0-project-foundation
story/add-grocery-item
fix/save-error-state
```

Recommended pull request reference:

```text
Closes #<issue-number>
```

## Release definition

Basket Case v0.0.1 is complete when the entire flow works from creating a list through saving, reloading, editing, and sharing it, while preserving the visible list when API requests fail.

# Basket Case v0.0.1 Project Specification

## 1. Document control

| Field | Value |
|---|---|
| Product | Basket Case |
| Release | v0.0.1 |
| Status | Approved for MVP implementation |
| Product type | Responsive single-screen web application |
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router, Vuetify |
| Backend | Laravel JSON API |
| Local database | SQLite |
| Access model | Anyone possessing a list UUID URL can open and edit the list |

## 2. Product objective

Basket Case helps a person build a grocery list while continuously comparing the projected purchase total against a chosen budget.

The MVP must support one complete flow:

1. Open a new grocery list.
2. Name the list.
3. Set a budget.
4. Add items with a name, unit price, and quantity.
5. See line totals and the overall total update immediately.
6. See the remaining budget or the over-budget amount.
7. Change quantities or delete items.
8. Save the list to Laravel.
9. Receive a UUID-based URL.
10. Reload, update, and share that URL.

## 3. Product principles

- Keep the application focused on one useful task.
- Prefer obvious behavior over flexible architecture.
- Preserve user-entered data when network operations fail.
- Make the budget state understandable without relying on colour alone.
- Keep the data model intentionally simple for the first release.
- Treat the shared UUID as possession-based access, not authentication or privacy.

## 4. Primary user

A shopper planning a grocery trip who wants to estimate the total cost of a list and stay within a target budget.

The MVP does not distinguish list owners, editors, or viewers. Every person with the list URL has the same edit capability.

## 5. In-scope capabilities

### 5.1 List details

- Default list name: `My grocery list`
- Editable list name
- Maximum list-name length: 120 characters
- Editable non-negative budget
- USD currency display

### 5.2 Grocery items

Each item contains:

```ts
interface GroceryItem {
  id: string
  name: string
  price: number
  quantity: number
}
```

The user can:

- Add an item
- Enter a non-empty item name
- Enter a non-negative unit price
- Enter a whole-number quantity of at least one
- Increase or decrease quantity
- Delete an item
- See the calculated line total

### 5.3 Budget calculations

The application calculates:

```text
total = sum(item.price × item.quantity)
difference = budget - total
remaining = max(difference, 0)
overBudgetBy = max(-difference, 0)
```

The application must show:

- Current total
- Budget
- Remaining amount when total is at or below budget
- Over-budget amount when total exceeds budget
- A visible textual warning when the budget threshold is crossed

### 5.4 Persistence and sharing

The user can:

- Save a new list
- Update an existing saved list
- Reload a list through `/list/:uuid`
- Copy the current list URL

After the first successful save, the route changes from `/` to `/list/:uuid` using router replacement.

## 6. Explicitly excluded from v0.0.1

The following are deferred:

- Authentication and accounts
- Laravel Sanctum, Breeze, Jetstream, Inertia, and Livewire
- Ownership and permissions
- Private or read-only sharing
- Categories
- Notes
- Item completion state
- Images
- Drag-and-drop ordering
- Autosave
- Session recovery
- Offline support
- Real-time collaboration
- Multiple-list dashboard
- Relational item records
- Charts
- Analytics and monitoring
- Docker
- CI/CD
- Full automated test suites
- General animation architecture
- Service, repository, domain, or command layers
- Laravel Form Request classes and API Resources

## 7. Information architecture

Basket Case uses one primary view for both new and saved lists.

### Routes

| Route | Purpose |
|---|---|
| `/` | Create a new unsaved list |
| `/list/:uuid` | Load and edit an existing list |

### Main screen regions

1. Product title
2. List name and budget inputs
3. Budget summary
4. Add-item form
5. Grocery item list or empty state
6. Save control
7. Share control after the first save
8. Status and error feedback

The MVP must not introduce a dashboard, sidebar, drawer, or multi-page navigation structure.

## 8. Frontend architecture

### 8.1 Required file structure

```text
web/src/
├── api/
│   └── listsApi.ts
├── components/
│   ├── AddItemForm.vue
│   ├── BudgetSummary.vue
│   ├── GroceryItemRow.vue
│   └── QuantityStepper.vue
├── plugins/
│   └── vuetify.ts
├── router/
│   └── index.ts
├── stores/
│   └── groceryList.ts
├── types/
│   └── grocery.ts
├── views/
│   └── GroceryListView.vue
├── App.vue
└── main.ts
```

### 8.2 State ownership

The Pinia grocery-list store owns:

- `id`
- `name`
- `budget`
- `items`
- `loading`
- `saving`
- `error`
- Derived budget calculations
- Add, remove, and quantity-update actions
- Save and load actions

Transient form input, focus state, snackbar state, and animation state remain local to the relevant component or view.

### 8.3 API ownership

All network access is defined in `web/src/api/listsApi.ts`.

The frontend reads the API base URL from:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Components must not hard-code backend URLs.

## 9. Backend architecture

### 9.1 Required file structure

```text
api/
├── app/
│   ├── Http/Controllers/GroceryListController.php
│   └── Models/GroceryList.php
├── database/
│   └── migrations/
│       └── create_grocery_lists_table.php
└── routes/
    └── api.php
```

### 9.2 Database schema

Use one `grocery_lists` table:

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key, generated by Laravel |
| `name` | String | Required, maximum 120 characters |
| `budget` | Decimal 10,2 | Required, minimum 0 |
| `items` | JSON | Required array |
| `created_at` | Timestamp | Laravel managed |
| `updated_at` | Timestamp | Laravel managed |

Items are not normalized into their own table for v0.0.1.

### 9.3 Model behavior

`GroceryList` uses Laravel UUID generation and casts:

- `budget` to decimal with two places
- `items` to array

Mass-assignable fields are `name`, `budget`, and `items`.

## 10. API contract

### 10.1 Create list

```http
POST /api/lists
```

Request body:

```json
{
  "name": "Saturday groceries",
  "budget": 100,
  "items": [
    {
      "id": "63c2cc03-89da-49a9-a4e1-b55be7cd51ae",
      "name": "Milk",
      "price": 4.99,
      "quantity": 2
    }
  ]
}
```

Success response:

- Status: `201 Created`
- Body: `{ "data": GroceryList }`

### 10.2 Read list

```http
GET /api/lists/{uuid}
```

Success response:

- Status: `200 OK`
- Body: `{ "data": GroceryList }`

### 10.3 Update list

```http
PUT /api/lists/{uuid}
```

Success response:

- Status: `200 OK`
- Body: `{ "data": GroceryList }`

### 10.4 Validation rules

- `name`: required string, maximum 120
- `budget`: required numeric, minimum 0
- `items`: required array
- `items.*.id`: required UUID
- `items.*.name`: required string, maximum 160
- `items.*.price`: required numeric, minimum 0
- `items.*.quantity`: required integer, minimum 1

Laravel's standard JSON validation response is acceptable for the MVP.

## 11. Functional requirements

### FR-001: Name a list

The user can edit the list name. Blank names cannot be saved.

### FR-002: Set a budget

The user can enter a USD budget with decimal precision. Negative budgets are blocked or corrected.

### FR-003: Add an item

The user can add an item using an actual form. Pressing Enter submits when the data is valid.

### FR-004: Generate item identity

The frontend generates a UUID for every new item. Array indexes are never used as identity or Vue keys.

### FR-005: Calculate line totals

Each row displays `unit price × quantity`.

### FR-006: Calculate the list total

The total updates immediately after adding, deleting, or changing the quantity of an item.

### FR-007: Communicate budget status

The user sees the remaining amount or the over-budget amount. Over-budget status includes explicit text and a visual treatment.

### FR-008: Update quantity

The user can increase, decrease, or type the quantity. Quantity cannot fall below one.

### FR-009: Delete an item

The delete action removes the item identified by UUID and recalculates totals.

### FR-010: Save a new list

Saving an unsaved list creates one backend record and assigns the returned UUID to frontend state.

### FR-011: Update a saved list

Saving a list that already has an ID updates the existing backend record rather than creating another record.

### FR-012: Restore a saved list

Opening `/list/:uuid` loads the saved list and reconstructs its total from item data.

### FR-013: Share a saved list

A saved list exposes a copy-link control and warns that anyone with the link can open and edit it.

### FR-014: Handle invalid URLs

A missing or invalid UUID shows an understandable error and a route to create a new list. The application does not silently redirect.

### FR-015: Preserve work after API failure

A failed save or load request shows an error. A failed save must not clear or replace the currently visible list.

## 12. Non-functional requirements

### NFR-001: Responsive layout

The primary flow must work without horizontal scrolling at approximately 360, 768, and 1280 pixel widths.

### NFR-002: Accessibility baseline

- Use native form and button behavior through Vuetify components.
- Keep visible field labels.
- Preserve keyboard access and focus indicators.
- Add accessible labels to icon-only controls.
- Use text as well as colour for budget and validation states.

### NFR-003: Feedback

- Show loading state while fetching a list.
- Show saving state while saving.
- Prevent duplicate save submissions.
- Show save success through a temporary snackbar.
- Show failures through an error alert.

### NFR-004: Maintainability

- Keep API calls out of presentational components.
- Keep reusable row, form, stepper, and summary behavior in focused components.
- Do not add architectural layers that the MVP does not require.

### NFR-005: Browser capabilities

The application may rely on modern browser support for `crypto.randomUUID()` and `navigator.clipboard`.

## 13. Security and privacy statement

Basket Case v0.0.1 has no authentication or authorization.

A UUID provides difficult-to-guess addressing, but it is not a security boundary. Anyone who receives the URL can retrieve and update the list. The interface must say:

> Anyone with this link can open and edit this list.

The application must not call a list private, protected, or secure.

## 14. UX states

### New empty list

- Default list name appears.
- Default budget is available.
- Empty-state guidance prompts the user to add the first item.
- Share control is hidden.

### New populated list

- Items and totals update locally.
- Primary action says `Save list`.

### Saved list

- URL contains the UUID.
- Primary action says `Save changes`.
- Share control is visible.

### Loading list

- A progress indicator is visible.
- Stale data from another route must not be presented as the requested list.

### Saving

- Save control shows a loading state and cannot submit repeatedly.

### Save success

- A temporary `List saved.` message appears.

### Over budget

- Total and over-budget amount are visible.
- An error-toned treatment and explicit warning text appear.
- A brief threshold pulse may occur when crossing from within budget to over budget.

### API failure

- An error message appears.
- Current editable data remains intact after a failed save.

### Invalid list URL

- The interface says the list could not be loaded.
- A `Create a new list` action is available.

## 15. Delivery plan

### Phase 0: Establish the project

**Outcome:** Runnable Vue and Laravel applications with required dependencies, SQLite, CORS, and file structure.

**User story:** As a developer, I need a verified frontend and backend foundation so feature work begins from a known working state.

**Completion criteria:**

- Laravel runs at `http://localhost:8000`.
- Vue runs at `http://localhost:5173`.
- Vuetify renders.
- Pinia and Vue Router are registered.
- SQLite migrations run.
- One configurable API base URL exists.

### Phase 1: Create the Laravel data model

**Outcome:** One UUID-addressable grocery-list record can store name, budget, and item JSON.

**User story:** As a user, I need my entire grocery list stored so it can be reopened later.

**Completion criteria:**

- `grocery_lists` exists.
- Laravel generates list UUIDs.
- Budget and item casts are configured.
- No relational item table is introduced.
- Until the full UI phase replaces it, the frontend visibly renders `Welcome to Basket Case!` when running `yarn dev`.

### Phase 2: Build core Vue state

**Outcome:** Pinia manages list state, item mutations, and budget calculations.

**User story:** As a shopper, I need immediate local updates while editing my list.

**Completion criteria:**

- Types exist.
- Items can be added, removed, and updated.
- Totals and budget differences are derived correctly.
- Loaded API data can replace store state.

### Phase 3: Build the single-screen interface

**Outcome:** The entire grocery budgeting interaction works locally without Laravel.

**User story:** As a shopper, I can build and adjust a list and understand its budget impact immediately.

**Completion criteria:**

- Name and budget inputs work.
- Add-item form validates and submits.
- Quantity stepper prevents values below one.
- Rows show unit price, quantity, line total, and delete action.
- Empty and over-budget states are visible.
- Focus returns to item-name input after adding.

### Phase 4: Build the Laravel API

**Outcome:** Create, read, and update endpoints persist valid lists.

**User story:** As a user, I need the backend to save and return my list reliably.

**Completion criteria:**

- `POST`, `GET`, and `PUT` routes work.
- Requests are validated.
- Create returns `201` and a UUID.
- Invalid data returns validation errors.

### Phase 5: Connect Vue to Laravel

**Outcome:** The interface creates and updates persisted lists and reports failures.

**User story:** As a user, I can save my current work without losing it when a request fails.

**Completion criteria:**

- API module implements create, read, and update functions.
- Store save and load actions manage flags and errors.
- Save button reflects new versus existing list state.
- Failed saves preserve the current UI state.

### Phase 6: Add UUID routing and sharing

**Outcome:** Saved lists have reloadable, editable, copyable URLs.

**User story:** As a user, I can reopen and share a saved grocery list through its URL.

**Completion criteria:**

- Both routes use the same view.
- Saved route loads by UUID.
- First save replaces the current route.
- Copy-link feedback works.
- Sharing warning is visible.
- Invalid URLs show an error rather than redirecting silently.

### Phase 7: Validation and visual polish

**Outcome:** The MVP prevents obvious errors and remains usable on mobile and desktop.

**User story:** As a shopper, I need clear validation, accessible controls, and a layout that works on my device.

**Completion criteria:**

- Invalid list state disables save.
- Layout is verified at target widths.
- Icon buttons have accessible names.
- Save success and failure are visible.
- Duplicate save requests are prevented.

### Phase 8: Manual end-to-end verification

**Outcome:** The complete user journey is verified before releasing v0.0.1.

**User story:** As the product owner, I need evidence that the MVP works from list creation through sharing and error recovery.

**Completion criteria:**

- New-list calculations pass.
- Budget warning transitions pass.
- Deletion identity behavior passes.
- Create, reload, update, and share flows pass.
- API outage recovery passes.

## 16. Manual acceptance test suite

### AT-001: New list calculation

1. Open `/`.
2. Change the list name.
3. Set the budget to `$100`.
4. Add a `$10` item with quantity `2`.

Expected:

- Line total is `$20`.
- Total is `$20`.
- Remaining amount is `$80`.

### AT-002: Budget warning

Add an item that takes the total above `$100`, then reduce its quantity.

Expected:

- Correct over-budget amount appears.
- Warning disappears when the total returns within budget.

### AT-003: Stable deletion

Add three items and delete the middle item.

Expected:

- Only the selected UUID item is removed.
- Neighboring rows retain their correct state.
- Total recalculates.

### AT-004: Create and route

Save a new list.

Expected:

- Saving state appears.
- URL changes to `/list/{uuid}`.
- Success feedback appears.

### AT-005: Reload

Refresh a saved-list URL.

Expected:

- Name, budget, items, quantities, and totals are restored.

### AT-006: Update

Change a quantity, save changes, and refresh.

Expected:

- The same list record contains the new quantity.

### AT-007: Share

Copy the link and open it in a private browser window.

Expected:

- The list loads.
- A change saved from one window is visible in the other after refresh.
- Real-time synchronization is not expected.

### AT-008: Save failure

Stop Laravel and attempt to save.

Expected:

- Error feedback appears.
- Current items remain visible and editable.
- Saving succeeds after Laravel restarts.

## 17. Release definition of done

Basket Case v0.0.1 is complete only when:

- The application renders one grocery-list screen.
- A user can name a list and set a budget.
- A user can add, delete, and change quantities for items.
- Line totals and overall totals update immediately.
- Remaining and over-budget amounts are correct.
- Budget threshold crossing produces visible feedback.
- Laravel stores a complete list in one record.
- New lists receive UUIDs.
- Saved URLs reload the correct record.
- Existing lists can be updated.
- Saved URLs can be copied and shared.
- API failures do not erase visible list data.
- Invalid URLs show a clear recovery path.
- Desktop and mobile use are acceptable.
- Every Phase 8 acceptance test passes or has a documented, accepted exception.

Anything beyond these conditions belongs to a later release.

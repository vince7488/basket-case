# Basket Case Delivery Workflow

## 1. Work hierarchy

Basket Case uses four planning levels:

1. **Release epic** – the complete version objective, currently v0.0.1.
2. **Phase issue** – a coherent delivery stage with a clear outcome and dependency order.
3. **User story** – the user or developer capability delivered within that phase.
4. **Technical tasks** – concrete implementation steps represented as checkboxes inside the phase issue.

For this MVP, user stories and technical tasks stay inside phase issues. This keeps GitHub Projects readable and avoids creating dozens of tiny issues for a three-hour build.

Create separate story issues later only when a story becomes too large for one focused pull request.

## 2. GitHub Projects fields

Recommended Project 3 fields:

| Field | Values |
|---|---|
| Status | Backlog, Ready, In progress, In review, Done |
| Release | v0.0.1, v0.0.2, Later |
| Phase | 0 through 8 |
| Type | Epic, Phase, Story, Bug, Decision |
| Priority | P0, P1, P2 |
| Effort | XS, S, M, L |

Recommended v0.0.1 ordering:

```text
Epic
Phase 0
Phase 1
Phase 2
Phase 3
Phase 4
Phase 5
Phase 6
Phase 7
Phase 8
```

## 3. Issue readiness rule

A phase is Ready only when:

- Its dependency phases are complete.
- Its user story and outcome are clear.
- Its technical checklist is defined.
- Its acceptance criteria are testable.
- No unresolved product decision blocks implementation.

## 4. Branch strategy

Use `main` as the protected integration branch.

Create one short-lived branch per phase or independently reviewable story:

```text
phase/0-project-foundation
phase/1-laravel-data-model
story/add-item-form
fix/invalid-list-recovery
```

Do not implement multiple unrelated phases in one branch.

## 5. ChatGPT implementation prompt

Use a prompt shaped like this:

```text
Use GitHub issue #<number> in vince7488/basket-case as the complete scope.
Read AGENTS.md and docs/PROJECT_SPEC.md first.
Implement only that issue on a new branch.
Run the relevant checks.
Open a draft pull request with Closes #<number>.
Report anything you could not verify.
```

For planning or review without code changes:

```text
Read issue #<number>, AGENTS.md, and docs/PROJECT_SPEC.md.
Tell me the implementation sequence, affected files, risks, and acceptance-test plan.
Do not change the repository yet.
```

## 6. Commit conventions

Preferred commit forms:

```text
chore: establish Vue and Laravel workspaces
feat: add grocery list state and calculations
feat: persist lists through Laravel API
fix: preserve list after failed save
refactor: extract quantity stepper component
docs: update MVP acceptance criteria
```

Commits should describe one meaningful change and avoid unrelated cleanup.

## 7. Pull request requirements

Each pull request should contain:

- Summary of the delivered capability
- Referenced issue using `Closes #<number>`
- Files or subsystems changed
- Acceptance criteria satisfied
- Commands and checks run
- Screenshots for meaningful interface changes
- Known limitations or manual verification still required

A pull request should not expand scope beyond its issue. Any newly discovered feature request becomes a new issue or later-release note.

## 8. Review checklist

Before merging:

- The change matches the issue and project specification.
- Deferred features were not added.
- User-entered data survives save failures.
- UUIDs, not indexes, identify items.
- Currency calculations are correct for expected MVP input.
- Validation handles blank names, negative values, and quantities below one.
- Keyboard and mobile behavior remain usable.
- Error, loading, saving, and success states are visible.
- The author reports the checks actually run.

## 9. Phase completion rule

A phase can move to Done when:

- All technical task checkboxes are complete.
- All acceptance criteria are verified.
- The associated pull request is merged.
- Any deferred or failed verification is recorded in a follow-up issue.

## 10. Release completion rule

The v0.0.1 epic can close only after:

- Phases 0 through 8 are Done.
- The full manual acceptance suite passes.
- The release definition of done in `docs/PROJECT_SPEC.md` is satisfied.
- Known limitations match the documented v0.0.1 exclusions.

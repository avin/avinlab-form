---
name: avinlab-form
description: Build, change, debug, or review TypeScript forms with the current @avinlab/form 0.5 and @avinlab/react-form 0.5 APIs. Use for form controllers, readonly value snapshots, field or form subscriptions, React form hooks, synchronous validation, generated controlled components, SSR behavior, or performance-sensitive watchers. Apply when either package is imported, installed, or being considered; use another approach for unrelated form libraries.
---

# Avinlab Form

Use the current 0.5 contract: treat the form as a stable controller whose readonly snapshots change only through explicit commits.

## Workflow

1. Identify whether the task uses the framework-independent or React package.
2. Read the smallest relevant 0.5 reference:
   - Core controller, snapshots, updates, and subscriptions: [references/core.md](references/core.md)
   - Core and React validation: [references/validation.md](references/validation.md)
   - React creation, synchronization, watchers, SSR, and lifecycle: [references/react.md](references/react.md)
   - Component-library bindings with `createFormComponent`: [references/generated-controls.md](references/generated-controls.md)
3. Inspect the current branch declarations or local exports when exact signatures matter. Treat the current branch as authoritative for the 0.5 API.
4. Use public exports from `@avinlab/form` and `@avinlab/react-form`. Preserve the library's stable-controller, readonly-snapshot, and explicit-update model.
5. Keep subscriptions and derived validation owned by the layer that creates them. Release disposer-based core subscriptions and core validation controllers at the end of that owner's lifetime.
6. Verify the result with the consumer project's focused typecheck and tests. In this source repository, run the narrowest package or example command before broader root checks.

## Source-repository routing

When working in the avinlab-form repository, consult these canonical sources for details that may have changed:

- Core contract: `packages/form/README.md`
- React contract: `packages/react-form/README.md`
- Compiled usage examples: `examples/react/src/examples/`
- Public type assertions: `type-tests/public-contracts.ts`

Complete the task only when every read of changing form data has an intentional reactive or imperative path, every update uses a controller method, validation distinguishes `unvalidated` from `valid`, and lifecycle cleanup matches ownership.

# avinlab-form

A form is one stable mutable controller for its lifetime. Updates replace its readonly value
snapshots; they never replace the controller. React rendering is deliberately opt-in through the
narrowest watcher or validation selector a component needs.

- [`@avinlab/form`](./packages/form/README.md) — framework-independent controller and synchronous
  validation.
- [`@avinlab/react-form`](./packages/react-form/README.md) — React creation, watchers, validation
  selectors, and generated controlled components.
- [Migration notes](./MIGRATION.md) — equality, readonly snapshots, and subscription changes.
- [Compiled recipes](./examples/react/src/documentationRecipes.tsx) — copyable TypeScript examples
  checked by the example application's strict configuration.

The performance contract is expressed as deterministic behavior: one notification cycle per real
commit, no notification for a no-op, one whole-form watcher update per commit, and field-level
watchers that ignore unrelated fields. The project does not claim general timing or memory
improvements beyond these guarantees.

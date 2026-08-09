# 08 — Executable documentation and examples

**What to build:** Give new and existing consumers one accurate mental model and copyable recipes that demonstrate stable controller identity, readonly snapshots, selective rendering, validation lifecycle, and supported component bindings.

**Blocked by:** 03 — Deterministic reentrant updates; 06 — Render-safe validation hooks and selectors; 07 — Type-safe form component bindings.

**Status:** ready-for-agent

- [ ] Package documentation begins with the stable mutable controller and readonly snapshot mental model.
- [ ] Documentation explicitly states that form mutation does not itself rerender React and that reactivity is opt-in through the narrowest suitable watcher or selector.
- [ ] The contract covers equality, no-ops, `prevValues`, notification order, reentrancy, listener failures, unsubscribe lifecycle, and immutable nested values.
- [ ] React documentation explains one-time initial values, dependency-array safety, whole-form versus field watching, server behavior, and source switching.
- [ ] Validation documentation explains synchronous timing, disposal, validator changes, complete validation results, field-error readers, and validity readers.
- [ ] Recipes distinguish uncontrolled inputs, generated controlled components, field watchers, whole-form watchers, and validation selectors.
- [ ] The broken age example is corrected with the intended field, error, and numeric conversion.
- [ ] The example application declares every directly imported package and passes strict TypeScript checking.
- [ ] Documentation examples are executable or compiled so field names, types, and exports cannot drift.
- [ ] Migration notes describe readonly types, `Object.is`, reference replacement, `NaN`, `-0`, subscription migration, and unsupported direct nested mutation.
- [ ] Performance language states deterministic notification and render guarantees rather than unsupported general optimization claims.


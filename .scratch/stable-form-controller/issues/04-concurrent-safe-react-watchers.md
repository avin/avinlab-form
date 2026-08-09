# 04 — Concurrent-safe React watchers

**What to build:** Adapt the stable form controller to React's external-store contract so whole-form and field consumers always render the correct snapshot without causing the form owner or unrelated fields to rerender.

**Blocked by:** 02 — Lifecycle-safe subscriptions.

**Status:** ready-for-agent

- [ ] `useForm` continues to create one stable controller and does not subscribe its owner to form values.
- [ ] Whole-form and per-field watchers use React's external-store mechanism rather than a render-time state snapshot followed by an effect subscription.
- [ ] React 17 compatibility is retained through the supported external-store shim, or an explicit semver decision documents a peer requirement change before implementation lands.
- [ ] A field watcher does not rerender for updates to another field and rerenders exactly once for a real selected-field change.
- [ ] A whole-form watcher rerenders exactly once per successful commit and not for a no-op.
- [ ] Switching the selected field returns the new field's current value immediately.
- [ ] Switching the form source unsubscribes the old source and immediately returns the new source's current snapshot.
- [ ] Updates around render and commit are not missed and do not produce tearing.
- [ ] A defined server snapshot supports server rendering and hydration-compatible initial output.
- [ ] Strict Mode and render-count tests verify identity, dependency-array safety, cleanup, source switching, field isolation, and whole-form behavior through public React exports.


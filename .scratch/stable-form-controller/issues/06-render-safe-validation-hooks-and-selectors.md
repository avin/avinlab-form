# 06 — Render-safe validation hooks and selectors

**What to build:** Integrate validation with React without externally visible side effects during render and let consumers subscribe to only the validation information they display.

**Blocked by:** 04 — Concurrent-safe React watchers; 05 — Disposable validation controller.

**Status:** ready-for-agent

- [ ] Rendering a validation hook does not attach a lasting form subscription or mutate a shared validation controller before commit.
- [ ] Commit attaches the required subscriptions and cleanup removes both React-facing and underlying form subscriptions.
- [ ] Strict Mode, repeated mount/unmount, and abandoned render scenarios do not accumulate validators or execute stale callbacks.
- [ ] Changing the form source disconnects the old validation controller and exposes validation for the new form.
- [ ] Changing the validator recalculates current committed values without retaining an obsolete closure.
- [ ] A public field-error reader rerenders only when its selected error changes.
- [ ] A public validity reader rerenders only when overall validity changes.
- [ ] The existing complete validation result remains available for consumers intentionally subscribing at form scope.
- [ ] Public React tests measure render counts, cleanup, source and validator switching, unchanged errors, Strict Mode behavior, and selector isolation.


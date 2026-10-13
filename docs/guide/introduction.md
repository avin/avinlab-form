# Introduction

avinlab-form is a pair of small packages for form state:

| Package | Use it for |
| --- | --- |
| `@avinlab/form` | Framework-independent controller, subscriptions, and synchronous validation. |
| `@avinlab/react-form` | React 18+ hooks and an optional helper for generated controlled components. |

## Mental model

A form is **one stable controller** for its lifetime. Its `values` and `prevValues` are
**readonly snapshots** that are replaced on every real commit.

- Mutate only through `form.setValue(name, value)` and `form.setValues(values)`.
- Read `form.values` imperatively and synchronously in handlers and commands.
- Mutating the form does **not** rerender React by itself. Reactivity is opt-in: use
  `useFormWatch` next to the output that needs the data.
- Updates compare top-level fields with `Object.is`. A no-op keeps both snapshot references and
  sends no notification.

## What it deliberately does not do

- No async validation: validators are synchronous and run during the commit.
- No deep cloning or deep freezing: snapshots are shallow. Replace nested values instead of
  mutating them.
- No provider or context of its own. Pass the `form` (or a validation result) through ordinary
  props or your own context.

## Verified performance contract

The documented guarantees are limited to behaviour covered by tests: one notification cycle per
real commit, no notification for a no-op, one whole-form watcher update per commit, one validation
call per mounted validation hook per commit, and no selected-field render for unrelated fields. No
broader timing, memory, or bundle claim is made.

Next: [Getting started](/guide/getting-started).

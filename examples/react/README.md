# React example catalog

An interactive, progressive reference for `@avinlab/form` and `@avinlab/react-form`. Each card
demonstrates one technique and imports its own source with Vite's `?raw` query, so the code shown in
the browser is exactly the code being executed.

The catalog moves from common to rare cases:

1. controlled and uncontrolled fields, snapshots, reset, and validation;
2. React composition, generated controls, external synchronization, and render isolation;
3. field and form subscriptions, cleanup, and previous snapshots;
4. nested values, dynamic watchers, core controllers, validation lifecycle, and no-op semantics.

Every runnable example lives in [`src/examples`](./src/examples). Shared code is limited to the
catalog card and page shell; examples do not depend on one another.

Run it from the repository root:

```sh
npm run dev --workspace example-react
```

Verify every example with strict TypeScript and a production build:

```sh
npm run typecheck --workspace example-react
npm run build --workspace example-react
```

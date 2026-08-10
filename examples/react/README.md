# React example catalog

An interactive, progressive reference for `@avinlab/form` and `@avinlab/react-form`. Each card
demonstrates one technique and imports its own source with Vite's `?raw` query, so the code shown in
the browser is exactly the code being executed.

The catalog is one list ordered by practical importance: everyday field binding, validation, and
synchronization come first; specialized subscriptions and core-controller lifecycle techniques come
last. Every card has topical tags. Selecting several tags uses intersection matching, so a card must
have every selected tag to remain visible.

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

# React example

This application demonstrates uncontrolled inputs, generated controlled inputs, field and
whole-form watchers and one complete synchronous validation result for
`@avinlab/react-form`.

Every package imported directly by the source is declared in this workspace. The application and
the documentation recipes in [`src/documentationRecipes.tsx`](./src/documentationRecipes.tsx) are
checked with strict TypeScript:

```sh
npm run typecheck --workspace example-react
```

The quick-start and migration recipes also compile against the built package-root declarations,
and the core migration recipe executes its runtime assertions:

```sh
npm run build
npm run check:documentation --workspace example-react
```

Run the interactive application from the repository root:

```sh
npm run dev --workspace example-react
```

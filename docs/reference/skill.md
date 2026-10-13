# Agent skill

Both packages ship an `avinlab-form` skill that helps coding agents (Cursor, Claude Code, and
others that read skill folders) build, change, and review forms with the current API.

## Install

```sh
npx avinlab-form install-skills
```

Choose a different agent's skill directory with `--target`:

```sh
npx avinlab-form install-skills --target .claude/skills
```

The default destination is `.agents/skills`. Installation **refuses to overwrite** an existing
skill, so remove the old copy first when updating.

The command is available once `@avinlab/form` or `@avinlab/react-form` is a direct dependency of
your project.

## What it covers

- The core controller, snapshots, and subscriptions
- Synchronous validation in core and React
- React hooks, synchronization, SSR, and performance contract
- Generated controlled components

## Installing by hand

The skill is self-contained. Copy `node_modules/@avinlab/react-form/skills/avinlab-form` (or the
same path under `@avinlab/form`) into your project's skill directory.

## Example prompts

- "Add a profile form with validation using `@avinlab/react-form`."
- "Why does this component rerender on every keystroke? Narrow the watchers."
- "Wrap our `Select` component with `createFormComponent`."

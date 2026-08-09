# 09 — Published-package release gates

**What to build:** Make the default release checks verify the same artifacts and usage modes that package consumers receive, regardless of whether lint, test, example, or build commands run first.

**Blocked by:** 08 — Executable documentation and examples.

**Status:** ready-for-agent

- [ ] Lint targets source and configuration inputs and ignores all generated distributions, coverage, and temporary consumer artifacts.
- [ ] Running quality commands before or after builds produces the same result.
- [ ] Strict TypeScript checking includes both packages, the example application, documentation examples, and public compile-time contract tests.
- [ ] Package builds emit only declared public entry points unless a deliberate subpath export is added.
- [ ] Temporary consumers install packed tarballs rather than importing workspace source directly.
- [ ] Packed-consumer tests cover ESM import, CommonJS require, modern Node and bundler TypeScript resolution, React peers, and unavailable undeclared deep imports.
- [ ] The release command runs source lint, type checking, behavioral tests, production builds, documentation/example checks, and packed-consumer tests.
- [ ] Package descriptions, repository, homepage, issue links, license information, and files included in the tarball are complete and verified.
- [ ] The final gate verifies stable form identity and selective React render guarantees through published package exports.


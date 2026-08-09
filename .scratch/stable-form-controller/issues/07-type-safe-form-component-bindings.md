# 07 — Type-safe form component bindings

**What to build:** Make generated form controls preserve field-level render isolation while rejecting invalid field-to-component bindings during type checking and supporting the configurable value and change attributes already promised by the interface.

**Blocked by:** 04 — Concurrent-safe React watchers.

**Status:** ready-for-agent

- [ ] A generated control subscribes only to its selected field and does not rerender for unrelated field changes.
- [ ] The selected field's value type is connected to the configured component value property and extractor result.
- [ ] Configured value and change attribute names are represented in the public generic type rather than assuming `value` and `onChange`.
- [ ] Event and extraction types do not fall back to unbounded `any` in normal typed use.
- [ ] Props owned by the generated binding are omitted from consumer-supplied props for the configured attribute names.
- [ ] Empty-string and supported numeric field keys update correctly rather than being rejected by truthiness checks.
- [ ] Runtime tests cover text, checkbox-style, custom attribute, custom extractor, falsy-key, and selective-render scenarios.
- [ ] Compile-time tests reject mismatched field values and conflicting bound props while accepting valid custom controls.


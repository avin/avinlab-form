const assert = require('node:assert/strict');
const { createForm } = require('@avinlab/form');
const { useForm, useFormWatch } = require('@avinlab/react-form');

const form = createForm({ name: 'Ada' });
assert.equal(form.values.name, 'Ada');
assert.equal(typeof useForm, 'function');
assert.equal(typeof useFormWatch, 'function');
assert.throws(
  () => require('@avinlab/form/dist/index.cjs'),
  (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
);

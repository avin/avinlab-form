const assert = require('node:assert/strict');
const formPackage = require('@avinlab/form');
const reactFormPackage = require('@avinlab/react-form');
const { createForm } = formPackage;
const { useForm, useFormWatch } = reactFormPackage;

assert.deepEqual(Object.keys(formPackage).sort(), ['createForm', 'createFormValidation']);
assert.deepEqual(Object.keys(reactFormPackage).sort(), [
  'createFormComponent',
  'useForm',
  'useFormValidation',
  'useFormWatch',
]);

const form = createForm({ name: 'Ada' });
assert.equal(form.values.name, 'Ada');
assert.equal(typeof useForm, 'function');
assert.equal(typeof useFormWatch, 'function');
assert.throws(
  () => require('@avinlab/form/dist/index.cjs'),
  (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
);

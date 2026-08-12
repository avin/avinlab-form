import assert from 'node:assert/strict';
import * as FormPackage from '@avinlab/form';
import * as ReactFormPackage from '@avinlab/react-form';
import { createForm, createFormValidation } from '@avinlab/form';
import { useForm, useFormWatch } from '@avinlab/react-form';

const form = createForm({ name: 'Ada' });
assert.deepEqual(Object.keys(FormPackage).sort(), ['createForm', 'createFormValidation']);
assert.deepEqual(Object.keys(ReactFormPackage).sort(), [
  'createFormComponent',
  'useForm',
  'useFormValidation',
  'useFormWatch',
]);
assert.equal(form.values.name, 'Ada');
const snapshots = [];
const validation = createFormValidation(form, (values) =>
  values.name.length >= 4 ? {} : { name: 'Use at least four characters' },
);
const unsubscribeValidation = validation.subscribe((result) => snapshots.push(result));
assert.deepEqual(validation.result, {
  status: 'invalid',
  errors: { name: 'Use at least four characters' },
});
form.setValue('name', 'Grace');
assert.deepEqual(form.values, { name: 'Grace' });
assert.deepEqual(validation.result, { status: 'valid', errors: {} });
assert.deepEqual(snapshots, [{ status: 'valid', errors: {} }]);
unsubscribeValidation();
validation.dispose();
assert.equal(typeof useForm, 'function');
assert.equal(typeof useFormWatch, 'function');
await assert.rejects(
  () => import('@avinlab/form/dist/index.js'),
  (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
);

import assert from 'node:assert/strict';
import { createForm } from '@avinlab/form';
import { useForm, useFormWatch } from '@avinlab/react-form';

const form = createForm({ name: 'Ada' });
assert.equal(form.values.name, 'Ada');
assert.equal(typeof useForm, 'function');
assert.equal(typeof useFormWatch, 'function');
await assert.rejects(
  () => import('@avinlab/form/dist/index.js'),
  (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
);

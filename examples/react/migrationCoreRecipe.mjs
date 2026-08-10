import assert from 'node:assert/strict';
import { createForm, createFormValidation } from '@avinlab/form';

const form = createForm({ name: '', accepted: false });
const formResults = [];
const validationResults = [];
const unsubscribeForm = form.subscribe((values, previousValues) => {
  formResults.push({ values, previousValues });
});
const validation = createFormValidation(form, (values) => ({
  name: values.name ? undefined : 'Name is required',
}));
const unsubscribeValidation = validation.subscribe((result) => {
  validationResults.push(result);
});

assert.deepEqual(validation.result, {
  status: 'invalid',
  errors: { name: 'Name is required' },
});

form.setValue('name', 'Ada');
assert.deepEqual(formResults, [
  {
    values: { name: 'Ada', accepted: false },
    previousValues: { name: '', accepted: false },
  },
]);
assert.deepEqual(validation.result, { status: 'valid', errors: {} });

validation.setValidator((values) => ({
  name: values.name.length >= 4 ? undefined : 'Use at least four characters',
}));
assert.deepEqual(validation.result, {
  status: 'invalid',
  errors: { name: 'Use at least four characters' },
});

unsubscribeValidation();
unsubscribeForm();
validation.dispose();

const validationResultAfterCleanup = validation.result;
form.setValue('name', 'Grace');
assert.equal(validation.result, validationResultAfterCleanup);
assert.equal(formResults.length, 1);
assert.equal(validationResults.length, 2);

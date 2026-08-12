import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

const dom = new JSDOM('<div id="root"></div>');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.window = dom.window;

let controller;
let stableController;
let ownerRenders = 0;
let nameRenders = 0;
let ageRenders = 0;
let validationResult;
const validateName = (values) =>
  values.name.length >= 4 ? {} : { name: 'Use at least four characters' };

function NameWatcher() {
  nameRenders += 1;
  useFormWatch(controller, 'name');
  return null;
}

function AgeWatcher() {
  ageRenders += 1;
  useFormWatch(controller, 'age');
  return null;
}

function ValidationReader() {
  validationResult = useFormValidation(controller, validateName);
  return null;
}

function Owner() {
  ownerRenders += 1;
  controller = useForm({ age: 36, name: 'Ada' });
  stableController ??= controller;
  assert.equal(controller, stableController);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(NameWatcher),
    React.createElement(AgeWatcher),
    React.createElement(ValidationReader),
  );
}

const root = createRoot(document.getElementById('root'));
await act(async () => root.render(React.createElement(Owner)));
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 1, 1]);
assert.deepEqual(validationResult, {
  status: 'invalid',
  errors: { name: 'Use at least four characters' },
});

await act(async () => controller.setValue('age', 37));
assert.equal(controller, stableController);
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 1, 2]);

await act(async () => controller.setValue('name', 'Grace'));
assert.equal(controller, stableController);
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 2, 2]);
assert.deepEqual(validationResult, { status: 'valid', errors: {} });

await act(async () => root.unmount());

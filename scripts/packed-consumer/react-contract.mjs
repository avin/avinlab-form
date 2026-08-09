import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useForm, useFormWatch } from '@avinlab/react-form';

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
  );
}

const root = createRoot(document.getElementById('root'));
await act(async () => root.render(React.createElement(Owner)));
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 1, 1]);

await act(async () => controller.setValue('age', 37));
assert.equal(controller, stableController);
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 1, 2]);

await act(async () => controller.setValue('name', 'Grace'));
assert.equal(controller, stableController);
assert.deepEqual([ownerRenders, nameRenders, ageRenders], [1, 2, 2]);

await act(async () => root.unmount());

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createForm } from './index';
import type { Form } from './index';

describe('createForm', () => {
  let form: Form<{ name: string; age: number }>;
  const initialValues = { name: 'John', age: 30 };

  beforeEach(() => {
    form = createForm(initialValues);
  });

  it('should initialize form values correctly', () => {
    expect(form.values).toEqual(initialValues);
  });

  it('should update form values and call update handlers', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.setValue('name', 'Jane');

    expect(form.values.name).toBe('Jane');
    expect(updateHandler).toHaveBeenCalledWith({ ...initialValues, name: 'Jane' }, initialValues);
  });

  it('should not call update handlers if value is the same', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.setValue('name', 'John'); // same as initial value

    expect(updateHandler).not.toHaveBeenCalled();
  });

  it('should call field-specific update handlers', () => {
    const fieldUpdateHandler = vi.fn();
    form.onUpdateField('age', fieldUpdateHandler);
    form.setValue('age', 31);

    expect(fieldUpdateHandler).toHaveBeenCalledWith(31, 30);
  });

  it('should call field-specific update handlers and full update handlers on update all form values', () => {
    const ageUpdateHandler = vi.fn();
    const nameUpdateHandler = vi.fn();
    const fullFormUpdateHandler = vi.fn();
    form.onUpdateField('age', ageUpdateHandler);
    form.onUpdateField('name', nameUpdateHandler);
    form.onUpdate(fullFormUpdateHandler);

    form.setValues({ ...initialValues, age: 31 });

    expect(ageUpdateHandler).toHaveBeenCalledWith(31, 30);
    expect(fullFormUpdateHandler).toHaveBeenCalledWith(
      { ...initialValues, age: 31 },
      initialValues,
    );
    expect(nameUpdateHandler).not.toHaveBeenCalled();
  });

  it('should not call any updates handlers if nothing changed', () => {
    const ageUpdateHandler = vi.fn();
    const nameUpdateHandler = vi.fn();
    const fullFormUpdateHandler = vi.fn();
    form.onUpdateField('age', ageUpdateHandler);
    form.onUpdateField('name', nameUpdateHandler);
    form.onUpdate(fullFormUpdateHandler);

    form.setValues({ ...initialValues });

    expect(ageUpdateHandler).not.toHaveBeenCalled();
    expect(fullFormUpdateHandler).not.toHaveBeenCalled();
    expect(nameUpdateHandler).not.toHaveBeenCalled();
  });

  it('should correctly remove update handlers', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.offUpdate(updateHandler);
    form.setValue('name', 'Jane');

    expect(updateHandler).not.toHaveBeenCalled();
  });

  it('should correctly remove field-specific update handlers', () => {
    const fieldUpdateHandler = vi.fn();
    form.onUpdateField('age', fieldUpdateHandler);
    form.offUpdateField('age', fieldUpdateHandler);
    form.setValue('age', 31);

    expect(fieldUpdateHandler).not.toHaveBeenCalled();
  });

  it('uses Object.is for field equality in both update methods', () => {
    const reference = { nested: true };
    const values = {
      primitive: 1,
      notANumber: Number.NaN,
      signedZero: 0,
      reference,
    };
    const objectIsForm = createForm(values);
    const updateHandler = vi.fn();
    objectIsForm.onUpdate(updateHandler);

    objectIsForm.setValue('notANumber', Number.NaN);
    objectIsForm.setValue('reference', reference);
    objectIsForm.setValues({ ...values });

    expect(updateHandler).not.toHaveBeenCalled();

    objectIsForm.setValue('signedZero', -0);

    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(Object.is(objectIsForm.values.signedZero, -0)).toBe(true);

    const replacementForm = createForm(values);
    const replacementUpdateHandler = vi.fn();
    replacementForm.onUpdate(replacementUpdateHandler);

    replacementForm.setValues({ ...values, signedZero: -0 });

    expect(replacementUpdateHandler).toHaveBeenCalledTimes(1);
    expect(Object.is(replacementForm.values.signedZero, -0)).toBe(true);
  });

  it('keeps both snapshots unchanged for no-op updates', () => {
    const currentSnapshot = form.values;
    const previousSnapshot = form.prevValues;
    const fieldUpdateHandler = vi.fn();
    const formUpdateHandler = vi.fn();
    form.onUpdateField('name', fieldUpdateHandler);
    form.onUpdate(formUpdateHandler);

    form.setValue('name', 'John');
    form.setValues({ ...initialValues });

    expect(form.values).toBe(currentSnapshot);
    expect(form.prevValues).toBe(previousSnapshot);
    expect(fieldUpdateHandler).not.toHaveBeenCalled();
    expect(formUpdateHandler).not.toHaveBeenCalled();
  });

  it('records the preceding committed snapshot', () => {
    const initialSnapshot = form.values;

    form.setValue('age', 31);
    const firstCommittedSnapshot = form.values;

    expect(form.prevValues).toBe(initialSnapshot);

    form.setValues({ name: 'Jane', age: 32 });

    expect(form.values).toEqual({ name: 'Jane', age: 32 });
    expect(form.prevValues).toBe(firstCommittedSnapshot);
  });

  it('notifies changed fields in snapshot order before one form notification', () => {
    const notifications: string[] = [];
    form.onUpdateField('name', () => notifications.push('field:name'));
    form.onUpdateField('age', () => notifications.push('field:age'));
    form.onUpdate(() => notifications.push('form'));

    form.setValues({ name: 'Jane', age: 31 });

    expect(notifications).toEqual(['field:name', 'field:age', 'form']);
  });

  it('notifies an optional field removed by full replacement', () => {
    const optionalForm = createForm<{ name?: string }>({ name: 'John' });
    const fieldUpdateHandler = vi.fn();
    optionalForm.onUpdateField('name', fieldUpdateHandler);

    optionalForm.setValues({});

    expect(fieldUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledWith(undefined, 'John');
  });

  it.each([
    ['object', { value: 1 }, { value: 1 }],
    ['array', [1], [1]],
    ['date', new Date(0), new Date(0)],
    ['map', new Map([['key', 'value']]), new Map([['key', 'value']])],
    ['set', new Set(['value']), new Set(['value'])],
  ])('treats %s fields as immutable references', (_name, initialReference, nextReference) => {
    const referenceForm = createForm({ field: initialReference });
    const updateHandler = vi.fn();
    referenceForm.onUpdate(updateHandler);
    const replacementForm = createForm({ field: initialReference });
    const replacementUpdateHandler = vi.fn();
    replacementForm.onUpdate(replacementUpdateHandler);

    referenceForm.setValue('field', initialReference);
    referenceForm.setValues({ field: initialReference });
    replacementForm.setValues({ field: initialReference });

    expect(updateHandler).not.toHaveBeenCalled();
    expect(replacementUpdateHandler).not.toHaveBeenCalled();

    referenceForm.setValue('field', nextReference);
    replacementForm.setValues({ field: nextReference });

    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(referenceForm.values.field).toBe(nextReference);
    expect(replacementUpdateHandler).toHaveBeenCalledTimes(1);
    expect(replacementForm.values.field).toBe(nextReference);
  });

  it('requires nested values to be replaced to produce a change', () => {
    const nested = { count: 1 };
    const nestedForm = createForm({ nested });
    const updateHandler = vi.fn();
    nestedForm.onUpdate(updateHandler);

    nested.count = 2;
    nestedForm.setValue('nested', nested);

    expect(updateHandler).not.toHaveBeenCalled();

    nestedForm.setValue('nested', { count: 2 });

    expect(updateHandler).toHaveBeenCalledTimes(1);
  });

  it('shallow-freezes current and previous snapshots in development', () => {
    expect(Object.isFrozen(form.values)).toBe(true);
    expect(Object.isFrozen(form.prevValues)).toBe(true);

    form.setValue('age', 31);

    expect(Object.isFrozen(form.values)).toBe(true);
    expect(Object.isFrozen(form.prevValues)).toBe(true);
  });

  it('exposes snapshots as readonly values', () => {
    const assertReadonlySnapshots = (readonlyForm: Form<{ name: string; age: number }>) => {
      // @ts-expect-error Form snapshots cannot be mutated directly.
      readonlyForm.values.name = 'Jane';
      // @ts-expect-error Previous form snapshots cannot be mutated directly.
      readonlyForm.prevValues.age = 31;
    };

    expect(assertReadonlySnapshots).toBeTypeOf('function');
    expect(form.values).toEqual(initialValues);
  });
});

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

  it('returns idempotent cleanup functions from preferred subscriptions', () => {
    const formUpdateHandler = vi.fn();
    const fieldUpdateHandler = vi.fn();
    const unsubscribeForm = form.subscribe(formUpdateHandler);
    const unsubscribeField = form.subscribeField('age', fieldUpdateHandler);

    form.setValue('age', 31);

    expect(formUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledOnce();

    unsubscribeForm();
    unsubscribeForm();
    unsubscribeField();
    unsubscribeField();
    form.setValue('age', 32);

    expect(formUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledOnce();
  });

  it('notifies the same callback once when it is registered repeatedly for one target', () => {
    const formUpdateHandler = vi.fn();
    const fieldUpdateHandler = vi.fn();
    form.subscribe(formUpdateHandler);
    form.subscribe(formUpdateHandler);
    form.subscribeField('age', fieldUpdateHandler);
    form.subscribeField('age', fieldUpdateHandler);

    form.setValue('age', 31);

    expect(formUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledOnce();
  });

  it('keeps legacy on/off methods compatible with preferred subscriptions', () => {
    const formUpdateHandler = vi.fn();
    const fieldUpdateHandler = vi.fn();
    form.onUpdate(formUpdateHandler);
    form.subscribe(formUpdateHandler);
    form.onUpdateField('age', fieldUpdateHandler);
    form.subscribeField('age', fieldUpdateHandler);

    form.setValue('age', 31);

    expect(formUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledOnce();

    form.offUpdate(formUpdateHandler);
    form.offUpdateField('age', fieldUpdateHandler);
    form.setValue('age', 32);

    expect(formUpdateHandler).toHaveBeenCalledOnce();
    expect(fieldUpdateHandler).toHaveBeenCalledOnce();
  });

  it('safely ignores cleanup of absent listeners', () => {
    const formUpdateHandler = vi.fn();
    const fieldUpdateHandler = vi.fn();

    expect(() => form.offUpdate(formUpdateHandler)).not.toThrow();
    expect(() => form.offUpdateField('age', fieldUpdateHandler)).not.toThrow();
  });

  it('supports prototype-like, empty, and numeric field keys', () => {
    const unusualForm = createForm({
      toString: 'old',
      constructor: 'old',
      ['__proto__']: 'old',
      '': 'old',
      0: 'old',
    });
    const toStringHandler = vi.fn();
    const constructorHandler = vi.fn();
    const protoHandler = vi.fn();
    const emptyHandler = vi.fn();
    const numericHandler = vi.fn();
    unusualForm.subscribeField('toString', toStringHandler);
    unusualForm.subscribeField('constructor', constructorHandler);
    unusualForm.subscribeField('__proto__', protoHandler);
    unusualForm.subscribeField('', emptyHandler);
    unusualForm.subscribeField(0, numericHandler);

    unusualForm.setValues({
      toString: 'new',
      constructor: 'new',
      ['__proto__']: 'new',
      '': 'new',
      0: 'new',
    });

    expect(toStringHandler).toHaveBeenCalledWith('new', 'old');
    expect(constructorHandler).toHaveBeenCalledWith('new', 'old');
    expect(protoHandler).toHaveBeenCalledWith('new', 'old');
    expect(emptyHandler).toHaveBeenCalledWith('new', 'old');
    expect(numericHandler).toHaveBeenCalledWith('new', 'old');
  });

  it('uses a listener snapshot when subscriptions change during dispatch', () => {
    const formNotifications: string[] = [];
    const addedFormHandler = () => formNotifications.push('added');
    const removedFormHandler = () => formNotifications.push('removed');
    let unsubscribeRemovedForm = () => {};
    form.subscribe(() => {
      formNotifications.push('first');
      unsubscribeRemovedForm();
      form.subscribe(addedFormHandler);
    });
    unsubscribeRemovedForm = form.subscribe(removedFormHandler);

    const fieldNotifications: string[] = [];
    const addedFieldHandler = () => fieldNotifications.push('added');
    const removedFieldHandler = () => fieldNotifications.push('removed');
    let unsubscribeRemovedField = () => {};
    form.subscribeField('age', () => {
      fieldNotifications.push('first');
      unsubscribeRemovedField();
      form.subscribeField('age', addedFieldHandler);
      unsubscribeRemovedForm();
      form.subscribe(addedFormHandler);
    });
    unsubscribeRemovedField = form.subscribeField('age', removedFieldHandler);

    form.setValue('age', 31);

    expect(fieldNotifications).toEqual(['first', 'removed']);
    expect(formNotifications).toEqual(['first', 'removed']);

    fieldNotifications.length = 0;
    formNotifications.length = 0;
    form.setValue('age', 32);

    expect(fieldNotifications).toEqual(['first', 'added']);
    expect(formNotifications).toEqual(['first', 'added']);
  });

  it('runs reentrant updates in FIFO order from the latest committed snapshot', () => {
    const queuedForm = createForm({ first: 0, second: 0, third: 0 });
    const notifications: string[] = [];
    const formatSnapshot = (values: typeof queuedForm.values) =>
      `${values.first},${values.second},${values.third}`;

    queuedForm.subscribeField('first', (newValue, oldValue) => {
      notifications.push(`field:first:${oldValue}->${newValue}`);

      if (newValue === 1) {
        queuedForm.setValue('second', 1);
        queuedForm.setValue('third', 1);
        queuedForm.setValue('second', 1);
      }
    });
    queuedForm.subscribeField('second', (newValue, oldValue) => {
      notifications.push(`field:second:${oldValue}->${newValue}`);
    });
    queuedForm.subscribeField('third', (newValue, oldValue) => {
      notifications.push(`field:third:${oldValue}->${newValue}`);
    });
    queuedForm.subscribe((values, prevValues) => {
      const transition = `form:${formatSnapshot(prevValues)}->${formatSnapshot(values)}`;

      notifications.push(`${transition};current:${formatSnapshot(queuedForm.values)}`);
    });

    queuedForm.setValue('first', 1);

    expect(notifications).toEqual([
      'field:first:0->1',
      'form:0,0,0->1,0,0;current:1,0,0',
      'field:second:0->1',
      'form:1,0,0->1,1,0;current:1,1,0',
      'field:third:0->1',
      'form:1,1,0->1,1,1;current:1,1,1',
    ]);
  });

  it('surfaces one listener failure after every listener observes the committed state', () => {
    const failingForm = createForm({ first: 0, second: 0 });
    const failure = new Error('first listener failed');
    const notifications: string[] = [];
    let thrown: unknown;

    failingForm.subscribeField('first', () => {
      notifications.push('field:first:failing');
      throw failure;
    });
    failingForm.subscribeField('first', () => {
      notifications.push('field:first:remaining');
    });
    failingForm.subscribeField('second', () => {
      notifications.push('field:second');
    });
    failingForm.subscribe((values, prevValues) => {
      notifications.push(
        `form:${prevValues.first},${prevValues.second}->${values.first},${values.second}`,
      );
    });

    try {
      failingForm.setValues({ first: 1, second: 1 });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBe(failure);
    expect({
      notifications,
      values: failingForm.values,
      prevValues: failingForm.prevValues,
    }).toEqual({
      notifications: [
        'field:first:failing',
        'field:first:remaining',
        'field:second',
        'form:0,0->1,1',
      ],
      values: { first: 1, second: 1 },
      prevValues: { first: 0, second: 0 },
    });
  });

  it('aggregates multiple listener failures after draining reentrant updates', () => {
    const failingForm = createForm({ first: 0, second: 0 });
    const fieldFailure = new Error('field listener failed');
    const formFailure = new Error('form listener failed');
    const notifications: string[] = [];
    let thrown: unknown;

    failingForm.subscribeField('first', () => {
      notifications.push('field:first:failing');
      failingForm.setValue('second', 1);
      throw fieldFailure;
    });
    failingForm.subscribeField('first', () => {
      notifications.push('field:first:remaining');
    });
    failingForm.subscribeField('second', () => {
      notifications.push('field:second');
    });
    failingForm.subscribe((values, prevValues) => {
      notifications.push(
        `form:failing:${prevValues.first},${prevValues.second}->${values.first},${values.second}`,
      );

      if (prevValues.first === 0 && values.first === 1) {
        throw formFailure;
      }
    });
    failingForm.subscribe((values, prevValues) => {
      notifications.push(
        `form:remaining:${prevValues.first},${prevValues.second}->${values.first},${values.second}`,
      );
    });

    try {
      failingForm.setValue('first', 1);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AggregateError);
    expect((thrown as AggregateError).errors).toEqual([fieldFailure, formFailure]);
    expect(notifications).toEqual([
      'field:first:failing',
      'field:first:remaining',
      'form:failing:0,0->1,0',
      'form:remaining:0,0->1,0',
      'field:second',
      'form:failing:1,0->1,1',
      'form:remaining:1,0->1,1',
    ]);
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

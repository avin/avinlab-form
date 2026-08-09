import { describe, it, expect, beforeEach, expectTypeOf, vi } from 'vitest';
import type { Form, FormValidation, ValidationState } from './index';
import { createForm, createFormValidation } from './index';

interface FormFields {
  name: string;
  age: number;
}

describe('createFormValidation', () => {
  let form: Form<FormFields>;
  let formValidation: FormValidation<any, FormFields>;
  const initialValues = { name: 'John', age: 30 };
  const validationFunction = vi.fn((values) => {
    const errors: Record<string, any> = {};
    if (!values.name) {
      errors.name = 'Name is required';
    }
    if (values.age && values.age < 18) {
      errors.age = 'Must be at least 18';
    }
    return errors;
  });

  beforeEach(() => {
    form = createForm(initialValues);
    formValidation = createFormValidation(form, validationFunction);
  });

  it('exposes an empty readonly snapshot without a validator', () => {
    const validation = createFormValidation(createForm(initialValues));

    expect(validation.errors).toEqual({});
    expect(Object.isFrozen(validation.errors)).toBe(true);
    expect(validation.state).toBe('unvalidated');
  });

  it('normalizes a frozen validator result without mutating it', () => {
    const returnedErrors = Object.freeze({
      name: undefined,
      age: 'Must be at least 18',
    });

    const validation = createFormValidation(createForm(initialValues), () => returnedErrors);

    expect(validation.errors).toEqual({ age: 'Must be at least 18' });
    expect(validation.errors).not.toBe(returnedErrors);
    expect(Object.isFrozen(validation.errors)).toBe(true);
    expect(returnedErrors).toEqual({
      name: undefined,
      age: 'Must be at least 18',
    });
  });

  it('revalidates synchronously when the configured validator changes', () => {
    const oldValidator = vi.fn(() => ({ name: 'Obsolete error' }));
    const newValidator = vi.fn(() => ({}));
    const changingForm = createForm(initialValues);
    const validation = createFormValidation<{ name?: string }, FormFields>(
      changingForm,
      oldValidator,
    );
    changingForm.setValue('age', 31);
    const listener = vi.fn();
    validation.onValidate(listener);

    validation.setValidation(newValidator);

    expect(newValidator).toHaveBeenCalledOnce();
    expect(newValidator).toHaveBeenCalledWith({ ...initialValues, age: 31 }, initialValues);
    expect(validation.errors).toEqual({});
    expect(validation.state).toBe('valid');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(validation.errors);
  });

  it('validates synchronously when a missing validator is configured', () => {
    const validator = vi.fn(() => ({ name: 'Required' }));
    const validation = createFormValidation<{ name?: string }, FormFields>(form);
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.setValidation(validator);

    expect(validator).toHaveBeenCalledOnce();
    expect(validator).toHaveBeenCalledWith(initialValues, initialValues);
    expect(validation.errors).toEqual({ name: 'Required' });
    expect(validation.state).toBe('invalid');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('publishes the first successful validation when only the state changes', () => {
    const validation = createFormValidation<Record<string, never>, FormFields>(form);
    const initialErrors = validation.errors;
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.setValidation(() => ({}));

    expect(validation.state).toBe('valid');
    expect(validation.errors).toBe(initialErrors);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(initialErrors);
  });

  it('leaves an unvalidated controller unchanged when validate has no validator', () => {
    const validation = createFormValidation(form);
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.validate();

    expect(validation.state).toBe('unvalidated');
    expect(validation.errors).toEqual({});
    expect(listener).not.toHaveBeenCalled();
  });

  it('returns an idempotent unsubscribe function from validation subscriptions', () => {
    const validation = createFormValidation(form, validationFunction);
    const listener = vi.fn();
    const unsubscribe = validation.subscribe(listener);

    unsubscribe();
    unsubscribe();
    form.setValue('name', '');

    expect(listener).not.toHaveBeenCalled();
  });

  it('disposes idempotently and stops responding to form commits', () => {
    const validator = vi.fn((values: FormFields) =>
      values.name ? {} : { name: 'Name is required' },
    );
    const validation = createFormValidation(form, validator);
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.dispose();
    validation.dispose();
    form.setValue('name', '');
    validation.validate();

    expect(validator).toHaveBeenCalledOnce();
    expect(listener).not.toHaveBeenCalled();
    expect(validation.errors).toEqual({});
    expect(validation.state).toBe('valid');
  });

  it('retains the error snapshot and emits no event for equivalent normalized errors', () => {
    const validator = vi.fn((values: FormFields) =>
      values.name ? {} : { name: 'Name is required', ignored: undefined },
    );
    const invalidForm = createForm({ name: '', age: 30 });
    const validation = createFormValidation(invalidForm, validator);
    const initialErrors = validation.errors;
    const listener = vi.fn();
    validation.subscribe(listener);

    invalidForm.setValue('age', 31);

    expect(validator).toHaveBeenCalledTimes(2);
    expect(validation.errors).toBe(initialErrors);
    expect(validation.state).toBe('invalid');
    expect(listener).not.toHaveBeenCalled();
  });

  it('isolates its snapshot from a shared mutable error object', () => {
    const sharedErrors: { name?: string } = { name: 'Name is required' };
    const sharedForm = createForm(initialValues);
    const validation = createFormValidation(sharedForm, () => sharedErrors);
    const initialErrors = validation.errors;
    const listener = vi.fn();
    validation.subscribe(listener);

    sharedErrors.name = 'Name has changed';

    expect(initialErrors).toEqual({ name: 'Name is required' });
    sharedForm.setValue('age', 31);
    expect(validation.errors).toEqual({ name: 'Name has changed' });
    expect(validation.errors).not.toBe(sharedErrors);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('keeps the previous validation snapshot when validation throws', () => {
    const failure = new Error('validation failed');
    const throwingValidator = vi.fn((values: FormFields) => {
      if (values.age === 31) {
        throw failure;
      }

      return { name: 'Existing error' };
    });
    const throwingForm = createForm(initialValues);
    const validation = createFormValidation(throwingForm, throwingValidator);
    const initialErrors = validation.errors;
    const listener = vi.fn();
    validation.subscribe(listener);

    expect(() => throwingForm.setValue('age', 31)).toThrow(failure);
    expect(throwingForm.values.age).toBe(31);
    expect(validation.errors).toBe(initialErrors);
    expect(validation.state).toBe('invalid');
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not retain a form subscription when initial validation throws', () => {
    const failure = new Error('initial validation failed');
    const throwingForm = createForm(initialValues);
    const validator = vi.fn(() => {
      throw failure;
    });

    expect(() => createFormValidation(throwingForm, validator)).toThrow(failure);
    expect(() => throwingForm.setValue('age', 31)).not.toThrow();
    expect(validator).toHaveBeenCalledOnce();
  });

  it('preserves readonly form and concrete error snapshots in listener types', () => {
    interface SpecificErrors {
      name?: 'required';
      code?: number;
    }

    const validation = createFormValidation<SpecificErrors, FormFields>(
      createForm(initialValues),
      (values, prevValues) => {
        expectTypeOf(values).toEqualTypeOf<Readonly<FormFields>>();
        expectTypeOf(prevValues).toEqualTypeOf<Readonly<FormFields>>();
        return {};
      },
    );

    validation.subscribe((errors) => {
      expectTypeOf(errors).toEqualTypeOf<Readonly<SpecificErrors>>();
    });
    expectTypeOf(validation.errors).toEqualTypeOf<Readonly<SpecificErrors>>();
    expectTypeOf(validation.state).toEqualTypeOf<ValidationState>();
  });

  it('should initialize without errors and with a valid state after validation', () => {
    expect(formValidation.errors).toEqual({});
    expect(formValidation.state).toBe('valid');
  });

  it('should validate with new values and update errors and validity', () => {
    form.setValue('name', ''); // This should trigger an error
    expect(validationFunction).toHaveBeenCalledWith({ ...initialValues, name: '' }, initialValues);
    expect(formValidation.errors).toEqual({ name: 'Name is required' });
    expect(formValidation.state).toBe('invalid');
  });

  it('should call validation handlers with errors', () => {
    const onValidateHandler = vi.fn();
    formValidation.onValidate(onValidateHandler);
    form.setValue('age', 17); // This should trigger an error

    expect(onValidateHandler).toHaveBeenCalledWith({
      age: 'Must be at least 18',
    });
    expect(formValidation.errors).toEqual({ age: 'Must be at least 18' });
  });

  it('should not call validation handlers if errors did not change', () => {
    const onValidateHandler = vi.fn();
    formValidation.onValidate(onValidateHandler);
    // Setting value without changing the error state
    form.setValue('age', 20);

    expect(onValidateHandler).not.toHaveBeenCalled(); // Should not be called since errors did not change
  });

  it('should remove validation handlers correctly', () => {
    const onValidateHandler = vi.fn();
    formValidation.onValidate(onValidateHandler);
    formValidation.offValidate(onValidateHandler);
    form.setValue('name', ''); // This should normally trigger an error

    expect(onValidateHandler).not.toHaveBeenCalled();
  });
});

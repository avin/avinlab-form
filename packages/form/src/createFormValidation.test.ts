import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { Form, FormValidation, ValidationResult, ValidationStatus } from './index';
import { createForm, createFormValidation } from './index';

interface FormFields {
  name: string;
  age: number;
}

interface FormFieldErrors {
  name?: string;
  age?: string;
}

describe('createFormValidation', () => {
  const initialValues = { name: 'John', age: 30 };
  let form: Form<FormFields>;

  beforeEach(() => {
    form = createForm(initialValues);
  });

  it('starts with one frozen unvalidated result and empty frozen errors', () => {
    const validation = createFormValidation<FormFieldErrors, FormFields>(form);

    expect(validation.result).toEqual({ status: 'unvalidated', errors: {} });
    expect(Object.isFrozen(validation.result)).toBe(true);
    expect(Object.isFrozen(validation.result.errors)).toBe(true);
    expect('errors' in validation).toBe(false);
    expect('state' in validation).toBe(false);
    expect('isValid' in validation).toBe(false);
  });

  it('publishes valid and invalid results for form commits', () => {
    const validation = createFormValidation<FormFieldErrors, FormFields>(form, (values) =>
      values.name ? {} : { name: 'Name is required' },
    );
    const listener = vi.fn();
    validation.subscribe(listener);

    expect(validation.result).toEqual({ status: 'valid', errors: {} });

    form.setValue('name', '');

    expect(validation.result).toEqual({
      status: 'invalid',
      errors: { name: 'Name is required' },
    });
    expect(listener).toHaveBeenCalledWith(validation.result);
  });

  it('normalizes a frozen validator result without mutating it', () => {
    const returnedErrors = Object.freeze({ name: undefined, age: 'Must be at least 18' });
    const validation = createFormValidation(form, () => returnedErrors);

    expect(validation.result.errors).toEqual({ age: 'Must be at least 18' });
    expect(validation.result.errors).not.toBe(returnedErrors);
    expect(Object.isFrozen(validation.result.errors)).toBe(true);
    expect(returnedErrors).toEqual({ name: undefined, age: 'Must be at least 18' });
  });

  it('revalidates current values synchronously when the validator changes', () => {
    const oldValidator = vi.fn(() => ({ name: 'Obsolete error' }));
    const newValidator = vi.fn(() => ({}));
    const validation = createFormValidation<FormFieldErrors, FormFields>(form, oldValidator);
    form.setValue('age', 31);
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.setValidator(newValidator);

    expect(newValidator).toHaveBeenCalledWith({ ...initialValues, age: 31 }, initialValues);
    expect(validation.result).toEqual({ status: 'valid', errors: {} });
    expect(listener).toHaveBeenCalledWith(validation.result);
  });

  it('validates explicitly with the configured validator', () => {
    const validator = vi.fn(() => ({}));
    const validation = createFormValidation<FormFieldErrors, FormFields>(form);

    validation.setValidator(validator);
    validation.validate();

    expect(validator).toHaveBeenCalledTimes(2);
  });

  it('does nothing when explicit validation has no validator', () => {
    const validation = createFormValidation<FormFieldErrors, FormFields>(form);
    const initialResult = validation.result;
    const listener = vi.fn();
    validation.subscribe(listener);

    validation.validate();

    expect(validation.result).toBe(initialResult);
    expect(listener).not.toHaveBeenCalled();
  });

  it('retains the complete result and emits no event for equivalent normalized results', () => {
    const invalidForm = createForm({ name: '', age: 30 });
    const validator = vi.fn((values: FormFields) =>
      values.name ? {} : { name: 'Name is required', ignored: undefined },
    );
    const validation = createFormValidation(invalidForm, validator);
    const initialResult = validation.result;
    const listener = vi.fn();
    validation.subscribe(listener);

    invalidForm.setValue('age', 31);

    expect(validation.result).toBe(initialResult);
    expect(listener).not.toHaveBeenCalled();
  });

  it('isolates its result from a shared mutable errors object', () => {
    const sharedErrors: FormFieldErrors = { name: 'Name is required' };
    const validation = createFormValidation(form, () => sharedErrors);
    const initialResult = validation.result;

    sharedErrors.name = 'Name has changed';

    expect(initialResult.errors).toEqual({ name: 'Name is required' });
    form.setValue('age', 31);
    expect(validation.result.errors).toEqual({ name: 'Name has changed' });
  });

  it('publishes an empty unvalidated result before a validator exception propagates', () => {
    const failure = new Error('validation failed');
    const throwingValidator = vi.fn((values: FormFields) => {
      if (values.age === 31) throw failure;
      return { name: 'Existing error' };
    });
    const validation = createFormValidation(form, throwingValidator);
    const listener = vi.fn();
    validation.subscribe(listener);

    expect(() => form.setValue('age', 31)).toThrow(failure);

    expect(validation.result).toEqual({ status: 'unvalidated', errors: {} });
    expect(listener).toHaveBeenCalledWith(validation.result);
  });

  it('does not retain a form subscription when initial validation throws', () => {
    const failure = new Error('initial validation failed');
    const validator = vi.fn(() => {
      throw failure;
    });

    expect(() => createFormValidation(form, validator)).toThrow(failure);
    expect(() => form.setValue('age', 31)).not.toThrow();
    expect(validator).toHaveBeenCalledOnce();
  });

  it('returns an idempotent unsubscribe function', () => {
    const validation = createFormValidation(form, () => ({}));
    const listener = vi.fn();
    const unsubscribe = validation.subscribe(listener);

    unsubscribe();
    unsubscribe();
    form.setValue('name', 'Jane');

    expect(listener).not.toHaveBeenCalled();
  });

  it('disposes idempotently and stops observing form commits', () => {
    const validator = vi.fn(() => ({}));
    const validation = createFormValidation(form, validator);
    const retainedResult = validation.result;

    validation.dispose();
    validation.dispose();
    form.setValue('name', 'Jane');
    validation.validate();

    expect(validator).toHaveBeenCalledOnce();
    expect(validation.result).toBe(retainedResult);
  });

  it('preserves readonly form, result, and concrete error types', () => {
    const validation: FormValidation<FormFieldErrors, FormFields> = createFormValidation(
      form,
      (values, prevValues) => {
        expectTypeOf(values).toEqualTypeOf<Readonly<FormFields>>();
        expectTypeOf(prevValues).toEqualTypeOf<Readonly<FormFields>>();
        return {};
      },
    );

    validation.subscribe((result) => {
      expectTypeOf(result).toEqualTypeOf<ValidationResult<FormFieldErrors>>();
    });
    expectTypeOf(validation.result).toEqualTypeOf<ValidationResult<FormFieldErrors>>();
    expectTypeOf(validation.result.status).toEqualTypeOf<ValidationStatus>();
  });
});

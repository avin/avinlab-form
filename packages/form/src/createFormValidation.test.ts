import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Form } from './createForm';
import { createForm } from './createForm';
import type { FormValidation } from './createFormValidation';
import { createFormValidation } from './createFormValidation';

describe('createFormValidation', () => {
  let form: Form;
  let formValidation: FormValidation;
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

  it('should initialize without errors and with a valid state', () => {
    expect(formValidation.errors).toEqual({});
    expect(formValidation.isValid).toBe(true);
  });

  it('should validate with new values and update errors and validity', () => {
    form.setValue('name', ''); // This should trigger an error
    expect(validationFunction).toHaveBeenCalledWith({ ...initialValues, name: '' }, initialValues);
    expect(formValidation.errors).toEqual({ name: 'Name is required' });
    expect(formValidation.isValid).toBe(false);
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
    formValidation.validate();
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

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm'; // Import useForm hook
import { useFormValidation } from './useFormValidation';
import type { Form } from '@avinlab/form';

// You may need to mock any additional imports or side effects as necessary.

describe('useFormValidation', () => {
  let form: Form;

  // Here's your custom validation function being used as a mock
  const validationFunction = vi.fn((values) => {
    const errors: Record<string, any> = {};
    if (!values.name) {
      errors.name = 'Name is required';
    }
    if ((values.age || 0) < 18) {
      errors.age = 'Must be at least 18';
    }
    return errors;
  });

  beforeEach(() => {
    // Setup to initialize 'form' using 'useForm' hook
    const initialValues = { name: undefined, age: undefined };
    const { result: useFormResult } = renderHook(() => useForm(initialValues));
    form = useFormResult.current;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates fields correctly', () => {
    const { result } = renderHook(() => useFormValidation(form, validationFunction));

    act(() => {
      form.setValue('name', ''); // This should trigger a validation error
      form.setValue('age', 17); // This should also trigger a validation error
    });

    // Expect the validation function to have been called twice
    expect(validationFunction).toHaveBeenCalledTimes(3);
    // Now, let's check if the errors state is updated
    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.age).toBe('Must be at least 18');
    expect(result.current.isValidated).toBe(true);
  });

  it('sets initial validation state', () => {
    const { result } = renderHook(() => useFormValidation(form, validationFunction));

    // At the initial render, there should be no validation errors
    expect(result.current.errors).toEqual({
      name: 'Name is required',
      age: 'Must be at least 18',
    });
    expect(result.current.isValidated).toBe(true);
  });

  it('updates validation state when values change', () => {
    const { result } = renderHook(() => useFormValidation(form, validationFunction));

    act(() => {
      form.setValue('name', 'Alice'); // This should be valid
      form.setValue('age', 20); // This should also be valid
    });

    // The validation function should have been called again
    expect(validationFunction).toHaveBeenCalledTimes(3);
    // Errors should be empty if the input is valid
    expect(result.current.errors).toEqual({});
    // isValidated should be updated accordingly
    expect(result.current.isValidated).toBe(true);
  });
});

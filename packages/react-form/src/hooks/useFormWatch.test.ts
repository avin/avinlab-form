import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';
import { useFormWatch } from './useFormWatch';
import type { Form } from '@avinlab/form';

// Assuming that T can be a simple Record<string, any>
interface TestFormValues {
  name?: string;
  age?: number;
}

describe('useFormWatch', () => {
  let form: Form<TestFormValues>;

  beforeEach(() => {
    // Setup to initialize 'form' using 'useForm' hook or a mock implementation
    const initialValues: TestFormValues = { name: 'John', age: 30 };
    const { result: useFormResult } = renderHook(() => useForm(initialValues));
    form = useFormResult.current;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the full form values when no field name is provided', () => {
    const { result } = renderHook(() => useFormWatch(form));

    expect(result.current).toEqual({ name: 'John', age: 30 });
  });

  it('returns the value for a specific field when field name is provided', () => {
    const { result } = renderHook(() => useFormWatch(form, 'name'));

    expect(result.current).toBe('John');
  });

  it('updates the watched value when form values change', () => {
    const { result } = renderHook(() => useFormWatch(form, 'age'));

    act(() => {
      // Simulate form value update
      form.setValue('age', 35);
    });

    expect(result.current).toBe(35);
  });
});

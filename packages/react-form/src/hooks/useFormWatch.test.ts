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
  let form: Form;

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
    const { result } = renderHook(() => useFormWatch<TestFormValues>(form));

    expect(result.current).toEqual({ name: 'John', age: 30 });
  });

  it('returns the value for a specific field when field name is provided', () => {
    const { result } = renderHook(() =>
      useFormWatch<TestFormValues>(form, 'name'),
    );

    expect(result.current).toBe('John');
  });

  it.only('updates the watched value when form values change', () => {
    const { result } = renderHook(() =>
      useFormWatch<TestFormValues>(form, 'age'),
    );

    act(() => {
      // Simulate form value update
      form.setValue('age', 35);
    });

    expect(result.current).toBe(35);
  });

  it('cleans up the registered field update handler on unmount', () => {
    const cleanupSpy = vi.fn();
    form.onUpdateField = vi.fn(() => cleanupSpy);

    const { unmount } = renderHook(() =>
      useFormWatch<TestFormValues>(form, 'age'),
    );

    unmount();

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it('cleans up the registered form update handler on unmount when no field name is provided', () => {
    const cleanupSpy = vi.fn();
    form.onUpdate = vi.fn(() => cleanupSpy);

    const { unmount } = renderHook(() => useFormWatch<TestFormValues>(form));

    unmount();

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  // Additional tests can be added here as needed...
});

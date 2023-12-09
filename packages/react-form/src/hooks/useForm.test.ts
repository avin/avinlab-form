import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useForm } from './useForm'; // Adjust the import path to where your useForm hook is located

interface TestFormValues {
  name?: string;
  age?: number;
}

describe('useForm', () => {
  it('should create a form instance with initial values', () => {
    const initialValues = { name: 'John Doe', age: 30 };
    const { result } = renderHook(() => useForm<TestFormValues>(initialValues));

    // Check if the form has been initialized with the correct initial values
    expect(result.current.values).toEqual(initialValues);
  });

  it('should return the same form instance on re-render', () => {
    const initialValues = { name: 'Jane Doe', age: 25 };
    const { result, rerender } = renderHook(() => useForm(initialValues));

    const firstInstance = result.current;
    rerender();

    // Check if the form instance is the same after re-render
    expect(result.current).toBe(firstInstance);
  });
});

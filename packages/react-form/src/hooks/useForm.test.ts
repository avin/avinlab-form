import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from '../index';
import { StrictModeWrapper } from '../test/react.test.utils';

interface TestFormValues {
  name?: string;
  age?: number;
}

const useDependencyTrackedForm = (age: number, onDependencyChange: () => void) => {
  const form = useForm({ name: 'Jane Doe', age });
  useEffect(onDependencyChange, [form, onDependencyChange]);

  return form;
};

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
    act(() => firstInstance.setValue('name', 'Janet Doe'));
    rerender();

    // Check if the form instance is the same after re-render
    expect(result.current).toBe(firstInstance);
    expect(result.current.values.name).toBe('Janet Doe');
  });

  it('does not rerender its owner when form values change', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useForm({ name: 'Jane Doe', age: 25 });
    });

    act(() => result.current.setValue('age', 26));

    expect(renderCount).toBe(1);
    expect(result.current.values.age).toBe(26);
  });

  it('keeps the controller safe in dependency arrays', () => {
    let dependencyEffectCount = 0;
    const trackDependency = () => {
      dependencyEffectCount += 1;
    };
    const { result, rerender } = renderHook(
      ({ age }: { age: number }) => useDependencyTrackedForm(age, trackDependency),
      { initialProps: { age: 25 } },
    );
    const firstForm = result.current;

    rerender({ age: 30 });

    expect(result.current).toBe(firstForm);
    expect(result.current.values.age).toBe(25);
    expect(dependencyEffectCount).toBe(1);
  });

  it('retains one controller for the committed Strict Mode lifetime', () => {
    const { result, rerender } = renderHook(() => useForm({ name: 'Jane Doe', age: 25 }), {
      wrapper: StrictModeWrapper,
    });
    const committedForm = result.current;

    rerender();

    expect(result.current).toBe(committedForm);
  });
});

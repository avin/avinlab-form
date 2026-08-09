import { createElement, Suspense, type PropsWithChildren } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createForm, type Form, type ValidationFunction } from '@avinlab/form';
import { useFormValidation, useFormValidationError, useFormValidationState } from '../index';
import { StrictModeWrapper } from '../test/react.test.utils';

interface TestFormValues {
  name?: string;
  age?: number;
}

type TestValidationFunction = ValidationFunction<Record<string, any>, TestFormValues>;

const trackFormCleanup = (form: Form<TestFormValues>) => {
  const originalSubscribe = form.subscribe;
  const unsubscribe = vi.fn();
  const subscribe = vi.spyOn(form, 'subscribe').mockImplementation((listener) => {
    const unsubscribeForm = originalSubscribe(listener);

    return () => {
      unsubscribe();
      unsubscribeForm();
    };
  });

  return { subscribe, unsubscribe };
};

describe('useFormValidation', () => {
  let form: Form<TestFormValues>;

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
    const initialValues = { name: undefined, age: undefined };
    form = createForm<TestFormValues>(initialValues);
    validationFunction.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets initial validation state', () => {
    const renderedStates: string[] = [];
    const { result } = renderHook(() => {
      const validation = useFormValidation(form, validationFunction);
      renderedStates.push(validation.state);
      return validation;
    });

    expect(validationFunction).toHaveBeenCalledTimes(1);
    expect(renderedStates).toEqual(['unvalidated', 'invalid']);

    expect(result.current.errors).toEqual({
      name: 'Name is required',
      age: 'Must be at least 18',
    });
    expect(result.current.state).toBe('invalid');
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
    expect(result.current.state).toBe('valid');
  });

  it('does not subscribe or validate an abandoned form source during render', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const nextSubscribe = vi.spyOn(nextForm, 'subscribe');
    const nextValidation = vi.fn((_values: TestFormValues) => ({}));
    const suspended = new Promise<void>(() => {
      // This render is intentionally abandoned while suspended.
    });
    const wrapper = ({ children }: PropsWithChildren<Record<never, never>>) =>
      createElement(Suspense, { fallback: null }, children);
    const { rerender } = renderHook(
      ({
        source,
        validator,
        shouldSuspend,
      }: {
        source: Form<TestFormValues>;
        validator: TestValidationFunction;
        shouldSuspend: boolean;
      }) => {
        const validation = useFormValidation(source, validator);

        if (shouldSuspend) {
          throw suspended;
        }

        return validation;
      },
      {
        initialProps: {
          source: form,
          validator: validationFunction,
          shouldSuspend: false,
        },
        wrapper,
      },
    );

    rerender({ source: nextForm, validator: nextValidation, shouldSuspend: true });

    expect(nextSubscribe).not.toHaveBeenCalled();
    expect(nextValidation).not.toHaveBeenCalled();
  });

  it('attaches the form subscription after commit and removes it during cleanup', () => {
    const { subscribe, unsubscribe } = trackFormCleanup(form);
    const { unmount } = renderHook(() => useFormValidation(form, validationFunction));
    const validationCallsBeforeUnmount = validationFunction.mock.calls.length;

    expect(subscribe).toHaveBeenCalledOnce();

    unmount();
    act(() => form.setValue('name', 'Ignored'));

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(validationFunction).toHaveBeenCalledTimes(validationCallsBeforeUnmount);
  });

  it('switches form sources and stops observing the previous form', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const { unsubscribe: unsubscribePrevious } = trackFormCleanup(form);
    const renders: Array<{ source: Form<TestFormValues>; state: string }> = [];
    const { result, rerender } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) => {
        const validation = useFormValidation(source, validationFunction);
        renders.push({ source, state: validation.state });
        return validation;
      },
      { initialProps: { source: form } },
    );

    expect(result.current.state).toBe('invalid');

    rerender({ source: nextForm });

    expect(unsubscribePrevious).toHaveBeenCalledOnce();
    expect(
      renders.filter((render) => render.source === nextForm).map((render) => render.state),
    ).toEqual(['unvalidated', 'valid']);
    expect(result.current.errors).toEqual({});
    expect(result.current.state).toBe('valid');

    act(() => form.setValue('name', 'Ignored'));

    expect(result.current.errors).toEqual({});
  });

  it('keeps the returned validation facade disposed across source changes', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const nextSubscribe = vi.spyOn(nextForm, 'subscribe');
    const listener = vi.fn();
    const { result, rerender } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) =>
        useFormValidation(source, validationFunction),
      { initialProps: { source: form } },
    );
    result.current.subscribe(listener);
    const retainedErrors = result.current.errors;
    const retainedState = result.current.state;

    act(() => {
      result.current.dispose();
      result.current.dispose();
    });
    rerender({ source: nextForm });
    act(() => nextForm.setValue('name', 'Ignored'));

    expect(nextSubscribe).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
    expect(result.current.errors).toBe(retainedErrors);
    expect(result.current.state).toBe(retainedState);
  });

  it('retains its snapshot when validation throws', () => {
    const failure = new Error('validation failed');
    const throwingValidator = vi.fn((values: TestFormValues) => {
      if (values.age === 17) {
        throw failure;
      }

      return { name: 'Existing error' };
    });
    const { result } = renderHook(() => useFormValidation(form, throwingValidator));
    const retainedErrors = result.current.errors;

    expect(() => act(() => form.setValue('age', 17))).toThrow(failure);
    expect(result.current.errors).toBe(retainedErrors);
    expect(result.current.state).toBe('invalid');
  });

  it('does not reconnect or rerender indefinitely for an inline validator', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormValidation(form, () => ({ name: 'Name is required' }));
    });

    expect(result.current.state).toBe('invalid');
    expect(renderCount).toBe(2);
  });

  it('recalculates committed values with a changed validator and drops the old closure', () => {
    form.setValue('name', 'Al');
    form.setValue('age', 20);
    const firstValidator = vi.fn(() => ({}));
    const nextValidator = vi.fn((values: TestFormValues) =>
      (values.name?.length || 0) < 3 ? { name: 'Name is too short' } : {},
    );
    const { result, rerender } = renderHook(
      ({ validator }: { validator: TestValidationFunction }) => useFormValidation(form, validator),
      { initialProps: { validator: firstValidator as TestValidationFunction } },
    );

    rerender({ validator: nextValidator });

    expect(result.current.errors).toEqual({ name: 'Name is too short' });
    expect(nextValidator).toHaveBeenLastCalledWith(form.values, form.prevValues);
    const obsoleteCallCount = firstValidator.mock.calls.length;

    act(() => form.setValue('name', 'Alice'));

    expect(result.current.errors).toEqual({});
    expect(firstValidator).toHaveBeenCalledTimes(obsoleteCallCount);
  });

  it('does not rerender the complete reader when normalized errors stay unchanged', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormValidation(form, validationFunction);
    });

    expect(result.current.errors).toEqual({
      name: 'Name is required',
      age: 'Must be at least 18',
    });
    expect(renderCount).toBe(2);

    act(() => form.setValue('age', 16));

    expect(result.current.errors).toEqual({
      name: 'Name is required',
      age: 'Must be at least 18',
    });
    expect(renderCount).toBe(2);
  });

  it('balances subscriptions and drops callbacks across Strict Mode mount cycles', () => {
    const { subscribe, unsubscribe } = trackFormCleanup(form);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const { unmount } = renderHook(() => useFormValidation(form, validationFunction), {
        wrapper: StrictModeWrapper,
      });
      unmount();
    }

    const validationCallsAfterUnmount = validationFunction.mock.calls.length;
    act(() => form.setValue('age', 20));

    expect(unsubscribe).toHaveBeenCalledTimes(subscribe.mock.calls.length);
    expect(validationFunction).toHaveBeenCalledTimes(validationCallsAfterUnmount);
  });

  it('rerenders a field-error reader only when its selected error changes', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormValidationError(form, validationFunction, 'name');
    });

    expect(result.current).toBe('Name is required');
    expect(renderCount).toBe(2);

    act(() => form.setValue('age', 20));

    expect(result.current).toBe('Name is required');
    expect(renderCount).toBe(2);

    act(() => form.setValue('name', 'Alice'));

    expect(result.current).toBeUndefined();
    expect(renderCount).toBe(3);
  });

  it('rerenders a validation-state reader only when the state changes', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormValidationState(form, validationFunction);
    });

    expect(result.current).toBe('invalid');
    expect(renderCount).toBe(2);

    act(() => form.setValue('name', 'Alice'));

    expect(result.current).toBe('invalid');
    expect(renderCount).toBe(2);

    act(() => form.setValue('age', 20));

    expect(result.current).toBe('valid');
    expect(renderCount).toBe(3);
  });
});

import { createElement, StrictMode, Suspense, type PropsWithChildren } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createForm, type Form, type ValidationFunction } from '@avinlab/form';
import { useFormValidation } from '../index';

interface TestFormValues {
  name?: string;
  age?: number;
}

type TestErrors = Partial<Record<keyof TestFormValues, string>>;
type TestValidator = ValidationFunction<TestErrors, TestFormValues>;
type TestValidatorArgs = [Readonly<TestFormValues>, Readonly<TestFormValues>];

const createValidator = () =>
  vi.fn<TestValidatorArgs, TestErrors>((values) => ({
    name: values.name ? undefined : 'Name is required',
    age: (values.age || 0) >= 18 ? undefined : 'Must be at least 18',
  }));

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
  let validator: ReturnType<typeof createValidator>;

  beforeEach(() => {
    form = createForm<TestFormValues>({ name: undefined, age: undefined });
    validator = createValidator();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns only an unvalidated render snapshot before the committed request validates', () => {
    const renderedResults: Array<{ status: string; errors: Readonly<TestErrors> }> = [];
    const { result } = renderHook(() => {
      const validationResult = useFormValidation(form, validator);
      renderedResults.push(validationResult);
      return validationResult;
    });

    expect(renderedResults.map(({ status }) => status)).toEqual(['unvalidated', 'invalid']);
    expect(result.current).toEqual({
      status: 'invalid',
      errors: { name: 'Name is required', age: 'Must be at least 18' },
    });
    expect(Object.keys(result.current).sort()).toEqual(['errors', 'status']);
    expect(Object.isFrozen(result.current)).toBe(true);
  });

  it('uses an unvalidated snapshot for server rendering without validation side effects', () => {
    const Probe = () => {
      const result = useFormValidation(form, validator);
      return createElement('output', null, `${result.status}:${Object.keys(result.errors).length}`);
    };

    expect(renderToString(createElement(Probe))).toContain('unvalidated:0');
    expect(validator).not.toHaveBeenCalled();
  });

  it('hydrates from unvalidated server data before the committed request validates', async () => {
    const renderedStatuses: string[] = [];
    const Probe = () => {
      const result = useFormValidation(form, validator);
      renderedStatuses.push(result.status);
      return createElement('output', null, result.status);
    };
    const container = (globalThis as any).document.createElement('div');
    container.innerHTML = renderToString(createElement(Probe));

    const root = hydrateRoot(container, createElement(Probe));
    await act(async () => undefined);

    expect(renderedStatuses.slice(0, 2)).toEqual(['unvalidated', 'unvalidated']);
    expect(renderedStatuses.at(-1)).toBe('invalid');
    expect(container.textContent).toBe('invalid');
    await act(async () => root.unmount());
  });

  it('owns one validation derivation and validates once for each real form commit', () => {
    const subscribe = vi.spyOn(form, 'subscribe');
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormValidation(form, validator);
    });

    expect(subscribe).toHaveBeenCalledOnce();
    expect(validator).toHaveBeenCalledOnce();

    act(() => form.setValue('age', 16));
    expect(validator).toHaveBeenCalledTimes(2);
    expect(subscribe).toHaveBeenCalledOnce();
    expect(renderCount).toBe(2);

    act(() => form.setValue('age', 20));
    expect(validator).toHaveBeenCalledTimes(3);
    expect(result.current.errors).toEqual({ name: 'Name is required' });
    expect(renderCount).toBe(3);
  });

  it('shows unvalidated data until a changed form request commits and validates', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const { unsubscribe: unsubscribePrevious } = trackFormCleanup(form);
    const nextRequestStatuses: string[] = [];
    const { result, rerender } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) => {
        const validationResult = useFormValidation(source, validator);
        if (source === nextForm) nextRequestStatuses.push(validationResult.status);
        return validationResult;
      },
      { initialProps: { source: form } },
    );

    rerender({ source: nextForm });

    expect(nextRequestStatuses).toEqual(['unvalidated', 'valid']);
    expect(result.current).toEqual({ status: 'valid', errors: {} });
    expect(unsubscribePrevious).toHaveBeenCalledOnce();
  });

  it('shows unvalidated data until a changed validator request commits and validates', () => {
    const firstValidator = vi.fn<TestValidatorArgs, TestErrors>(() => ({}));
    const nextValidator = vi.fn<TestValidatorArgs, TestErrors>(() => ({ name: 'Too short' }));
    const nextRequestStatuses: string[] = [];
    const { result, rerender } = renderHook(
      ({ currentValidator }: { currentValidator: TestValidator }) => {
        const validationResult = useFormValidation(form, currentValidator);
        if (currentValidator === nextValidator) nextRequestStatuses.push(validationResult.status);
        return validationResult;
      },
      { initialProps: { currentValidator: firstValidator as TestValidator } },
    );

    rerender({ currentValidator: nextValidator });

    expect(nextRequestStatuses).toEqual(['unvalidated', 'invalid']);
    expect(result.current.errors).toEqual({ name: 'Too short' });
    expect(nextValidator).toHaveBeenCalledOnce();
  });

  it('honors a validator change batched with a form notification', () => {
    const firstValidator = vi.fn<TestValidatorArgs, TestErrors>((values) =>
      values.age ? {} : { age: 'Age is required' },
    );
    const nextValidator = vi.fn<TestValidatorArgs, TestErrors>(() => ({ name: 'New rule' }));
    const nextRequestStatuses: string[] = [];
    const { result, rerender } = renderHook(
      ({ currentValidator }: { currentValidator: TestValidator }) => {
        const validationResult = useFormValidation(form, currentValidator);
        if (currentValidator === nextValidator) nextRequestStatuses.push(validationResult.status);
        return validationResult;
      },
      { initialProps: { currentValidator: firstValidator as TestValidator } },
    );

    act(() => {
      form.setValue('age', 20);
      rerender({ currentValidator: nextValidator });
    });

    expect(nextRequestStatuses).toEqual(['unvalidated', 'invalid']);
    expect(result.current.errors).toEqual({ name: 'New rule' });
    expect(nextValidator).toHaveBeenCalledOnce();
  });

  it('does not subscribe or validate an abandoned request during render', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const nextSubscribe = vi.spyOn(nextForm, 'subscribe');
    const nextValidator = vi.fn<TestValidatorArgs, TestErrors>(() => ({}));
    const suspended = new Promise<void>(() => {});
    const wrapper = ({ children }: PropsWithChildren<Record<never, never>>) =>
      createElement(Suspense, { fallback: null }, children);
    const { rerender } = renderHook(
      ({ source, currentValidator, suspend }) => {
        const result = useFormValidation(source, currentValidator);
        if (suspend) throw suspended;
        return result;
      },
      {
        initialProps: {
          source: form,
          currentValidator: validator as TestValidator,
          suspend: false,
        },
        wrapper,
      },
    );

    rerender({ source: nextForm, currentValidator: nextValidator, suspend: true });

    expect(nextSubscribe).not.toHaveBeenCalled();
    expect(nextValidator).not.toHaveBeenCalled();

    act(() => form.setValue('age', 20));
    expect(nextValidator).not.toHaveBeenCalled();
  });

  it('publishes an empty unvalidated snapshot when validation throws', () => {
    const failure = new Error('validation failed');
    const throwingValidator = vi.fn<TestValidatorArgs, TestErrors>((values) => {
      if (values.age === 17) throw failure;
      return { name: 'Existing error' };
    });
    const { result, rerender } = renderHook(() => useFormValidation(form, throwingValidator));

    expect(() => act(() => form.setValue('age', 17))).toThrow(failure);
    rerender();
    expect(result.current).toEqual({ status: 'unvalidated', errors: {} });
  });

  it('releases every form subscription during unmount and Strict Mode cleanup', () => {
    const { subscribe, unsubscribe } = trackFormCleanup(form);
    const wrapper = ({ children }: PropsWithChildren) => createElement(StrictMode, null, children);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const { unmount } = renderHook(() => useFormValidation(form, validator), { wrapper });
      unmount();
    }

    expect(unsubscribe).toHaveBeenCalledTimes(subscribe.mock.calls.length);
    const callsAfterUnmount = validator.mock.calls.length;
    act(() => form.setValue('age', 20));
    expect(validator).toHaveBeenCalledTimes(callsAfterUnmount);
  });
});

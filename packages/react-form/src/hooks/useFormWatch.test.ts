import { createElement, Suspense, type PropsWithChildren } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createForm, type Form } from '@avinlab/form';
import { useForm, useFormWatch } from '../index';
import { StrictModeWrapper } from '../test/react.test.utils';

// Assuming that T can be a simple Record<string, any>
interface TestFormValues {
  name?: string;
  age?: number;
}

const trackFormCleanup = (form: Form<TestFormValues>, onCleanup: () => void) => {
  const originalSubscribe = form.subscribe;

  return vi.spyOn(form, 'subscribe').mockImplementation((listener) => {
    const unsubscribe = originalSubscribe(listener);

    return () => {
      onCleanup();
      unsubscribe();
    };
  });
};

const trackFieldCleanup = (
  form: Form<TestFormValues>,
  onCleanup: (fieldName: keyof TestFormValues) => void,
) => {
  const originalSubscribeField = form.subscribeField;

  return vi.spyOn(form, 'subscribeField').mockImplementation((fieldName, listener) => {
    const unsubscribe = originalSubscribeField(fieldName, listener);

    return () => {
      onCleanup(fieldName);
      unsubscribe();
    };
  });
};

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

  it('returns the current value immediately when the selected field changes', () => {
    const { result, rerender } = renderHook(
      ({ fieldName }: { fieldName: keyof TestFormValues }) => useFormWatch(form, fieldName),
      { initialProps: { fieldName: 'name' as keyof TestFormValues } },
    );

    rerender({ fieldName: 'age' });

    expect(result.current).toBe(30);
  });

  it('returns the current snapshot immediately when the form source changes', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const { result, rerender } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) => useFormWatch(source),
      { initialProps: { source: form } },
    );

    rerender({ source: nextForm });

    expect(result.current).toEqual({ name: 'Jane', age: 25 });
  });

  it('returns the selected field immediately when its form source changes', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const unsubscribeFirst = vi.fn();
    trackFieldCleanup(form, unsubscribeFirst);
    let renderCount = 0;
    const { result, rerender } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) => {
        renderCount += 1;
        return useFormWatch(source, 'name');
      },
      { initialProps: { source: form } },
    );

    rerender({ source: nextForm });

    expect(result.current).toBe('Jane');
    expect(renderCount).toBe(2);
    expect(unsubscribeFirst).toHaveBeenCalledOnce();
    expect(unsubscribeFirst).toHaveBeenCalledWith('name');

    act(() => form.setValue('name', 'Ignored'));

    expect(result.current).toBe('Jane');
    expect(renderCount).toBe(2);
  });

  it('isolates a field watcher and renders once for a selected-field change', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormWatch(form, 'name');
    });

    act(() => form.setValue('age', 31));

    expect(result.current).toBe('John');
    expect(renderCount).toBe(1);

    act(() => form.setValue('name', 'Jane'));

    expect(result.current).toBe('Jane');
    expect(renderCount).toBe(2);
  });

  it('renders a whole-form watcher once per commit and not for a no-op', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useFormWatch(form);
    });

    act(() => form.setValue('age', 31));

    expect(result.current).toEqual({ name: 'John', age: 31 });
    expect(renderCount).toBe(2);

    act(() => form.setValue('age', 31));

    expect(renderCount).toBe(2);
  });

  it('unsubscribes the previous field when the selected field changes', () => {
    const unsubscribe = vi.fn();
    trackFieldCleanup(form, unsubscribe);
    const { rerender, unmount } = renderHook(
      ({ fieldName }: { fieldName: keyof TestFormValues }) => useFormWatch(form, fieldName),
      { initialProps: { fieldName: 'name' as keyof TestFormValues } },
    );

    rerender({ fieldName: 'age' });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenLastCalledWith('name');

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenLastCalledWith('age');
  });

  it('unsubscribes the previous source when the form changes', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const unsubscribeFirst = vi.fn();
    const unsubscribeNext = vi.fn();
    trackFormCleanup(form, unsubscribeFirst);
    trackFormCleanup(nextForm, unsubscribeNext);
    const { result, rerender, unmount } = renderHook(
      ({ source }: { source: Form<TestFormValues> }) => useFormWatch(source),
      { initialProps: { source: form } },
    );

    rerender({ source: nextForm });

    expect(unsubscribeFirst).toHaveBeenCalledTimes(1);
    act(() => form.setValue('name', 'Ignored'));
    expect(result.current).toEqual({ name: 'Jane', age: 25 });

    unmount();

    expect(unsubscribeNext).toHaveBeenCalledTimes(1);
  });

  it('catches an update that occurs while the subscription is committed', () => {
    const originalSubscribe = form.subscribe;
    let didUpdate = false;
    vi.spyOn(form, 'subscribe').mockImplementation((listener) => {
      if (!didUpdate) {
        didUpdate = true;
        form.setValue('age', 31);
      }

      return originalSubscribe(listener);
    });

    const { result } = renderHook(() => useFormWatch(form));

    expect(result.current).toEqual({ name: 'John', age: 31 });
  });

  it('does not tear when the form changes between snapshot reads', () => {
    let shouldUpdateBetweenReads = true;
    const { result } = renderHook(() => {
      const firstSnapshot = useFormWatch(form);

      if (shouldUpdateBetweenReads) {
        shouldUpdateBetweenReads = false;
        form.setValue('age', 31);
      }

      const secondSnapshot = useFormWatch(form);

      return [firstSnapshot.age, secondSnapshot.age];
    });

    expect(result.current).toEqual([31, 31]);
  });

  it('keeps the committed source when a replacement render is abandoned', () => {
    const nextForm = createForm<TestFormValues>({ name: 'Jane', age: 25 });
    const unsubscribeFirst = vi.fn();
    const firstSubscribe = trackFormCleanup(form, unsubscribeFirst);
    const nextSubscribe = vi.spyOn(nextForm, 'subscribe');
    const suspended = new Promise<void>(() => {
      // This render is intentionally abandoned while suspended.
    });
    const wrapper = ({ children }: PropsWithChildren<Record<never, never>>) =>
      createElement(Suspense, { fallback: null }, children);
    const { result, rerender, unmount } = renderHook(
      ({ source, shouldSuspend }: { source: Form<TestFormValues>; shouldSuspend: boolean }) => {
        const values = useFormWatch(source);

        if (shouldSuspend) {
          throw suspended;
        }

        return values;
      },
      {
        initialProps: { source: form, shouldSuspend: false },
        wrapper,
      },
    );

    rerender({ source: nextForm, shouldSuspend: true });

    expect(result.current).toEqual({ name: 'John', age: 30 });
    expect(firstSubscribe).toHaveBeenCalledTimes(1);
    expect(unsubscribeFirst).not.toHaveBeenCalled();
    expect(nextSubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribeFirst).toHaveBeenCalledTimes(1);
  });

  it('balances subscriptions and cleanup under Strict Mode', () => {
    const unsubscribe = vi.fn();
    const subscribe = trackFormCleanup(form, unsubscribe);
    const { unmount } = renderHook(() => useFormWatch(form), {
      wrapper: StrictModeWrapper,
    });

    unmount();

    expect(subscribe).toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledTimes(subscribe.mock.calls.length);
  });

  it('does not retain callbacks across repeated Strict Mode mount cycles', () => {
    const retainedCallback = vi.fn();
    const originalSubscribe = form.subscribe;
    vi.spyOn(form, 'subscribe').mockImplementation((listener) =>
      originalSubscribe(() => {
        retainedCallback();
        listener(form.values, form.prevValues);
      }),
    );

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const { unmount } = renderHook(() => useFormWatch(form), {
        wrapper: StrictModeWrapper,
      });
      unmount();
    }

    act(() => form.setValue('age', 31));

    expect(retainedCallback).not.toHaveBeenCalled();
  });

  it('uses the current form snapshot for server rendering and hydration', async () => {
    const Watcher = () => createElement('span', null, useFormWatch(form).name);
    const markup = renderToString(createElement(Watcher));
    const container = (globalThis as any).document.createElement('div');
    container.innerHTML = markup;
    const recoverableErrors: unknown[] = [];

    expect(container.textContent).toBe('John');

    const root = hydrateRoot(container, createElement(Watcher), {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
    await act(async () => undefined);

    expect(container.textContent).toBe('John');
    expect(recoverableErrors).toEqual([]);

    act(() => root.unmount());
  });
});

import { useCallback, useSyncExternalStore } from 'react';
import type { Form, FormValues } from '@avinlab/form';

// Overloading functions
export function useFormWatch<TFormValues extends FormValues, TFieldName extends keyof TFormValues>(
  form: Form<TFormValues>,
  fieldName: TFieldName,
): TFormValues[TFieldName];
export function useFormWatch<TFormValues extends FormValues>(form: Form<TFormValues>): TFormValues;

export function useFormWatch<TFormValues extends FormValues, TFieldName extends keyof TFormValues>(
  form: Form<TFormValues>,
  fieldName?: TFieldName,
) {
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      fieldName !== undefined
        ? form.subscribeField(fieldName, onStoreChange)
        : form.subscribe(onStoreChange),
    [fieldName, form],
  );
  const getSnapshot = useCallback(
    () => (fieldName !== undefined ? form.values[fieldName] : form.values),
    [fieldName, form],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

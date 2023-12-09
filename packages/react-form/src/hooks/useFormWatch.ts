import { useState, useEffect } from 'react';
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
  const [value, setValue] = useState(
    fieldName !== undefined ? form.values[fieldName] : form.values,
  );

  useEffect(() => {
    const handleUpdate = (v: any) => {
      setValue(v);
    };

    if (fieldName !== undefined) {
      form.onUpdateField(fieldName, handleUpdate);
    } else {
      form.onUpdate(handleUpdate);
    }

    return () => {
      if (fieldName !== undefined) {
        form.offUpdateField(fieldName, handleUpdate);
      } else {
        form.offUpdate(handleUpdate);
      }
    };
  }, [fieldName, form]);

  return value;
}

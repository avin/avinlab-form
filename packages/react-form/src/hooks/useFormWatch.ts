import { useState, useEffect } from 'react';
import type { Form, FormValues } from '@avinlab/form';

// Перегрузки функции
export function useFormWatch<TFormValues extends FormValues, TFieldName extends keyof TFormValues>(
  form: Form<TFormValues>,
  fieldName: TFieldName,
): TFormValues[TFieldName];
export function useFormWatch<TFormValues extends FormValues>(form: Form<TFormValues>): TFormValues;

// Реализация функции
export function useFormWatch<TFormValues extends FormValues, TFieldName extends keyof TFormValues>(
  form: Form<TFormValues>,
  fieldName?: TFieldName,
) {
  const [value, setValue] = useState(
    fieldName !== undefined ? form.values[fieldName] : form.values,
  );

  useEffect(() => {
    const handleUpdate = (newValues: any) => {
      if (fieldName !== undefined) {
        setValue(newValues[fieldName]);
      } else {
        setValue(newValues);
      }
    };

    if (fieldName !== undefined) {
      form.onUpdateField(fieldName, handleUpdate as any);
    } else {
      form.onUpdate(handleUpdate as any);
    }

    return () => {
      if (fieldName !== undefined) {
        form.offUpdateField(fieldName, handleUpdate as any);
      } else {
        form.offUpdate(handleUpdate as any);
      }
    };
  }, [fieldName, form]);

  return value;
}

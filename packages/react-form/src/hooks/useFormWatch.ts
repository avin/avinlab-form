import { useState, useEffect } from 'react';
import type { Form, FormValues } from '@avinlab/form';

export const useFormWatch = <TFormValues extends FormValues, TFieldName extends keyof TFormValues>(
  form: Form<TFormValues>,
  fieldName?: TFieldName,
) => {
  const [value, setValue] = useState<TFormValues[TFieldName] | TFormValues>(
    fieldName ? form.values[fieldName] : form.values,
  );

  useEffect(() => {
    const handleUpdate = (v: TFormValues[TFieldName] | TFormValues) => {
      setValue(v);
    };

    if (fieldName) {
      form.onUpdateField(fieldName, handleUpdate);
    } else {
      form.onUpdate(handleUpdate as any); // The casting to 'any' might be necessary if onUpdate doesn't expect a handler with two parameters.
    }

    // Return a cleanup function to unregister the handler
    return () => {
      if (fieldName) {
        form.offUpdateField(fieldName, handleUpdate);
      } else {
        form.offUpdate(handleUpdate as any);
      }
    };
  }, [fieldName, form]);

  return value;
};

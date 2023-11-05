import { useState, useEffect } from 'react';
import type { Form } from '@avinlab/form';

export const useFormWatch = <T extends Record<string, any>>(form: Form, fieldName?: keyof T) => {
  const [value, setValue] = useState<T[keyof T] | T>(
    fieldName ? form.values[fieldName as string] : form.values,
  );

  useEffect(() => {
    const handleUpdate = (v: any) => {
      setValue(v);
    };

    if (fieldName) {
      form.onUpdateField(fieldName as string, handleUpdate);
    } else {
      form.onUpdate(handleUpdate); // The casting to 'any' might be necessary if onUpdate doesn't expect a handler with two parameters.
    }

    // Return a cleanup function to unregister the handler
    return () => {
      if (fieldName) {
        form.offUpdateField(fieldName as string, handleUpdate);
      } else {
        form.offUpdate(handleUpdate); // Similarly, casting to 'any' might be necessary here.
      }
    };
  }, [fieldName, form]);

  return value;
};

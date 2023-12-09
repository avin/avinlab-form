import { useRef } from 'react';
import { createForm } from '@avinlab/form';
import type { Form, FormValues } from '@avinlab/form';

export const useForm = <TFormValues extends FormValues>(
  initialValues: TFormValues,
): Form<TFormValues> => {
  const formRef = useRef<Form<TFormValues> | null>(null);
  formRef.current = formRef.current || createForm(initialValues);

  return formRef.current;
};

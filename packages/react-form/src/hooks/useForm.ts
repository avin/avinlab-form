import { useRef } from 'react';
import { createForm } from '@avinlab/form';
import type { Form } from '@avinlab/form';

export const useForm = (initialValues: Record<string, any>): Form => {
  const formRef = useRef<Form | null>(null);
  formRef.current = formRef.current || createForm(initialValues);

  return formRef.current;
};

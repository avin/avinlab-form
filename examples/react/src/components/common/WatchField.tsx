import type React from 'react';
import type { Form, FormValues } from '@avinlab/form';
import { useFormWatch } from '@avinlab/react-form';

interface Props<TFormValues extends FormValues, TFieldName extends keyof TFormValues> {
  form: Form<TFormValues>;
  name: TFieldName;
  children: (fieldValue: TFormValues[TFieldName]) => React.ReactNode;
}

export function WatchField<TFormValues extends FormValues, TFieldName extends keyof TFormValues>({
  form,
  name,
  children,
}: Props<TFormValues, TFieldName>) {
  const val = useFormWatch(form, name);
  const content = children(val) || null;
  return content;
}

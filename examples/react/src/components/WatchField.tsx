import type React from 'react';
import type { Form } from '@avinlab/form';
import { useFormWatch } from '@avinlab/react-form';

interface Props {
  form: Form;
  name: string;
  children: (fieldValue: any) => React.ReactNode;
}

export function WatchField({ form, name, children }: Props) {
  const val = useFormWatch(form, name);
  return children(val);
}

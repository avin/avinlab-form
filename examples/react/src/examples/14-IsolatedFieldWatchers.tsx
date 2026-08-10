import { useRef } from 'react';
import type { Form } from '@avinlab/form';
import { useForm, useFormWatch } from '@avinlab/react-form';

interface Values {
  first: string;
  second: string;
}

function Field({ form, name }: { form: Form<Values>; name: keyof Values }) {
  const value = useFormWatch(form, name);
  const renders = useRef(0);
  renders.current += 1;

  return (
    <label>
      {name} · renders {renders.current}
      <input value={value} onChange={(event) => form.setValue(name, event.currentTarget.value)} />
    </label>
  );
}

export function IsolatedFieldWatchers() {
  const form = useForm<Values>({ first: '', second: '' });

  return (
    <div className="demo-stack">
      <Field form={form} name="first" />
      <Field form={form} name="second" />
    </div>
  );
}

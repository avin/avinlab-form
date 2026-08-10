import type { ChangeEvent } from 'react';
import { createFormComponent, useForm } from '@avinlab/react-form';

interface TextInputProps {
  label: string;
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({ label, ...inputProps }: TextInputProps) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

const FormTextInput = createFormComponent(TextInput, {
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

export function GeneratedTextInput() {
  const form = useForm({ firstName: '', lastName: '' });

  return (
    <div className="demo-stack">
      <FormTextInput form={form} name="firstName" label="First name" />
      <FormTextInput form={form} name="lastName" label="Last name" />
    </div>
  );
}

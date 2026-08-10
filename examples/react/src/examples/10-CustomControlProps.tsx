import type { ChangeEvent } from 'react';
import { createFormComponent, useForm } from '@avinlab/react-form';

interface ToggleProps {
  checked: boolean;
  label: string;
  name?: string;
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Toggle({ checked, label, name, onToggle }: ToggleProps) {
  return (
    <label className="inline-control">
      <input type="checkbox" checked={checked} name={name} onChange={onToggle} />
      {label}
    </label>
  );
}

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});

export function CustomControlProps() {
  const form = useForm({ accepted: false });

  return <FormToggle form={form} name="accepted" label="Accept terms" />;
}

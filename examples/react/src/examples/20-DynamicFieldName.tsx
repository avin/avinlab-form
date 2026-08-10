import { useState } from 'react';
import { useForm, useFormWatch } from '@avinlab/react-form';

interface Values {
  name: string;
  city: string;
}

export function DynamicFieldName() {
  const form = useForm<Values>({ name: 'Ada', city: 'London' });
  const [field, setField] = useState<keyof Values>('name');
  const value = useFormWatch(form, field);

  return (
    <div className="demo-stack">
      <select
        value={field}
        onChange={(event) => setField(event.currentTarget.value as keyof Values)}
      >
        <option value="name">name</option>
        <option value="city">city</option>
      </select>
      <output>{value}</output>
    </div>
  );
}

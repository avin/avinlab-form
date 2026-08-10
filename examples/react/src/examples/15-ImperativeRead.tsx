import { useState } from 'react';
import { useForm } from '@avinlab/react-form';

export function ImperativeRead() {
  const form = useForm({ query: '' });
  const [submitted, setSubmitted] = useState('Nothing submitted');

  return (
    <div className="demo-stack">
      <input
        aria-label="Query"
        defaultValue={form.values.query}
        onChange={(event) => form.setValue('query', event.currentTarget.value)}
      />
      <button type="button" onClick={() => setSubmitted(form.values.query)}>
        Read form.values
      </button>
      <output>{submitted}</output>
    </div>
  );
}

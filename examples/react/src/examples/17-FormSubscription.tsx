import { useEffect, useState } from 'react';
import { useForm } from '@avinlab/react-form';

export function FormSubscription() {
  const form = useForm({ page: 1, filter: 'all' });
  const [commits, setCommits] = useState(0);

  useEffect(() => form.subscribe(() => setCommits((count) => count + 1)), [form]);

  return (
    <div className="demo-stack">
      <button type="button" onClick={() => form.setValue('page', form.values.page + 1)}>
        Next page
      </button>
      <output>Successful commits: {commits}</output>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from '@avinlab/react-form';

export function NoOpUpdates() {
  const form = useForm({ score: 10 });
  const [commits, setCommits] = useState(0);

  useEffect(() => form.subscribe(() => setCommits((count) => count + 1)), [form]);

  return (
    <div className="demo-stack">
      <div className="button-row">
        <button type="button" onClick={() => form.setValue('score', form.values.score)}>
          Set current value
        </button>
        <button type="button" onClick={() => form.setValue('score', form.values.score + 1)}>
          Increment
        </button>
      </div>
      <output>Commits: {commits}</output>
    </div>
  );
}

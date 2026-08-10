import { useRef } from 'react';
import { useForm } from '@avinlab/react-form';

export function UncontrolledField() {
  const form = useForm({ note: 'No watcher is mounted' });
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div className="demo-stack">
      <label>
        Note
        <input
          defaultValue={form.values.note}
          onChange={(event) => form.setValue('note', event.currentTarget.value)}
        />
      </label>
      <output>Owner renders: {renders.current}</output>
    </div>
  );
}

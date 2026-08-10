import { useEffect, useState } from 'react';
import { useForm } from '@avinlab/react-form';

export function FieldSubscription() {
  const form = useForm({ search: '' });
  const [events, setEvents] = useState<string[]>([]);

  useEffect(
    () =>
      form.subscribeField('search', (value, previousValue) => {
        setEvents((items) => [`${previousValue || '∅'} → ${value || '∅'}`, ...items].slice(0, 3));
      }),
    [form],
  );

  return (
    <div className="demo-stack">
      <input
        aria-label="Search"
        defaultValue={form.values.search}
        onChange={(event) => form.setValue('search', event.currentTarget.value)}
      />
      <output>{events.join(' · ') || 'No field events'}</output>
    </div>
  );
}

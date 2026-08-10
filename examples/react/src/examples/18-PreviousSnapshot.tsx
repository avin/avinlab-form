import { useEffect, useState } from 'react';
import { useForm } from '@avinlab/react-form';

export function PreviousSnapshot() {
  const form = useForm({ plan: 'Free' });
  const [transition, setTransition] = useState('No transition yet');

  useEffect(
    () =>
      form.subscribe((values, previousValues) => {
        setTransition(`${previousValues.plan} → ${values.plan}`);
      }),
    [form],
  );

  return (
    <div className="demo-stack">
      <button type="button" onClick={() => form.setValue('plan', 'Pro')}>
        Upgrade
      </button>
      <output>{transition}</output>
    </div>
  );
}

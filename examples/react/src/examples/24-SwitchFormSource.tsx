import { createForm } from '@avinlab/form';
import { useState } from 'react';
import { useFormWatch } from '@avinlab/react-form';

const personal = createForm({ email: 'ada@personal.test' });
const work = createForm({ email: 'ada@work.test' });

export function SwitchFormSource() {
  const [source, setSource] = useState(personal);
  const email = useFormWatch(source, 'email');

  return (
    <div className="demo-stack">
      <button type="button" onClick={() => setSource(source === personal ? work : personal)}>
        Switch controller
      </button>
      <output>{email}</output>
    </div>
  );
}

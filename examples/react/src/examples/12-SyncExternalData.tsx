import { useEffect, useState } from 'react';
import { useForm, useFormWatch } from '@avinlab/react-form';

const profiles = {
  ada: { name: 'Ada', city: 'London' },
  grace: { name: 'Grace', city: 'New York' },
};

export function SyncExternalData() {
  const [profile, setProfile] = useState(profiles.ada);
  const form = useForm(profile);
  const values = useFormWatch(form);

  useEffect(() => {
    form.setValues(profile);
  }, [form, profile]);

  return (
    <div className="demo-stack">
      <div className="button-row">
        <button type="button" onClick={() => setProfile(profiles.ada)}>
          Ada
        </button>
        <button type="button" onClick={() => setProfile(profiles.grace)}>
          Grace
        </button>
      </div>
      <output>
        {values.name} · {values.city}
      </output>
    </div>
  );
}

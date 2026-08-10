import { useForm, useFormWatch } from '@avinlab/react-form';

const initialProfile = { name: 'Ada', role: 'Engineer' };

export function ReplaceSnapshot() {
  const form = useForm(initialProfile);
  const values = useFormWatch(form);

  return (
    <div className="demo-stack">
      <input
        aria-label="Name"
        value={values.name}
        onChange={(event) => form.setValue('name', event.currentTarget.value)}
      />
      <button type="button" onClick={() => form.setValues(initialProfile)}>
        Reset the complete form
      </button>
    </div>
  );
}

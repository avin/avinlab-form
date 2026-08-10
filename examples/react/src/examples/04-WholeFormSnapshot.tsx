import { useForm, useFormWatch } from '@avinlab/react-form';

export function WholeFormSnapshot() {
  const form = useForm({ city: 'Istanbul', country: 'Türkiye' });
  const values = useFormWatch(form);

  return (
    <div className="demo-stack">
      <input
        aria-label="City"
        value={values.city}
        onChange={(event) => form.setValue('city', event.currentTarget.value)}
      />
      <output>{JSON.stringify(values)}</output>
    </div>
  );
}

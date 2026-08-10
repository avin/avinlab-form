import { useForm, useFormWatch } from '@avinlab/react-form';

export function ReplaceNestedValue() {
  const form = useForm({ address: { city: 'London', zip: 'SW1A' } });
  const address = useFormWatch(form, 'address');

  return (
    <label>
      City
      <input
        value={address.city}
        onChange={(event) =>
          form.setValue('address', { ...address, city: event.currentTarget.value })
        }
      />
    </label>
  );
}

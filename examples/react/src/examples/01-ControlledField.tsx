import { useForm, useFormWatch } from '@avinlab/react-form';

export function ControlledField() {
  const form = useForm({ name: '' });
  const name = useFormWatch(form, 'name');

  return (
    <label>
      Name
      <input
        value={name}
        onChange={(event) => form.setValue('name', event.currentTarget.value)}
        placeholder="Ada Lovelace"
      />
    </label>
  );
}

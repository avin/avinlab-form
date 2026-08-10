import type { Form } from '@avinlab/form';
import { useForm, useFormWatch } from '@avinlab/react-form';

interface Profile {
  name: string;
  city: string;
}

function NameField({ form }: { form: Form<Profile> }) {
  const name = useFormWatch(form, 'name');
  return (
    <input
      aria-label="Name"
      value={name}
      onChange={(event) => form.setValue('name', event.currentTarget.value)}
    />
  );
}

export function ComposeWithFormProp() {
  const form = useForm<Profile>({ name: '', city: '' });

  return <NameField form={form} />;
}

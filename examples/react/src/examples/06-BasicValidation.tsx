import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface Errors {
  email?: string;
}

const validate = (values: Readonly<{ email: string }>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Enter a valid email',
});

export function BasicValidation() {
  const form = useForm({ email: '' });
  const email = useFormWatch(form, 'email');
  const validation = useFormValidation(form, validate);

  return (
    <div className="demo-stack">
      <label>
        Email
        <input
          value={email}
          onChange={(event) => form.setValue('email', event.currentTarget.value)}
        />
      </label>
      {validation.errors.email && <span role="alert">{validation.errors.email}</span>}
      <button disabled={validation.status !== 'valid'}>Create account</button>
    </div>
  );
}

import { useCallback, useState } from 'react';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface Errors {
  password?: string;
}

export function DynamicValidationRule() {
  const [minimum, setMinimum] = useState(4);
  const form = useForm({ password: '' });
  const password = useFormWatch(form, 'password');
  const validate = useCallback(
    (values: Readonly<{ password: string }>): Errors => ({
      password: values.password.length >= minimum ? undefined : `Use ${minimum} characters`,
    }),
    [minimum],
  );
  const validation = useFormValidation(form, validate);

  return (
    <div className="demo-stack">
      <input
        aria-label="Password"
        value={password}
        onChange={(event) => form.setValue('password', event.currentTarget.value)}
      />
      <button type="button" onClick={() => setMinimum((value) => (value === 4 ? 8 : 4))}>
        Require {minimum === 4 ? 8 : 4}
      </button>
      <output>{validation.errors.password ?? 'Valid'}</output>
    </div>
  );
}

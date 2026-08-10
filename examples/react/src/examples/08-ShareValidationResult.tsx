import type { ValidationResult } from '@avinlab/form';
import { useForm, useFormValidation } from '@avinlab/react-form';

interface Errors {
  name?: string;
}

const validate = (values: Readonly<{ name: string }>): Errors => ({
  name: values.name ? undefined : 'Required',
});

function ErrorMessage({ result }: { result: ValidationResult<Errors> }) {
  return <span role="alert">{result.errors.name}</span>;
}

function SubmitButton({ result }: { result: ValidationResult<Errors> }) {
  return <button disabled={result.status !== 'valid'}>Save</button>;
}

export function ShareValidationResult() {
  const form = useForm({ name: '' });
  const result = useFormValidation(form, validate);

  return (
    <div className="demo-stack">
      <input
        aria-label="Name"
        defaultValue={form.values.name}
        onChange={(event) => form.setValue('name', event.currentTarget.value)}
      />
      <ErrorMessage result={result} />
      <SubmitButton result={result} />
    </div>
  );
}

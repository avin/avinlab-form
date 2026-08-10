import { useEffect, useState } from 'react';
import { createForm, createFormValidation, type ValidationResult } from '@avinlab/form';

interface Errors {
  name?: string;
}
const form = createForm({ name: 'Ada' });
const relaxed = (values: Readonly<{ name: string }>): Errors => ({
  name: values.name ? undefined : 'Required',
});
const strict = (values: Readonly<{ name: string }>): Errors => ({
  name: values.name.length >= 5 ? undefined : 'Use at least 5 characters',
});
const validation = createFormValidation<Errors, { name: string }>(form, relaxed);

export function ReplaceCoreValidator() {
  const [isStrict, setIsStrict] = useState(false);
  const [result, setResult] = useState<ValidationResult<Errors>>(validation.result);

  useEffect(() => validation.subscribe(setResult), []);

  const toggleRule = () => {
    validation.setValidator(isStrict ? relaxed : strict);
    setIsStrict(!isStrict);
  };

  return (
    <div className="demo-stack">
      <button type="button" onClick={toggleRule}>
        Use {isStrict ? 'relaxed' : 'strict'} rule
      </button>
      <output>{result.errors.name ?? 'Ada is accepted'}</output>
    </div>
  );
}

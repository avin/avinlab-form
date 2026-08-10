import { useEffect, useState } from 'react';
import { createForm, createFormValidation, type ValidationResult } from '@avinlab/form';

interface Errors {
  quantity?: string;
}

let available = 5;
const form = createForm({ quantity: 4 });
const validation = createFormValidation<Errors, { quantity: number }>(form, (values) => ({
  quantity: values.quantity <= available ? undefined : `Only ${available} available`,
}));

export function ManualCoreValidation() {
  const [result, setResult] = useState<ValidationResult<Errors>>(validation.result);

  useEffect(() => validation.subscribe(setResult), []);

  const reduceStock = () => {
    available = 2;
    validation.validate();
  };

  return (
    <div className="demo-stack">
      <button type="button" onClick={reduceStock}>
        Reduce external stock to 2
      </button>
      <output>{result.errors.quantity ?? 'Quantity is available'}</output>
    </div>
  );
}

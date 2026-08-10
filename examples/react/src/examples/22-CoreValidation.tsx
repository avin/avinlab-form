import { useEffect, useState } from 'react';
import { createForm, createFormValidation, type ValidationResult } from '@avinlab/form';

interface Errors {
  quantity?: string;
}

const form = createForm({ quantity: 1 });
const validation = createFormValidation<Errors, { quantity: number }>(form, (values) => ({
  quantity: values.quantity > 0 ? undefined : 'Must be positive',
}));

export function CoreValidation() {
  const [result, setResult] = useState<ValidationResult<Errors>>(validation.result);

  useEffect(() => {
    const unsubscribe = validation.subscribe(setResult);

    return () => {
      unsubscribe();
      validation.dispose();
    };
  }, []);

  return (
    <div className="demo-stack">
      <button type="button" onClick={() => form.setValue('quantity', -1)}>
        Set invalid value
      </button>
      <button type="button" onClick={() => form.setValue('quantity', 1)}>
        Set valid value
      </button>
      <output>
        {result.status}: {result.errors.quantity ?? 'no errors'}
      </output>
    </div>
  );
}

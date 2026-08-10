import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface Errors {
  amount?: string;
}

const validateChange = (
  values: Readonly<{ amount: number }>,
  previousValues: Readonly<{ amount: number }>,
): Errors => ({
  amount:
    Math.abs(values.amount - previousValues.amount) > 10 ? 'Change is limited to 10' : undefined,
});

export function PreviousValuesValidator() {
  const form = useForm({ amount: 10 });
  const amount = useFormWatch(form, 'amount');
  const result = useFormValidation(form, validateChange);

  return (
    <div className="demo-stack">
      <input
        aria-label="Amount"
        type="number"
        value={amount}
        onChange={(event) => form.setValue('amount', event.currentTarget.valueAsNumber || 0)}
      />
      <output>{result.errors.amount ?? 'Accepted change'}</output>
    </div>
  );
}

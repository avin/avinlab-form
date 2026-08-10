import { useForm, useFormWatch } from '@avinlab/react-form';

export function ConvertDomValue() {
  const form = useForm({ age: 18 });
  const age = useFormWatch(form, 'age');

  return (
    <div className="demo-stack">
      <label>
        Age
        <input
          type="number"
          value={age}
          onChange={(event) => form.setValue('age', event.currentTarget.valueAsNumber || 0)}
        />
      </label>
      <output>typeof age: {typeof age}</output>
    </div>
  );
}

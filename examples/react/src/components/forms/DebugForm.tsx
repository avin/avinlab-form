import { useEffect, useState } from 'react';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface DebugFormValues {
  name1: string;
  name2: string;
}

export function DebugForm() {
  const [minLength, setMinLength] = useState(2);
  const form = useForm<DebugFormValues>({
    name1: 'v13',
    name2: 'value2',
  });

  const { errors, isValid, validate } = useFormValidation(form, (values, prevValues) => {
    const errors: Record<string, string> = {};
    if (values.name1.length < minLength) {
      errors.name1 = 'Name1 is too short';
    }
    if (values.name2.length < minLength) {
      errors.name2 = 'Name2 is too short';
    }
    return errors;
  });

  useEffect(() => {
    validate();
  }, [minLength, validate]);

  // const value1 = useWatch(form, 'name1');
  const value1 = '~';
  const value2 = useFormWatch(form, 'name2');
  // const value2 = '~';

  // const formValues = useFormWatch(form);
  // console.log('formValues', formValues);

  console.log('render');

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    console.log(form.values);
  };

  return (
    <div className="p-8">
      <div>
        <div>
          <span className="mr-2">name1:</span>
          <input
            className="input"
            type="text"
            defaultValue={form.values.name1}
            onChange={(e) => {
              form.setValue('name1', e.currentTarget.value);
            }}
          />
          <span className="text-red-500 ml-2">{errors.name1}</span>
        </div>
        <div>{value1}</div>
      </div>
      <div>
        <div>
          <span className="mr-2">name2:</span>
          <input
            className="input"
            type="text"
            defaultValue={form.values.name2}
            onChange={(e) => {
              form.setValue('name2', e.currentTarget.value);
            }}
          />
          <span className="text-red-500 ml-2">{errors.name2}</span>
        </div>
        <div>name2: {value2}</div>
      </div>
      <div>isValid: {String(isValid)}</div>

      <div>
        minLength: {minLength}{' '}
        <button className="btn" onClick={() => setMinLength((v) => v + 1)}>
          +
        </button>
        <button className="btn ml-2" onClick={() => setMinLength((v) => v - 1)}>
          -
        </button>
      </div>

      <button
        className="btn"
        onClick={() => {
          form.setValues({ name1: 'xx', name2: 'yyyy' });
        }}
      >
        SetValues({JSON.stringify({ name1: 'xx', name2: 'yyyy' })})
      </button>

      <br />
      <br />

      <button className="btn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

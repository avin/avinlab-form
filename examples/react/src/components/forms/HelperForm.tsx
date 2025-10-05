import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { createFormComponent, useForm, useFormWatch } from '@avinlab/react-form';

interface HelperFormValues {
  email: string;
  accepted: boolean;
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const TextInput = ({ label, ...props }: TextInputProps) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
    <input className="input w-full" {...props} />
  </label>
);

const FormTextInput = createFormComponent(TextInput, {
  getValue: (e) => e.currentTarget.value,
});

const CheckboxInput = ({ label, ...props }: TextInputProps) => (
  <label className="inline-flex items-center space-x-2">
    <input type="checkbox" {...props} />
    <span>{label}</span>
  </label>
);

const FormCheckboxInput = createFormComponent(CheckboxInput, {
  valueAttrName: 'checked',
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.target.checked,
});

export function HelperForm() {
  const form = useForm<HelperFormValues>({
    email: '',
    accepted: false,
  });

  const formValues = useFormWatch(form);

  return (
    <div className="max-w-md mx-auto my-10">
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border border-gray-200 space-y-4">
        <FormTextInput form={form} name="email" label="Email" placeholder="john@doe.com" />
        <FormCheckboxInput form={form} name="accepted" label="I agree with the terms" />
        <pre className="bg-gray-100 text-sm p-4 rounded">
          {JSON.stringify(formValues, null, 2)}
        </pre>
      </form>
    </div>
  );
}

export default HelperForm;

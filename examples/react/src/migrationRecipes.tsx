import { createForm, createFormValidation, type Form, type ValidationResult } from '@avinlab/form';
import { createFormComponent, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface ProfileValues {
  name: string;
  accepted: boolean;
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const validateProfile = (values: Readonly<ProfileValues>): ProfileErrors => ({
  name: values.name ? undefined : 'Name is required',
});

/** After V5 migration: subscriptions own their disposer at the call site. */
export function runMigratedCoreExample() {
  const form = createForm<ProfileValues>({ name: '', accepted: false });
  const unsubscribeForm = form.subscribe((values, previousValues) => {
    console.log({ values, previousValues });
  });
  const unsubscribeName = form.subscribeField('name', (name, previousName) => {
    console.log({ name, previousName });
  });
  const validation = createFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  const unsubscribeValidation = validation.subscribe((result) => {
    console.log(result.status, result.errors);
  });

  form.setValue('name', 'Ada');
  validation.setValidator((values) => ({
    name: values.name.length >= 2 ? undefined : 'Use at least two characters',
  }));

  unsubscribeValidation();
  unsubscribeName();
  unsubscribeForm();
  validation.dispose();
}

/** After V5 migration: one React hook result is shared by the validation subtree. */
export function MigratedValidation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);

  return (
    <>
      <NameError result={result} />
      <SaveButton result={result} />
    </>
  );
}

function NameError({ result }: { result: ValidationResult<ProfileErrors> }) {
  return <output>{result.errors.name}</output>;
}

function SaveButton({ result }: { result: ValidationResult<ProfileErrors> }) {
  return <button disabled={result.status !== 'valid'}>Save</button>;
}

interface ToggleProps {
  checked: boolean;
  label: string;
  onToggle: (checked: boolean) => void;
}

const Toggle = ({ checked, label, onToggle }: ToggleProps) => (
  <label>
    <input
      checked={checked}
      type="checkbox"
      onChange={(event) => onToggle(event.currentTarget.checked)}
    />
    {label}
  </label>
);

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
});

/** The generated component is optional; direct watch + mutation remains the base interface. */
export function MigratedControls({ form }: { form: Form<ProfileValues> }) {
  const name = useFormWatch(form, 'name');

  return (
    <>
      <input value={name} onChange={(event) => form.setValue('name', event.currentTarget.value)} />
      <FormToggle form={form} name="accepted" label="Accept terms" />
    </>
  );
}

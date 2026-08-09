import { useEffect, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { createForm, createFormValidation, type Form } from '@avinlab/form';
import {
  createFormComponent,
  useForm,
  useFormValidation,
  useFormValidationError,
  useFormValidationState,
  useFormWatch,
} from '@avinlab/react-form';

interface ProfileValues {
  name: string;
  age: number;
  accepted: boolean;
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const validateProfile = (values: Readonly<ProfileValues>): ProfileErrors => ({
  name: values.name ? undefined : 'Name is required',
  age: values.age >= 18 ? undefined : 'Must be at least 18',
});

/** Initial values are one-time; replacing them from an external source is explicit. */
export function SynchronizedProfileForm({
  initialProfile,
  profileFromServer,
}: {
  initialProfile: ProfileValues;
  profileFromServer: ProfileValues;
}) {
  const form = useForm(initialProfile);

  useEffect(() => {
    form.setValues(profileFromServer);
  }, [form, profileFromServer]);

  const values = useFormWatch(form);
  return <output>{JSON.stringify(values)}</output>;
}

/** Core controller, subscription, and validation lifecycle recipe. */
export function runCoreControllerRecipe() {
  const form = createForm<ProfileValues>({ name: 'Bob', age: 20, accepted: false });
  const unsubscribeName = form.subscribeField('name', (name, previousName) => {
    console.log({ name, previousName });
  });
  const unsubscribeForm = form.subscribe((values, previousValues) => {
    console.log({ values, previousValues });
  });
  const validation = createFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);

  form.setValue('name', 'Ada');

  unsubscribeName();
  unsubscribeForm();
  validation.dispose();
}

/** Uncontrolled DOM inputs read initial values and write through the controller. */
export function UncontrolledProfileForm() {
  const form = useForm<ProfileValues>({ name: 'Bob', age: 20, accepted: false });

  return (
    <form>
      <input
        name="name"
        defaultValue={form.values.name}
        onChange={(event) => form.setValue('name', event.currentTarget.value)}
      />
      <input
        name="age"
        type="number"
        defaultValue={form.values.age}
        onChange={(event) => form.setValue('age', Number(event.currentTarget.value))}
      />
    </form>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const TextInput = ({ label, ...props }: TextInputProps) => (
  <label>
    {label}
    <input {...props} />
  </label>
);

const FormTextInput = createFormComponent(TextInput, {
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

interface ToggleProps {
  checked: boolean;
  label: string;
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Toggle = ({ checked, label, onToggle }: ToggleProps) => (
  <label>
    <input type="checkbox" checked={checked} onChange={onToggle} />
    {label}
  </label>
);

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});

/** Generated controls are controlled and subscribe only to their selected field. */
export function ControlledProfileForm() {
  const form = useForm<ProfileValues>({ name: 'Bob', age: 20, accepted: false });

  return (
    <form>
      <FormTextInput form={form} name="name" label="Name" />
      <FormToggle form={form} name="accepted" label="Accept terms" />
    </form>
  );
}

/** Passing another form prop or field prop switches the source on the next render. */
export function FieldWatcher({ form }: { form: Form<ProfileValues> }) {
  const name = useFormWatch(form, 'name');
  return <output>{name}</output>;
}

export function WholeFormWatcher({ form }: { form: Form<ProfileValues> }) {
  const values = useFormWatch(form);
  return <output>{JSON.stringify(values)}</output>;
}

export function CompleteValidation({ form }: { form: Form<ProfileValues> }) {
  const validation = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return <output>{JSON.stringify(validation.errors)}</output>;
}

export function AgeError({ form }: { form: Form<ProfileValues> }) {
  const ageError = useFormValidationError<ProfileErrors, ProfileValues, 'age'>(
    form,
    validateProfile,
    'age',
  );
  return <output>{ageError}</output>;
}

export function SubmitButton({ form }: { form: Form<ProfileValues> }) {
  const state = useFormValidationState<ProfileErrors, ProfileValues>(form, validateProfile);
  return <button disabled={state !== 'valid'}>Save</button>;
}

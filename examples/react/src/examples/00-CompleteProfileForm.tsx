import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Form } from '@avinlab/form';
import { createFormComponent, useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

interface ProfileValues {
  name: string;
  email: string;
  plan: 'personal' | 'team';
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const profiles = {
  available: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    plan: 'personal',
  },
  rejected: {
    name: 'Grace Hopper',
    email: 'taken@example.com',
    plan: 'team',
  },
} satisfies Record<string, ProfileValues>;

const validateProfile = (values: Readonly<ProfileValues>): ProfileErrors => ({
  name: values.name.trim() ? undefined : 'Enter a name',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? undefined : 'Enter a valid email',
});

const saveProfile = async (values: Readonly<ProfileValues>) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return values.email === 'taken@example.com'
    ? { ok: false as const, message: 'This email is already registered' }
    : { ok: true as const, message: `Saved ${values.name}` };
};

interface ProfileInputProps {
  error?: string;
  errorId?: string;
  disabled: boolean;
  label: string;
  name?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'email' | 'text';
  value: string;
}

function ProfileInput({ error, errorId, label, ...inputProps }: ProfileInputProps) {
  return (
    <label>
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

const FormProfileInput = createFormComponent(ProfileInput, {
  getValue: (event: ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

function PlanField({ disabled, form }: { disabled: boolean; form: Form<ProfileValues> }) {
  const plan = useFormWatch(form, 'plan');

  return (
    <label>
      Plan
      <select
        disabled={disabled}
        name="plan"
        value={plan}
        onChange={(event) =>
          form.setValue('plan', event.currentTarget.value as ProfileValues['plan'])
        }
      >
        <option value="personal">Personal</option>
        <option value="team">Team</option>
      </select>
    </label>
  );
}

export function CompleteProfileForm() {
  const form = useForm<ProfileValues>(profiles.available);
  const validation = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  const [baseline, setBaseline] = useState<ProfileValues>(profiles.available);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string>();
  const [didSave, setDidSave] = useState(false);

  const loadProfile = (profile: ProfileValues) => {
    setBaseline(profile);
    setServerMessage(undefined);
    setDidSave(false);
    form.setValues(profile);
  };

  const reset = () => {
    setServerMessage(undefined);
    setDidSave(false);
    form.setValues(baseline);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validation.status !== 'valid' || isSubmitting) return;

    setIsSubmitting(true);
    setServerMessage(undefined);
    setDidSave(false);

    const submittedValues = form.values;
    const response = await saveProfile(submittedValues);

    setServerMessage(response.message);
    setDidSave(response.ok);
    setIsSubmitting(false);

    if (response.ok) {
      setBaseline({ ...submittedValues });
    }
  };

  return (
    <form className="demo-stack" onSubmit={submit}>
      <div className="button-row">
        <button
          disabled={isSubmitting}
          type="button"
          onClick={() => loadProfile(profiles.available)}
        >
          Load available profile
        </button>
        <button
          disabled={isSubmitting}
          type="button"
          onClick={() => loadProfile(profiles.rejected)}
        >
          Load server-rejected profile
        </button>
      </div>

      <FormProfileInput
        disabled={isSubmitting}
        error={validation.errors.name}
        errorId="complete-profile-name-error"
        form={form}
        label="Name"
        name="name"
      />
      <FormProfileInput
        disabled={isSubmitting}
        error={validation.errors.email}
        errorId="complete-profile-email-error"
        form={form}
        label="Email"
        name="email"
        type="email"
      />
      <PlanField disabled={isSubmitting} form={form} />

      <output>Client validation: {validation.status}</output>
      {serverMessage &&
        (didSave ? (
          <output>{serverMessage}</output>
        ) : (
          <span role="alert">Server: {serverMessage}</span>
        ))}

      <div className="button-row">
        <button disabled={validation.status !== 'valid' || isSubmitting} type="submit">
          {isSubmitting ? 'Saving…' : 'Save profile'}
        </button>
        <button disabled={isSubmitting} type="button" onClick={reset}>
          Reset loaded values
        </button>
      </div>
    </form>
  );
}

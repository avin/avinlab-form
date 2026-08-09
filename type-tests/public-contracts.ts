import { createForm, createFormValidation } from '@avinlab/form';
import type { ValidationState } from '@avinlab/form';
import * as ReactForm from '@avinlab/react-form';
import type { FormComponentProps } from '@avinlab/react-form';

interface TextInputProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

const form = createForm({ accepted: false, email: 'first@example.com' });
const validation = createFormValidation<{ email?: string }, typeof form.values>(form, (values) =>
  values.email.includes('@') ? {} : { email: 'Invalid email' },
);
const state: ValidationState = validation.state;

const validBinding: FormComponentProps<typeof form.values, TextInputProps> = {
  form,
  label: 'Email',
  name: 'email',
};

// @ts-expect-error Public snapshots are readonly; updates go through the controller.
form.values.email = 'next@example.com';
// @ts-expect-error Previous snapshots are readonly too.
form.prevValues.email = 'previous@example.com';
// @ts-expect-error Validation errors are readonly snapshots.
validation.errors.email = 'Changed externally';
// @ts-expect-error ValidationState has exactly three supported values.
const unsupportedState: ValidationState = 'pending';
const invalidBinding: FormComponentProps<typeof form.values, TextInputProps> = {
  form,
  label: 'Accepted',
  // @ts-expect-error A boolean field cannot bind to a string value/change contract.
  name: 'accepted',
};

void invalidBinding;
void state;
void unsupportedState;
void validBinding;
void ReactForm.useFormValidationState;

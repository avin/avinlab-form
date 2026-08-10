import { createForm, createFormValidation } from '@avinlab/form';
import type { ValidationResult, ValidationStatus } from '@avinlab/form';
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
const result: ValidationResult<{ email?: string }> = validation.result;
const status: ValidationStatus = result.status;

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
validation.result.errors.email = 'Changed externally';
// @ts-expect-error Validation status is readonly on the complete snapshot.
validation.result.status = 'valid';
// @ts-expect-error ValidationStatus has exactly three supported values.
const unsupportedStatus: ValidationStatus = 'pending';
// @ts-expect-error The controller exposes only its complete validation result.
validation.errors;
// @ts-expect-error Validation status is part of the complete result, not a separate property.
validation.state;
// @ts-expect-error Boolean validity is not part of the validation controller.
validation.isValid;
// @ts-expect-error The old validator-replacement name has no compatibility alias.
validation.setValidation(() => ({}));
const invalidBinding: FormComponentProps<typeof form.values, TextInputProps> = {
  form,
  label: 'Accepted',
  // @ts-expect-error A boolean field cannot bind to a string value/change contract.
  name: 'accepted',
};

void invalidBinding;
void status;
void unsupportedStatus;
void validBinding;
// @ts-expect-error The lifecycle-state reader was replaced by status terminology.
ReactForm.useFormValidationState;
void ReactForm.useFormValidationError;
void ReactForm.useFormValidationStatus;

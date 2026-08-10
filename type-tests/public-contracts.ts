import { createForm, createFormValidation } from '@avinlab/form';
import type { ValidationResult, ValidationStatus } from '@avinlab/form';
import * as ReactForm from '@avinlab/react-form';

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

const FormTextInput = ReactForm.createFormComponent((_props: TextInputProps) => null);
const validBinding = FormTextInput({
  form,
  label: 'Email',
  name: 'email',
});

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
const invalidBinding = FormTextInput({
  form,
  label: 'Accepted',
  // @ts-expect-error A boolean field cannot bind to a string value/change contract.
  name: 'accepted',
});

void invalidBinding;
void status;
void unsupportedStatus;
void validBinding;
// @ts-expect-error The lifecycle-state reader was replaced by status terminology.
ReactForm.useFormValidationState;
// @ts-expect-error Selective error readers are not part of the public React validation workflow.
ReactForm.useFormValidationError;
// @ts-expect-error Selective status readers are not part of the public React validation workflow.
ReactForm.useFormValidationStatus;
// @ts-expect-error Generated-control binding details are internal.
ReactForm.useFormControlProps;
// @ts-expect-error Generated component props are inferred, not a public named concept.
type RemovedFormComponentProps = import('@avinlab/react-form').FormComponentProps;
// @ts-expect-error Generated component options are inferred, not a public named concept.
type RemovedFormInputControlOptions = import('@avinlab/react-form').FormInputControlOptions;

void (null as unknown as RemovedFormComponentProps);
void (null as unknown as RemovedFormInputControlOptions);

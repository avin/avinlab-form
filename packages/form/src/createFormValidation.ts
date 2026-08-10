import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form, FormValues } from './createForm';

export type FormErrors = Record<string, any>;
export type ValidationStatus = 'unvalidated' | 'valid' | 'invalid';

export interface ValidationResult<TFormErrors extends FormErrors> {
  readonly status: ValidationStatus;
  readonly errors: Readonly<TFormErrors>;
}

export type ValidationFunction<TFormErrors extends FormErrors, TFormValues extends FormValues> = (
  values: Readonly<TFormValues>,
  prevValues: Readonly<TFormValues>,
) => TFormErrors;

type ValidateHandler<TFormErrors extends FormErrors> = (
  result: ValidationResult<TFormErrors>,
) => void;
type Unsubscribe = () => void;

export interface FormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  readonly result: ValidationResult<TFormErrors>;
  validate: () => void;
  /** Replacing the validator recalculates the current form snapshot synchronously. */
  setValidator: (validator: ValidationFunction<TFormErrors, TFormValues>) => void;
  subscribe: (cb: ValidateHandler<TFormErrors>) => Unsubscribe;
  dispose: () => void;
}

const emptyErrors = Object.freeze({});
const emptyUnvalidatedResult = Object.freeze({
  status: 'unvalidated' as const,
  errors: emptyErrors,
});

const getUnvalidatedResult = <TFormErrors extends FormErrors>() =>
  emptyUnvalidatedResult as ValidationResult<TFormErrors>;

export const createFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validator?: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  const validateHandlers = new Set<ValidateHandler<TFormErrors>>();
  let result = getUnvalidatedResult<TFormErrors>();
  let currentValidator: ValidationFunction<TFormErrors, TFormValues> | null = null;
  let isDisposed = false;
  let unsubscribeForm: Unsubscribe = () => {};

  const normalizeErrors = (newErrors: TFormErrors): Readonly<TFormErrors> =>
    Object.freeze(
      Object.fromEntries(Object.entries(newErrors).filter(([, value]) => value !== undefined)),
    ) as Readonly<TFormErrors>;

  const calculateErrors = (
    validationFunction: ValidationFunction<TFormErrors, TFormValues>,
  ): Readonly<TFormErrors> => {
    const returnedErrors = validationFunction(form.values, form.prevValues);

    if (typeof returnedErrors !== 'object' || returnedErrors === null) {
      throw new Error('Validation function has to return an object');
    }

    return normalizeErrors(returnedErrors);
  };

  const publish = (nextResult: ValidationResult<TFormErrors>) => {
    if (result.status === nextResult.status && objectsAreEqual(result.errors, nextResult.errors)) {
      return;
    }

    result = nextResult;
    [...validateHandlers].forEach((cb) => cb(result));
  };

  const publishErrors = (errors: Readonly<TFormErrors>) => {
    publish(
      Object.freeze({
        status: Object.keys(errors).length ? 'invalid' : 'valid',
        errors,
      }),
    );
  };

  const validate = () => {
    if (isDisposed || !currentValidator) {
      return;
    }

    let errors: Readonly<TFormErrors>;
    try {
      errors = calculateErrors(currentValidator);
    } catch (error) {
      publish(getUnvalidatedResult<TFormErrors>());
      throw error;
    }

    publishErrors(errors);
  };

  const setValidator = (nextValidator: ValidationFunction<TFormErrors, TFormValues>) => {
    if (isDisposed || currentValidator === nextValidator) {
      return;
    }

    currentValidator = nextValidator;
    validate();
  };

  const subscribe = (cb: ValidateHandler<TFormErrors>) => {
    if (isDisposed) {
      return () => {};
    }

    validateHandlers.add(cb);

    return () => {
      validateHandlers.delete(cb);
    };
  };

  const dispose = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    unsubscribeForm();
    validateHandlers.clear();
    currentValidator = null;
  };

  if (validator) {
    setValidator(validator);
  }

  unsubscribeForm = form.subscribe(validate);

  return {
    validate,
    setValidator,
    subscribe,
    dispose,
    get result() {
      return result;
    },
  };
};

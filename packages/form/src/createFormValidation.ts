import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form, FormValues } from './createForm';

export type FormErrors = Record<string, any>;
export type ValidationState = 'unvalidated' | 'valid' | 'invalid';

export type ValidationFunction<TFormErrors extends FormErrors, TFormValues extends FormValues> = (
  values: Readonly<TFormValues>,
  prevValues: Readonly<TFormValues>,
) => TFormErrors;

type ValidateHandler<TFormErrors extends FormErrors> = (errors: Readonly<TFormErrors>) => void;
type Unsubscribe = () => void;

export interface FormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  readonly errors: Readonly<TFormErrors>;
  readonly state: ValidationState;
  validate: () => void;
  /** Configuring a new validator recalculates the current form snapshot synchronously. */
  setValidation: (validationFunc: ValidationFunction<TFormErrors, TFormValues>) => void;
  subscribe: (cb: ValidateHandler<TFormErrors>) => Unsubscribe;
  dispose: () => void;
}

export const createFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc?: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  const validateHandlers = new Set<ValidateHandler<TFormErrors>>();
  let errors = Object.freeze({}) as Readonly<TFormErrors>;
  let state: ValidationState = 'unvalidated';
  let _validationFunc: ValidationFunction<TFormErrors, TFormValues> | null = null;
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

  const publishValidationResult = (newErrors: Readonly<TFormErrors>) => {
    const shouldUpdateErrors = !objectsAreEqual(newErrors, errors);
    const nextState = Object.keys(newErrors).length ? 'invalid' : 'valid';
    const shouldUpdateState = state !== nextState;

    if (shouldUpdateErrors || shouldUpdateState) {
      if (shouldUpdateErrors) {
        errors = newErrors;
      }

      state = nextState;

      [...validateHandlers].forEach((cb) => {
        cb(errors);
      });
    }
  };

  const validate = () => {
    if (!isDisposed && _validationFunc) {
      publishValidationResult(calculateErrors(_validationFunc));
    }
  };

  const setValidation = (validationFunction: ValidationFunction<TFormErrors, TFormValues>) => {
    if (isDisposed || _validationFunc === validationFunction) {
      return;
    }

    const newErrors = calculateErrors(validationFunction);

    if (isDisposed) {
      return;
    }

    _validationFunc = validationFunction;
    publishValidationResult(newErrors);
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
    _validationFunc = null;
  };

  if (validationFunc) {
    setValidation(validationFunc);
  }

  unsubscribeForm = form.subscribe(validate);

  return {
    validate,
    setValidation,
    subscribe,
    dispose,
    get errors() {
      return errors;
    },
    get state() {
      return state;
    },
  };
};

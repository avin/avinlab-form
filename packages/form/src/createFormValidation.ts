import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form, FormValues } from './createForm';

export type FormErrors = Record<string, any>;

export type ValidationFunction<TFormErrors extends FormErrors, TFormValues extends FormValues> = (
  values: Readonly<TFormValues>,
  prevValues: Readonly<TFormValues>,
) => TFormErrors;

type ValidateHandler<TFormErrors extends FormErrors> = (errors: Readonly<TFormErrors>) => void;
type Unsubscribe = () => void;

export interface FormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  readonly errors: Readonly<TFormErrors>;
  readonly isValid: boolean;
  validate: () => void;
  /** Configuring a new validator recalculates the current form snapshot synchronously. */
  setValidation: (validationFunc: ValidationFunction<TFormErrors, TFormValues>) => void;
  subscribe: (cb: ValidateHandler<TFormErrors>) => Unsubscribe;
  /** @deprecated Prefer `subscribe`, which returns its cleanup function. */
  onValidate: (cb: ValidateHandler<TFormErrors>) => void;
  /** @deprecated Keep the cleanup returned by `subscribe` instead. */
  offValidate: (cb: ValidateHandler<TFormErrors>) => void;
  dispose: () => void;
}

export const createFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc?: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  const _onValidateHandlers = new Set<ValidateHandler<TFormErrors>>();
  let errors = Object.freeze({}) as Readonly<TFormErrors>;
  let isValid = true;
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

  const publishErrors = (newErrors: Readonly<TFormErrors>) => {
    const shouldUpdateErrors = !objectsAreEqual(newErrors, errors);

    if (shouldUpdateErrors) {
      errors = newErrors;
      isValid = !Object.keys(errors).length;

      [..._onValidateHandlers].forEach((cb) => {
        cb(newErrors);
      });
    }
  };

  const validate = () => {
    if (!isDisposed && _validationFunc) {
      publishErrors(calculateErrors(_validationFunc));
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
    publishErrors(newErrors);
  };

  const subscribe = (cb: ValidateHandler<TFormErrors>) => {
    if (isDisposed) {
      return () => {};
    }

    _onValidateHandlers.add(cb);

    return () => {
      _onValidateHandlers.delete(cb);
    };
  };

  const onValidate = (cb: ValidateHandler<TFormErrors>) => {
    subscribe(cb);
  };

  const offValidate = (cb: ValidateHandler<TFormErrors>) => {
    _onValidateHandlers.delete(cb);
  };

  const dispose = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    unsubscribeForm();
    _onValidateHandlers.clear();
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
    onValidate,
    offValidate,
    dispose,
    get errors() {
      return errors;
    },
    get isValid() {
      return isValid;
    },
  };
};

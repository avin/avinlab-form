import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form, FormValues } from './createForm';

export type FormErrors = Record<string, any>;

export type ValidationFunction<TFormErrors extends FormErrors, TFormValues extends FormValues> = (
  values: TFormValues,
  prevValues: TFormValues,
) => TFormErrors;

type ValidateHandler = (errors: FormErrors) => void;

export interface FormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  errors: TFormErrors;
  isValid: boolean;
  validate: () => void;
  setValidation: (validationFunc: ValidationFunction<TFormErrors, TFormValues>) => void;
  onValidate: (cb: ValidateHandler) => void;
  offValidate: (cb: ValidateHandler) => void;
}

export const createFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc?: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  let _onValidateHandlers: ValidateHandler[] = [];
  let errors: TFormErrors;
  let isValid = true;
  let _validationFunc: ValidationFunction<TFormErrors, TFormValues> | null = null;

  const validate = () => {
    if (_validationFunc) {
      const newErrors = _validationFunc(form.values, form.prevValues);

      if (typeof newErrors !== 'object' || newErrors === null) {
        throw new Error('Validation function has to return an object');
      }

      Object.keys(newErrors).forEach((key) => {
        if (newErrors[key] === undefined) {
          delete newErrors[key];
        }
      });

      const shouldUpdateErrors = !objectsAreEqual(newErrors, errors);

      if (shouldUpdateErrors) {
        errors = newErrors;
        isValid = !Object.keys(errors).length;

        _onValidateHandlers.forEach((cb) => {
          cb(newErrors);
        });
      }
    }
  };

  const setValidation = (validationFunction: ValidationFunction<TFormErrors, TFormValues>) => {
    _validationFunc = validationFunction;
  };

  const onValidate = (cb: ValidateHandler) => {
    _onValidateHandlers.push(cb);
  };

  const offValidate = (cb: ValidateHandler) => {
    _onValidateHandlers = _onValidateHandlers.filter((i) => i !== cb);
  };

  if (validationFunc) {
    setValidation(validationFunc);
  }

  form.onUpdate(() => {
    validate();
  });

  validate();

  return {
    validate,
    setValidation,
    onValidate,
    offValidate,
    get errors() {
      return errors;
    },
    get isValid() {
      return isValid;
    },
  };
};

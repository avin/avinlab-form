import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form, FormValues } from './createForm';

export type ValidationFunction<TFormValues extends FormValues> = (
  values: TFormValues,
  prevValues: TFormValues,
) => Record<keyof TFormValues, any | undefined>;

type ValidateHandler = (errors: Record<string, any>) => void;

export interface FormValidation<TFormValues extends FormValues> {
  errors: Record<string, any>;
  isValid: boolean;
  validate: () => void;
  setValidation: (validationFunc: ValidationFunction<TFormValues>) => void;
  onValidate: (cb: ValidateHandler) => void;
  offValidate: (cb: ValidateHandler) => void;
}

export const createFormValidation = <TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc?: ValidationFunction<TFormValues>,
): FormValidation<TFormValues> => {
  let _onValidateHandlers: ValidateHandler[] = [];
  let errors: Record<string, any> = {};
  let isValid = true;
  let _validationFunc: ValidationFunction<TFormValues> | null = null;
  let _isValidatedOnce = false;

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

      const shouldUpdateErrors = !objectsAreEqual(newErrors, errors) || !_isValidatedOnce;

      if (shouldUpdateErrors) {
        errors = newErrors;
        isValid = !Object.keys(errors).length;
        _isValidatedOnce = true;

        _onValidateHandlers.forEach((cb) => {
          cb(newErrors);
        });
      }
    }
  };

  const setValidation = (validationFunction: ValidationFunction<TFormValues>) => {
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

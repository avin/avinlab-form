import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form } from './createForm';

export type ValidationFunction = (
  values: Record<string, any>,
  prevValues: Record<string, any>,
) => Record<string, any | undefined>;
type ValidateHandler = (errors: Record<string, any>) => void;

export interface FormValidation {
  errors: Record<string, any>;
  isValid: boolean;
  validate: () => void;
  setValidation: (validationFunc: ValidationFunction) => void;
  onValidate: (cb: ValidateHandler) => void;
  offValidate: (cb: ValidateHandler) => void;
}

export const createFormValidation = (
  form: Form,
  validationFunc?: ValidationFunction,
): FormValidation => {
  let _onValidateHandlers: ValidateHandler[] = [];
  let errors: Record<string, any> = {};
  let isValid = true;
  let _validationFunc: ValidationFunction | null = null;
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

  const setValidation = (validationFunction: ValidationFunction) => {
    _validationFunc = validationFunction;
    // validate();
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

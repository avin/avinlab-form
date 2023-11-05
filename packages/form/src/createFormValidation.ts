import { objectsAreEqual } from './utils/objectsAreEqual';
import type { Form } from './createForm';

type ValidationFunction = (
  values: Record<string, any>,
  prevValues: Record<string, any>,
) => Record<string, any | undefined>;
type ValidateHandler = (errors: Record<string, any>) => void;

export interface FormValidation {
  _onValidateHandlers: ValidateHandler[];
  errors: Record<string, any>;
  isValid: boolean;
  _validationFunc: ValidationFunction | null;
  validate: () => void;
  setValidation: (validationFunc: ValidationFunction) => void;
  onValidate: (cb: ValidateHandler) => void;
  offValidate: (cb: ValidateHandler) => void;
}

export const createFormValidation = (
  form: Form,
  validationFunc?: ValidationFunction,
): FormValidation => {
  const formValidation: FormValidation = {
    _onValidateHandlers: [],
    errors: {},
    isValid: true,
    _validationFunc: null,

    validate() {
      if (this._validationFunc) {
        const newErrors = this._validationFunc(form.values, form._prevValues);

        if (typeof newErrors !== 'object' || newErrors === null) {
          throw new Error('Validation function has to return an object');
        }

        Object.keys(newErrors).forEach((key) => {
          if (newErrors[key] === undefined) {
            delete newErrors[key];
          }
        });

        if (!objectsAreEqual(newErrors, this.errors)) {
          this.errors = newErrors;
          this.isValid = !Object.keys(this.errors).length;

          this._onValidateHandlers.forEach((cb) => {
            cb(newErrors);
          });
        }
      }
    },

    setValidation(validationFunc: ValidationFunction) {
      this._validationFunc = validationFunc;
      this.validate();
    },

    onValidate(cb: ValidateHandler) {
      this._onValidateHandlers.push(cb);
    },

    offValidate(cb: ValidateHandler) {
      this._onValidateHandlers = this._onValidateHandlers.filter(
        (i) => i !== cb,
      );
    },
  };

  if (validationFunc) {
    formValidation.setValidation(validationFunc);
  }

  form.onUpdate(() => {
    formValidation.validate();
  });

  return formValidation;
};

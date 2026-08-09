import { useCallback, useEffect, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import type {
  Form,
  FormValidation,
  ValidationFunction,
  FormValues,
  FormErrors,
} from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

type ValidationListener<TFormErrors extends FormErrors> = (errors: Readonly<TFormErrors>) => void;

interface ReactFormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues>
  extends FormValidation<TFormErrors, TFormValues> {
  connect: (form: Form<TFormValues>) => () => void;
}

const createReactFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(): ReactFormValidation<TFormErrors, TFormValues> => {
  const listeners = new Set<ValidationListener<TFormErrors>>();
  let errors = Object.freeze({}) as Readonly<TFormErrors>;
  let isValid = true;
  let controller: FormValidation<TFormErrors, TFormValues> | null = null;
  let disconnectController = () => {};
  let isDisposed = false;

  const publishControllerSnapshot = () => {
    if (!controller || (Object.is(errors, controller.errors) && isValid === controller.isValid)) {
      return;
    }

    errors = controller.errors;
    isValid = controller.isValid;
    [...listeners].forEach((listener) => listener(errors));
  };

  const disconnect = () => {
    disconnectController();
    disconnectController = () => {};
    controller = null;
  };

  const connect = (form: Form<TFormValues>) => {
    if (isDisposed) {
      return () => {};
    }

    const nextController = createFormValidation<TFormErrors, TFormValues>(form);
    controller = nextController;
    const unsubscribeValidation = nextController.subscribe(publishControllerSnapshot);
    disconnectController = () => {
      unsubscribeValidation();
      nextController.dispose();

      if (controller === nextController) {
        controller = null;
      }
    };

    return disconnectController;
  };

  const validate = () => {
    controller?.validate();
    publishControllerSnapshot();
  };

  const setValidation = (validationFunction: ValidationFunction<TFormErrors, TFormValues>) => {
    controller?.setValidation(validationFunction);
    publishControllerSnapshot();
  };

  const subscribe = (listener: ValidationListener<TFormErrors>) => {
    if (isDisposed) {
      return () => {};
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    connect,
    validate,
    setValidation,
    subscribe,
    onValidate(listener) {
      subscribe(listener);
    },
    offValidate(listener) {
      listeners.delete(listener);
    },
    dispose() {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      disconnect();
      listeners.clear();
    },
    get errors() {
      return errors;
    },
    get isValid() {
      return isValid;
    },
  };
};

const useValidationController = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
) => {
  const validationRef = useRef<ReactFormValidation<TFormErrors, TFormValues> | null>(null);

  if (!validationRef.current) {
    validationRef.current = createReactFormValidation<TFormErrors, TFormValues>();
  }

  const validation = validationRef.current;

  useEffect(() => validation.connect(form), [form, validation]);
  useEffect(() => validation.setValidation(validationFunc), [form, validation, validationFunc]);

  return validation;
};

const useValidationSelector = <
  TSelected,
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
  selector: (validation: FormValidation<TFormErrors, TFormValues>) => TSelected,
) => {
  const validation = useValidationController(form, validationFunc);
  const subscribe = useCallback(
    (onStoreChange: () => void) => validation.subscribe(onStoreChange),
    [validation],
  );
  const getSnapshot = useCallback(() => selector(validation), [selector, validation]);
  const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return [validation, selected] as const;
};

export const useFormValidation = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  const selectErrors = useCallback(
    (validation: FormValidation<TFormErrors, TFormValues>) => validation.errors,
    [],
  );
  const [validation] = useValidationSelector(form, validationFunc, selectErrors);

  return validation;
};

export const useFormValidationError = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
  TFieldName extends keyof TFormErrors,
>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
  fieldName: TFieldName,
): TFormErrors[TFieldName] | undefined => {
  const selectError = useCallback(
    (validation: FormValidation<TFormErrors, TFormValues>) => validation.errors[fieldName],
    [fieldName],
  );
  const [, error] = useValidationSelector(form, validationFunc, selectError);

  return error;
};

export const useFormIsValid = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
) => {
  const selectIsValid = useCallback(
    (validation: FormValidation<TFormErrors, TFormValues>) => validation.isValid,
    [],
  );
  const [, isValid] = useValidationSelector(form, validationFunc, selectIsValid);

  return isValid;
};

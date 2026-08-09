import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import type {
  Form,
  FormValidation,
  ValidationFunction,
  FormValues,
  FormErrors,
  ValidationState,
} from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

type ValidationListener<TFormErrors extends FormErrors> = (errors: Readonly<TFormErrors>) => void;

interface ValidationSnapshot<TFormErrors extends FormErrors> {
  readonly errors: Readonly<TFormErrors>;
  readonly state: ValidationState;
}

const emptyErrors = Object.freeze({});
const unvalidatedSnapshot = Object.freeze({
  errors: emptyErrors,
  state: 'unvalidated',
});

const getUnvalidatedSnapshot = <TFormErrors extends FormErrors>() =>
  unvalidatedSnapshot as ValidationSnapshot<TFormErrors>;

interface ReactFormValidation<TFormErrors extends FormErrors, TFormValues extends FormValues>
  extends FormValidation<TFormErrors, TFormValues> {
  readonly snapshot: ValidationSnapshot<TFormErrors>;
  connect: (form: Form<TFormValues>) => () => void;
  hasSnapshotFor: (form: Form<TFormValues>) => boolean;
}

interface ValidationView<TFormErrors extends FormErrors, TFormValues extends FormValues>
  extends FormValidation<TFormErrors, TFormValues> {
  readonly snapshot: ValidationSnapshot<TFormErrors>;
}

const createReactFormValidation = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(): ReactFormValidation<TFormErrors, TFormValues> => {
  const listeners = new Set<ValidationListener<TFormErrors>>();
  let snapshot = getUnvalidatedSnapshot<TFormErrors>();
  let committedForm: Form<TFormValues> | null = null;
  let controller: FormValidation<TFormErrors, TFormValues> | null = null;
  let disconnectController = () => {};
  let isDisposed = false;

  const publishControllerSnapshot = () => {
    if (
      !controller ||
      (Object.is(snapshot.errors, controller.errors) && snapshot.state === controller.state)
    ) {
      return;
    }

    snapshot = Object.freeze({
      errors: controller.errors,
      state: controller.state,
    });
    [...listeners].forEach((listener) => listener(snapshot.errors));
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

    disconnectController();
    const nextController = createFormValidation<TFormErrors, TFormValues>(form);
    committedForm = form;
    controller = nextController;
    const unsubscribeValidation = nextController.subscribe(publishControllerSnapshot);
    disconnectController = () => {
      unsubscribeValidation();
      nextController.dispose();

      if (controller === nextController) {
        controller = null;
      }
    };

    publishControllerSnapshot();

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
    hasSnapshotFor: (form) => isDisposed || committedForm === form,
    validate,
    setValidation,
    subscribe,
    dispose() {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      disconnect();
      listeners.clear();
    },
    get errors() {
      return snapshot.errors;
    },
    get state() {
      return snapshot.state;
    },
    get snapshot() {
      return snapshot;
    },
  };
};

const useValidationController = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>() => {
  const validationRef = useRef<ReactFormValidation<TFormErrors, TFormValues> | null>(null);

  if (!validationRef.current) {
    validationRef.current = createReactFormValidation<TFormErrors, TFormValues>();
  }

  const validation = validationRef.current;

  return validation;
};

const useValidationView = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  validation: ReactFormValidation<TFormErrors, TFormValues>,
  form: Form<TFormValues>,
): ValidationView<TFormErrors, TFormValues> =>
  useMemo(
    () => ({
      validate: validation.validate,
      setValidation: validation.setValidation,
      subscribe: validation.subscribe,
      dispose: validation.dispose,
      get errors() {
        return this.snapshot.errors;
      },
      get state() {
        return this.snapshot.state;
      },
      get snapshot() {
        return validation.hasSnapshotFor(form)
          ? validation.snapshot
          : getUnvalidatedSnapshot<TFormErrors>();
      },
    }),
    [form, validation],
  );

const useValidationSelector = <
  TSelected,
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
  selector: (validation: ValidationView<TFormErrors, TFormValues>) => TSelected,
) => {
  const validation = useValidationController<TFormErrors, TFormValues>();
  const view = useValidationView(validation, form);
  const subscribe = useCallback(
    (onStoreChange: () => void) => validation.subscribe(onStoreChange),
    [validation],
  );
  const getSnapshot = useCallback(() => selector(view), [selector, view]);
  const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => validation.connect(form), [form, validation]);
  useEffect(() => validation.setValidation(validationFunc), [form, validation, validationFunc]);

  return [view, selected] as const;
};

export const useFormValidation = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
): FormValidation<TFormErrors, TFormValues> => {
  const selectSnapshot = useCallback(
    (validation: ValidationView<TFormErrors, TFormValues>) => validation.snapshot,
    [],
  );
  const [validation] = useValidationSelector(form, validationFunc, selectSnapshot);

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
    (validation: ValidationView<TFormErrors, TFormValues>) => validation.errors[fieldName],
    [fieldName],
  );
  const [, error] = useValidationSelector(form, validationFunc, selectError);

  return error;
};

export const useFormValidationState = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
): ValidationState => {
  const selectState = useCallback(
    (validation: ValidationView<TFormErrors, TFormValues>) => validation.state,
    [],
  );
  const [, state] = useValidationSelector(form, validationFunc, selectState);

  return state;
};

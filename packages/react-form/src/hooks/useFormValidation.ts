import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type {
  Form,
  FormErrors,
  FormValidation,
  FormValues,
  ValidationFunction,
  ValidationResult,
} from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

type StoreListener = () => void;

interface ValidationRequest<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  form: Form<TFormValues>;
  validator: ValidationFunction<TFormErrors, TFormValues>;
}

const emptyErrors = Object.freeze({});
const unvalidatedResult = Object.freeze({
  status: 'unvalidated' as const,
  errors: emptyErrors,
});

const getUnvalidatedResult = <TFormErrors extends FormErrors>() =>
  unvalidatedResult as ValidationResult<TFormErrors>;

interface ValidationStore<TFormErrors extends FormErrors, TFormValues extends FormValues> {
  connect: (request: ValidationRequest<TFormErrors, TFormValues>) => () => void;
  getResult: (
    request: ValidationRequest<TFormErrors, TFormValues>,
  ) => ValidationResult<TFormErrors>;
  subscribe: (listener: StoreListener) => () => void;
}

const createValidationStore = <
  TFormErrors extends FormErrors,
  TFormValues extends FormValues,
>(): ValidationStore<TFormErrors, TFormValues> => {
  const listeners = new Set<StoreListener>();
  let result = getUnvalidatedResult<TFormErrors>();
  let committedRequest: ValidationRequest<TFormErrors, TFormValues> | null = null;
  let controller: FormValidation<TFormErrors, TFormValues> | null = null;
  let disconnectController = () => {};

  const notify = () => {
    [...listeners].forEach((listener) => listener());
  };

  const connect = (request: ValidationRequest<TFormErrors, TFormValues>) => {
    disconnectController();
    result = getUnvalidatedResult<TFormErrors>();
    committedRequest = request;

    let nextController: FormValidation<TFormErrors, TFormValues>;
    try {
      nextController = createFormValidation(request.form, request.validator);
    } catch (error) {
      notify();
      throw error;
    }

    controller = nextController;
    const unsubscribeValidation = nextController.subscribe((nextResult) => {
      if (controller !== nextController) return;
      result = nextResult;
      notify();
    });
    disconnectController = () => {
      unsubscribeValidation();
      nextController.dispose();
      if (controller === nextController) controller = null;
    };

    result = nextController.result;
    notify();

    return disconnectController;
  };

  return {
    connect,
    getResult: (request) =>
      committedRequest?.form === request.form && committedRequest.validator === request.validator
        ? result
        : getUnvalidatedResult<TFormErrors>(),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const useFormValidation = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validator: ValidationFunction<TFormErrors, TFormValues>,
): ValidationResult<TFormErrors> => {
  const storeRef = useRef<ValidationStore<TFormErrors, TFormValues> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createValidationStore<TFormErrors, TFormValues>();
  }
  const store = storeRef.current;
  const request = useMemo(() => ({ form, validator }), [form, validator]);
  const subscribe = useCallback((listener: StoreListener) => store.subscribe(listener), [store]);
  const getSnapshot = useCallback(() => store.getResult(request), [request, store]);
  const getServerSnapshot = useCallback(() => getUnvalidatedResult<TFormErrors>(), []);
  const result = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => store.connect(request), [request, store]);

  return result;
};

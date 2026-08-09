import { useRef, useState, useEffect } from 'react';
import type {
  Form,
  FormValidation,
  ValidationFunction,
  FormValues,
  FormErrors,
} from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

export const useFormValidation = <TFormErrors extends FormErrors, TFormValues extends FormValues>(
  form: Form<TFormValues>,
  validationFunc: ValidationFunction<TFormErrors, TFormValues>,
) => {
  const formValidationRef = useRef<FormValidation<TFormErrors, TFormValues> | null>(null);
  formValidationRef.current = formValidationRef.current || createFormValidation(form);

  const formValidation = formValidationRef.current!;

  formValidation.setValidation(validationFunc);

  const [, setRenderTick] = useState(0);

  useEffect(() => {
    const onValidate = () => {
      setRenderTick((v) => v + 1);
    };

    formValidation.onValidate(onValidate);

    return () => {
      formValidation.offValidate(onValidate);
    };
  }, [formValidation]);

  return formValidation;
};

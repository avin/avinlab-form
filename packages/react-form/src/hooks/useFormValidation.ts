import { useRef, useState, useEffect } from 'react';
import type { Form, FormValidation, ValidationFunction } from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

export const useFormValidation = (form: Form, validationFunc: ValidationFunction) => {
  const firstTimeRef = useRef(true);
  const formValidationRef = useRef<FormValidation | null>(null);
  formValidationRef.current = formValidationRef.current || createFormValidation(form);

  const formValidation = formValidationRef.current!;

  formValidation.setValidation(validationFunc);
  if (firstTimeRef.current) {
    formValidation.validate();
    firstTimeRef.current = false;
  }

  const [, setRenderTick] = useState(0);

  useEffect(() => {
    const onValidate = (newErrors: Record<string, any>) => {
      setRenderTick((v) => v + 1);
    };

    formValidation.onValidate(onValidate);

    return () => {
      formValidation.offValidate(onValidate);
    };
  }, [formValidation]);

  return formValidation;
};

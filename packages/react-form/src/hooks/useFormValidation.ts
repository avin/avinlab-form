import { useRef, useState, useEffect } from 'react';
import type { Form, FormValidation, ValidationFunction } from '@avinlab/form';
import { createFormValidation } from '@avinlab/form';

export const useFormValidation = (
  form: Form,
  validationFunc: ValidationFunction,
) => {
  const formValidationRef = useRef<FormValidation | null>(null);
  formValidationRef.current =
    formValidationRef.current || createFormValidation(form, validationFunc);

  const formValidation = formValidationRef.current;

  const [errors, setErrors] = useState<Record<string, any>>(
    formValidation.errors || {},
  );
  const [isValidated, setIsValidated] = useState(
    formValidation.errors === undefined,
  );

  useEffect(() => {
    const onValidate = (newErrors: Record<string, any>) => {
      setErrors(newErrors);
      setIsValidated(true);
    };

    formValidation.onValidate(onValidate);

    // Cleanup function to unregister the validation callback
    return () => {
      formValidation.offValidate(onValidate);
    };
  }, [formValidation]);

  useEffect(() => {
    formValidation.setValidation(validationFunc);
  }, [formValidation, validationFunc]);

  return {
    setValidation: formValidation.setValidation,
    errors,
    isValid: formValidation.isValid,
    isValidated,
  };
};

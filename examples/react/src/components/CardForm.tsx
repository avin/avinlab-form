import type { FormEvent } from 'react';
import cn from 'clsx';
import React, { useState } from 'react';
import { PanInput } from './PanInput.tsx';
import { useForm, useFormValidation } from '@avinlab/react-form';
import ExpiryInput from './ExpiryInput.tsx';
import { CvcInput } from './CvcInput.tsx';
import { FormField } from './FormField.tsx';
import { validateCvc, validateExpiry, validatePan } from '../utils/validators.ts';
import { PaymentSystem } from './PaymentSystem.tsx';
import { WatchField } from './WatchField.tsx';

export function CardForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm({
    pan: '',
    expiry: '',
    cvc: '',
  });

  const { errors, isValid, isValidated } = useFormValidation(form, (formValues, prevFormValues) => {
    const errors: Record<string, any> = {};

    const check = (
      fieldName: string,
      validationFunc: (v: string) => boolean,
      errorMessage: string,
    ) => {
      if (!validationFunc(formValues[fieldName])) {
        errors[fieldName] = errorMessage;
      }
    };

    check('pan', validatePan, 'Wrong card number');
    check('expiry', validateExpiry, 'Wrong expiry');
    check('cvc', validateCvc, 'Wrong CVC');

    return errors;
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (isValid) {
      alert(JSON.stringify(form.values, null, 2));
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <FormField
            label="Card number"
            name="pan"
            errors={errors}
            form={form}
            isSubmitted={isSubmitted}
            rightContent={
              <WatchField form={form} name="pan">
                {(val) => {
                  return <PaymentSystem cardNumber={val} />;
                }}
              </WatchField>
            }
          >
            <PanInput placeholder="0000 0000 0000 0000" className="input" />
          </FormField>
        </div>
        <div className="flex items-start justify-between">
          <div className="mb-4 mr-2 flex-1">
            <FormField
              label="Expiry"
              name="expiry"
              errors={errors}
              form={form}
              isSubmitted={isSubmitted}
            >
              <ExpiryInput placeholder="MM/YY" className="input" />
            </FormField>
          </div>
          <div className="mb-4 ml-2 flex-1">
            <FormField label="CVC" name="cvc" errors={errors} form={form} isSubmitted={isSubmitted}>
              <CvcInput placeholder="CVC" className="input" />
            </FormField>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className={cn(
              'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4',
              {
                'opacity-50': !isValidated || !isValid,
              },
            )}
            type="submit"
          >
            Pay
          </button>
        </div>
      </form>
    </div>
  );
}

export default CardForm;
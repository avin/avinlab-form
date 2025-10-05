import React, { useCallback, type ComponentType } from 'react';
import type { Form, FormValues } from '@avinlab/form';
import { useFormWatch } from './hooks/useFormWatch';

export interface FormInputControlOptions {
  valueAttrName: string;
  getValue?: (event: any) => any;
  onChangeAttrName: string;
}

const defaultFormInputControlOptions: FormInputControlOptions = {
  valueAttrName: 'value',
  onChangeAttrName: 'onChange',
};

export const useFormControlProps = <T extends FormValues>(
  form: Form<T>,
  name: keyof T,
  options: FormInputControlOptions,
) => {
  const handleChange = useCallback(
    (event: any) => {
      const getValue = options.getValue || ((e: any) => e);
      if (name) {
        form.setValue(name, getValue(event));
      }
    },
    [form, name, options.getValue],
  );

  const value = useFormWatch(form, name);

  return {
    [options.valueAttrName]: value,
    [options.onChangeAttrName]: handleChange,
  } satisfies Record<string, unknown>;
};

interface CommonFormProps<T extends FormValues> {
  form: Form<T>;
  name: keyof T;
}

type FormComponentProps<T extends FormValues, P> = CommonFormProps<T> &
  Omit<P, 'form' | 'name' | 'onChange' | 'value'>;

export function createFormComponent<P>(
  Component: ComponentType<P>,
  options: Partial<FormInputControlOptions> = {},
) {
  return function <T extends FormValues>({ form, name, ...rest }: FormComponentProps<T, P>) {
    const formControlProps = useFormControlProps(form, name, {
      ...defaultFormInputControlOptions,
      ...options,
    });

    return <Component {...(rest as P)} {...formControlProps} name={name as string} />;
  };
}

export type { FormComponentProps };

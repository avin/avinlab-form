import React, { useCallback, type ComponentType } from 'react';
import type { Form, FormValues } from '@avinlab/form';
import { useFormWatch } from './hooks/useFormWatch';

type StringKeyOf<T> = Extract<keyof T, string>;
type DefaultKey<T, TKey extends string> = Extract<TKey, StringKeyOf<T>>;
type ChangeEvent<TProps, TOnChangeAttrName extends keyof TProps> = NonNullable<
  TProps[TOnChangeAttrName]
> extends (...args: infer TArgs) => unknown
  ? TArgs extends [infer TEvent, ...unknown[]]
    ? TEvent
    : never
  : never;

interface FormComponentOptions<
  TProps extends object = Record<string, unknown>,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
> {
  valueAttrName?: TValueAttrName;
  getValue?: (event: ChangeEvent<TProps, TOnChangeAttrName>) => TExtractedValue;
  onChangeAttrName?: TOnChangeAttrName;
}

interface FormControlOptions<
  TValueAttrName extends string,
  TOnChangeAttrName extends string,
  TEvent,
  TValue,
> {
  valueAttrName: TValueAttrName;
  getValue?: (event: TEvent) => TValue;
  onChangeAttrName: TOnChangeAttrName;
}

type FormControlProps<
  TValueAttrName extends string,
  TOnChangeAttrName extends string,
  TEvent,
  TValue,
> = Record<TValueAttrName, TValue> & Record<TOnChangeAttrName, (event: TEvent) => void>;

const useFormControlProps = <
  TFormValues extends FormValues,
  TFieldName extends keyof TFormValues,
  TValueAttrName extends string,
  TOnChangeAttrName extends string,
  TEvent = TFormValues[TFieldName],
>(
  form: Form<TFormValues>,
  name: TFieldName,
  options: FormControlOptions<TValueAttrName, TOnChangeAttrName, TEvent, TFormValues[TFieldName]>,
): FormControlProps<TValueAttrName, TOnChangeAttrName, TEvent, TFormValues[TFieldName]> => {
  const { getValue, onChangeAttrName, valueAttrName } = options;
  const handleChange = useCallback(
    (event: TEvent) => {
      const value = getValue ? getValue(event) : (event as unknown as TFormValues[TFieldName]);
      form.setValue(name, value);
    },
    [form, getValue, name],
  );

  const value = useFormWatch(form, name);

  const formControlProps = {
    [valueAttrName]: value,
    [onChangeAttrName]: handleChange,
  } satisfies Record<string, unknown>;

  return formControlProps as FormControlProps<
    TValueAttrName,
    TOnChangeAttrName,
    TEvent,
    TFormValues[TFieldName]
  >;
};

type CompatibleFieldName<
  TFormValues extends FormValues,
  TProps extends object,
  TValueAttrName extends keyof TProps,
  TExtractedValue,
> = {
  [TFieldName in keyof TFormValues]-?: TFormValues[TFieldName] extends TProps[TValueAttrName]
    ? TExtractedValue extends TFormValues[TFieldName]
      ? TFieldName
      : never
    : never;
}[keyof TFormValues];

type FormComponentProps<
  TFormValues extends FormValues,
  TProps extends object,
  TValueAttrName extends keyof TProps = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends keyof TProps = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
> = {
  form: Form<TFormValues>;
  name: CompatibleFieldName<TFormValues, TProps, TValueAttrName, TExtractedValue>;
} & Omit<TProps, 'form' | 'name' | TValueAttrName | TOnChangeAttrName>;

export function createFormComponent<
  TProps extends object,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
>(
  Component: ComponentType<TProps>,
  options: FormComponentOptions<TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue> = {},
) {
  const valueAttrName = (options.valueAttrName ?? 'value') as TValueAttrName;
  const onChangeAttrName = (options.onChangeAttrName ?? 'onChange') as TOnChangeAttrName;

  return function <TFormValues extends FormValues>({
    form,
    name,
    ...rest
  }: FormComponentProps<TFormValues, TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue>) {
    type TEvent = ChangeEvent<TProps, TOnChangeAttrName>;
    const formControlProps = useFormControlProps(form, name, {
      valueAttrName,
      onChangeAttrName,
      getValue: options.getValue as ((event: TEvent) => TFormValues[typeof name]) | undefined,
    });

    return <Component {...(rest as TProps)} {...formControlProps} name={name as string} />;
  };
}

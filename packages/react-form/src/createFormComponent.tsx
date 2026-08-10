import React, { useCallback, type ComponentType } from 'react';
import type { Form, FormValues } from '@avinlab/form';
import { useFormWatch } from './hooks/useFormWatch';

type StringKeyOf<T> = Extract<keyof T, string>;
type DefaultKey<T, TKey extends string> = Extract<TKey, StringKeyOf<T>>;
type ChangeArgs<TProps, TOnChangeAttrName extends keyof TProps> = NonNullable<
  TProps[TOnChangeAttrName]
> extends (...args: infer TArgs) => unknown
  ? TArgs
  : never;
type ChangeEvent<TProps, TOnChangeAttrName extends keyof TProps> = ChangeArgs<
  TProps,
  TOnChangeAttrName
> extends [infer TEvent, ...unknown[]]
  ? TEvent
  : never;

interface FormComponentOptions<
  TProps extends object = Record<string, unknown>,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
> {
  valueAttrName?: TValueAttrName;
  getValue?: (...args: ChangeArgs<TProps, TOnChangeAttrName>) => TExtractedValue;
  onChangeAttrName?: TOnChangeAttrName;
}

interface RuntimeFormComponentOptions {
  valueAttrName: string;
  getValue?: (...args: any[]) => any;
  onChangeAttrName: string;
}

const useFormControlProps = (
  form: Form<any>,
  name: keyof any,
  options: RuntimeFormComponentOptions,
) => {
  const { getValue, onChangeAttrName, valueAttrName } = options;
  const handleChange = useCallback(
    (...args: any[]) => {
      const value = getValue ? getValue(...args) : args[0];
      form.setValue(name, value);
    },
    [form, getValue, name],
  );

  const value = useFormWatch(form, name);

  const formControlProps = {
    [valueAttrName]: value,
    [onChangeAttrName]: handleChange,
  };

  return formControlProps;
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

type ComponentRefProps<TComponent extends ComponentType<any>> =
  TComponent extends React.ComponentClass<any>
    ? Pick<React.ComponentPropsWithRef<TComponent>, 'ref'>
    : TComponent extends React.NamedExoticComponent<any>
    ? 'ref' extends keyof React.ComponentPropsWithRef<TComponent>
      ? Pick<React.ComponentPropsWithRef<TComponent>, 'ref'>
      : {}
    : {};

type FormComponentProps<
  TFormValues extends FormValues,
  TComponent extends ComponentType<any>,
  TProps extends object,
  TValueAttrName extends keyof TProps = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends keyof TProps = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
> = {
  form: Form<TFormValues>;
  name: CompatibleFieldName<TFormValues, TProps, TValueAttrName, TExtractedValue>;
} & Omit<TProps, 'form' | 'name' | 'ref' | TValueAttrName | TOnChangeAttrName> &
  ComponentRefProps<TComponent>;

type FormComponent<
  TComponent extends ComponentType<any>,
  TProps extends object,
  TValueAttrName extends keyof TProps,
  TOnChangeAttrName extends keyof TProps,
  TExtractedValue,
> = {
  <TFormValues extends FormValues>(
    props: FormComponentProps<
      TFormValues,
      TComponent,
      TProps,
      TValueAttrName,
      TOnChangeAttrName,
      TExtractedValue
    >,
  ): React.ReactElement;
  displayName?: string;
};

export function createFormComponent<
  TProps extends object,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = ChangeEvent<TProps, TOnChangeAttrName>,
  TComponent extends ComponentType<TProps> = ComponentType<TProps>,
>(
  Component: TComponent & ComponentType<TProps>,
  options?: FormComponentOptions<TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue>,
): FormComponent<TComponent, TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue>;
export function createFormComponent(
  Component: ComponentType<any>,
  options: Partial<RuntimeFormComponentOptions> = {},
): any {
  const valueAttrName = options.valueAttrName ?? 'value';
  const onChangeAttrName = options.onChangeAttrName ?? 'onChange';

  const FormComponent = React.forwardRef<any, any>(({ form, name, ...rest }, ref) => {
    const formControlProps = useFormControlProps(form, name, {
      valueAttrName,
      onChangeAttrName,
      getValue: options.getValue,
    });

    return <Component {...rest} {...formControlProps} name={name} ref={ref} />;
  });

  FormComponent.displayName = `FormComponent(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return FormComponent;
}

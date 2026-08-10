import React, { useCallback, type ComponentType } from 'react';
import type { Form, FormValues } from '@avinlab/form';
import { useFormWatch } from './hooks/useFormWatch';

type StringKeyOf<T> = Extract<keyof T, string>;
type DefaultKey<T, TKey extends string> = Extract<TKey, StringKeyOf<T>>;
type FunctionArgs<T> = T extends (...args: infer TArgs) => unknown ? TArgs : never;
type ChangeArgs<TProps, TOnChangeAttrName extends keyof TProps> = FunctionArgs<
  NonNullable<TProps[TOnChangeAttrName]>
>;
type FirstArgument<TArgs extends unknown[]> = TArgs extends [infer TFirst, ...unknown[]]
  ? TFirst
  : never;

interface FormComponentOptions<
  TProps extends object = Record<string, unknown>,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = FirstArgument<ChangeArgs<TProps, TOnChangeAttrName>>,
> {
  valueAttrName?: TValueAttrName;
  getValue?: (...args: ChangeArgs<TProps, TOnChangeAttrName>) => TExtractedValue;
  onChangeAttrName?: TOnChangeAttrName;
}

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
  TComponent extends React.MemoExoticComponent<infer TWrappedComponent>
    ? ComponentRefProps<TWrappedComponent>
    : TComponent extends React.LazyExoticComponent<infer TWrappedComponent>
    ? ComponentRefProps<TWrappedComponent>
    : TComponent extends React.ComponentClass<any>
    ? Pick<React.ComponentPropsWithRef<TComponent>, 'ref'>
    : TComponent extends React.ForwardRefExoticComponent<any>
    ? Pick<React.ComponentPropsWithRef<TComponent>, 'ref'>
    : {};

type FormComponent<
  TComponent extends ComponentType<any>,
  TProps extends object,
  TValueAttrName extends keyof TProps,
  TOnChangeAttrName extends keyof TProps,
  TExtractedValue,
> = {
  <TFormValues extends FormValues>(
    props: {
      form: Form<TFormValues>;
      name: CompatibleFieldName<TFormValues, TProps, TValueAttrName, TExtractedValue>;
    } & Omit<TProps, 'form' | 'name' | 'ref' | TValueAttrName | TOnChangeAttrName> &
      ComponentRefProps<TComponent>,
  ): React.ReactElement;
  displayName?: string;
};

export function createFormComponent<
  TProps extends object,
  TValueAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'value'>,
  TOnChangeAttrName extends StringKeyOf<TProps> = DefaultKey<TProps, 'onChange'>,
  TExtractedValue = FirstArgument<ChangeArgs<TProps, TOnChangeAttrName>>,
  TComponent extends ComponentType<TProps> = ComponentType<TProps>,
>(
  Component: TComponent & ComponentType<TProps>,
  options?: FormComponentOptions<TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue>,
): FormComponent<TComponent, TProps, TValueAttrName, TOnChangeAttrName, TExtractedValue>;
export function createFormComponent(
  Component: ComponentType<any>,
  options: {
    valueAttrName?: string;
    getValue?: (...args: any[]) => any;
    onChangeAttrName?: string;
  } = {},
): any {
  const valueAttrName = options.valueAttrName ?? 'value';
  const onChangeAttrName = options.onChangeAttrName ?? 'onChange';

  const FormComponent = React.forwardRef<any, any>(({ form, name, ...rest }, ref) => {
    const value = useFormWatch(form, name);
    const handleChange = useCallback(
      (...args: any[]) => {
        form.setValue(name, options.getValue ? options.getValue(...args) : args[0]);
      },
      [form, name],
    );

    return (
      <Component
        {...rest}
        {...{ [valueAttrName]: value, [onChangeAttrName]: handleChange }}
        name={name}
        ref={ref}
      />
    );
  });

  FormComponent.displayName = `FormComponent(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return FormComponent;
}

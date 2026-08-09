import React from 'react';
import type { Form, FormValues } from '@avinlab/form';
import cn from 'clsx';

type FormFieldErrors<TFormValues extends FormValues> = Partial<Record<keyof TFormValues, string>>;

interface Props<TFormValues extends FormValues, TFieldName extends keyof TFormValues>
  extends React.PropsWithChildren<{}> {
  label: React.ReactNode;
  form: Form<TFormValues>;
  errors: FormFieldErrors<TFormValues>;
  name: TFieldName;
  isSubmitted: boolean;
  rightContent?: React.ReactNode;
}

export function FormField<TFormValues extends FormValues, TFieldName extends keyof TFormValues>({
  isSubmitted,
  label,
  form,
  name,
  errors,
  children,
  rightContent,
  ...props
}: Props<TFormValues, TFieldName>) {
  const error = isSubmitted ? errors[name] : '';
  // const error = errors[name];

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        name: String(name),
        onChange: (fieldValue: TFormValues[TFieldName]) => {
          form.setValue(name, fieldValue);
        },
        defaultValue: form.values[name] || '',
        className: cn(child.props.className, {
          'border border-red-400': !!error,
        }),
      });
    }
    return child;
  });

  return (
    <div className="">
      <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
      <div className="relative">
        {childrenWithProps}
        <div className="absolute top-[50%] translate-y-[-50%] right-2">{rightContent}</div>
      </div>

      {!!error && <div className="text-red-500 text-sm mt-1">{errors[name]}</div>}
    </div>
  );
}

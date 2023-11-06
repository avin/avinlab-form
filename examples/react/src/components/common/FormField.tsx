import React from 'react';
import type { Form } from '@avinlab/form';
import cn from 'clsx';

interface Props extends React.PropsWithChildren<{}> {
  label: React.ReactNode;
  form: Form;
  errors: Record<string, any>;
  name: string;
  isSubmitted: boolean;
  rightContent?: React.ReactNode;
}

export function FormField({
  isSubmitted,
  label,
  form,
  name,
  errors,
  children,
  rightContent,
  ...props
}: Props) {
  // const error = isSubmitted ? errors[name] : '';
  const error = errors[name];

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        name: name,
        onChange: (v: string) => {
          form.setValue(name, v);
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

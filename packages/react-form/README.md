# @avinlab/react-form

A React library for building forms with ease, providing hooks for managing form state and validation in React applications.

## Features

- 🎯 **Easy to use**: Simple API for managing form state with minimal boilerplate.
- 🔧 **Customizable**: Extendable to fit the needs of your specific form logic.
- 🚀 **Performance**: Optimized to reduce unnecessary renders and improve performance.

## Installation

```sh
npm install @avinlab/react-form
```

### Playground

Online example is [here](https://stackblitz.com/edit/vitejs-vite-4bwk8r?file=src%2Fcomponents%2Fforms%2FCardForm.tsx)

## Usage

Create form with validation:

```jsx
import React from 'react';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

const ExampleForm = () => {
  const form = useForm({ name: 'Bob', age: 20 });

  const { errors, isValid, validate } = useFormValidation(form, (values, prevValues) => {
    const errors = {};
    if (!values.name) {
      errors.name = 'Name is required';
    }
    if (values.age && values.age < 18) {
      errors.age = 'Must be at least 18';
    }
    return errors;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      console.log(form.values);
    }
  };

  // If you want to render the form values:
  // const nameValue = useFormWatch(form, 'name');
  // const formValuesObj = useFormWatch(form);

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        defaultValue={form.values.name}
        onChange={(e) => form.setValue('name', e.currentTarget.value)}
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        name="age"
        defaultValue={form.values.age}
        onChange={(e) => form.setValue('name', e.currentTarget.value)}
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
};
```

### Examples

For more advanced examples, check out the [example directory](../../examples/react).

### Creating controlled components faster

You can use `createFormComponent` helper to quickly bind form fields to the form state:

```jsx
import { createFormComponent, useForm } from '@avinlab/react-form';

const TextInput = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
    <input className="input w-full" {...props} />
  </label>
);

const FormTextInput = createFormComponent(TextInput, {
  getValue: (event) => event.currentTarget.value,
});

const CheckboxInput = ({ label, ...props }) => (
  <label className="inline-flex items-center space-x-2">
    <input type="checkbox" {...props} />
    <span>{label}</span>
  </label>
);

const FormCheckboxInput = createFormComponent(CheckboxInput, {
  valueAttrName: 'checked',
  getValue: (event) => event.target.checked,
});

export function ProfileForm() {
  const form = useForm({ email: '', accepted: false });

  return (
    <form className="space-y-4">
      <FormTextInput form={form} name="email" label="Email" placeholder="john@doe.com" />
      <FormCheckboxInput form={form} name="accepted" label="I agree with the terms" />
    </form>
  );
}
```

`createFormComponent` accepts an optional options object as a second argument:

- `valueAttrName` – name of the prop that receives the form value (defaults to `"value"`).
- `onChangeAttrName` – name of the change handler prop (defaults to `"onChange"`).
- `getValue(event)` – function that extracts the value to store in the form. By default it simply returns whatever is passed as the first argument of the `onChange` handler.

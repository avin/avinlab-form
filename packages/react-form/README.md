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

## Usage

Create form with validation:

```jsx
import React from 'react';
import { useForm, useFormValidation } from '@avinlab/react-form';

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
  // const nameValue = useWatch(form, 'name');
  // const formValuesObj = useWatch(form);

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

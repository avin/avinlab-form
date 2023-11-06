# @avinlab/form

## Install

```sh
npm install @avinlab/form
```

## Usage

Create a form and manage its values:

```js
import { createForm } from '@avinlab/form';

// Create a form with initial values
const initialValues = { name: 'John', age: 30 };
const form = createForm(initialValues);

// Subscribe to updates
const handleUpdateForm = (newValues, prevValues) => {
  console.log('Form updated', { newValues, prevValues });
};
form.onUpdate(handleUpdateForm);

const handleUpdateAgeField = (newValue, oldValue) => {
  console.log('Field "age" updated', { newValue, oldValue });
};
form.onUpdateField('age', handleUpdateAgeField);

// Set form values
form.setValue('name', 'Jane');
form.setValue('age', 31);

// Unsubscribe from updates
form.offUpdate(handleUpdateForm);
form.offUpdateField('age', handleUpdateAgeField);
```

Form validation management:

```js
import { createForm, createFormValidation } from '@avinlab/form';

const initialValues = { name: 'John', age: 30 };
const form = createForm(initialValues);

const formValidation = createFormValidation(form, (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Name is required';
  }
  if (values.age && values.age < 18) {
    errors.age = 'Must be at least 18';
  }
  return errors;
});

console.log(formValidation.errors); // Output: {}
console.log(formValidation.isValid); // Output: true

// Set an incorrect value for the age field
form.setValue('age', 15);

console.log(formValidation.errors); // Output: {age: 'Must be at least 18'}
console.log(formValidation.isValid); // Output: false

// Subscribe to validation changes
const handler = (errors) => {
  console.log(errors);
};
formValidation.onValidate(handler);

// Unsubscribe from validation updates
formValidation.offValidate(handler);

// Validation is triggered automatically when the form values change,
// but you can also initiate validation manually
formValidation.validate();
```

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Form } from './createForm';
import { createForm } from './createForm';

describe('createForm', () => {
  let form: Form<{ name: string; age: number }>;
  const initialValues = { name: 'John', age: 30 };

  beforeEach(() => {
    form = createForm(initialValues);
  });

  it('should initialize form values correctly', () => {
    expect(form.values).toEqual(initialValues);
  });

  it('should update form values and call update handlers', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.setValue('name', 'Jane');

    expect(form.values.name).toBe('Jane');
    expect(updateHandler).toHaveBeenCalledWith({ ...initialValues, name: 'Jane' }, initialValues);
  });

  it('should not call update handlers if value is the same', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.setValue('name', 'John'); // same as initial value

    expect(updateHandler).not.toHaveBeenCalled();
  });

  it('should call field-specific update handlers', () => {
    const fieldUpdateHandler = vi.fn();
    form.onUpdateField('age', fieldUpdateHandler);
    form.setValue('age', 31);

    expect(fieldUpdateHandler).toHaveBeenCalledWith(31, 30);
  });

  it('should call field-specific update handlers and full update handlers on update all form values', () => {
    const ageUpdateHandler = vi.fn();
    const nameUpdateHandler = vi.fn();
    const fullFormUpdateHandler = vi.fn();
    form.onUpdateField('age', ageUpdateHandler);
    form.onUpdateField('name', nameUpdateHandler);
    form.onUpdate(fullFormUpdateHandler);

    form.setValues({ ...initialValues, age: 31 });

    expect(ageUpdateHandler).toHaveBeenCalledWith(31, 30);
    expect(fullFormUpdateHandler).toHaveBeenCalledWith(
      { ...initialValues, age: 31 },
      initialValues,
    );
    expect(nameUpdateHandler).not.toHaveBeenCalled();
  });

  it('should not call any updates handlers if nothing changed', () => {
    const ageUpdateHandler = vi.fn();
    const nameUpdateHandler = vi.fn();
    const fullFormUpdateHandler = vi.fn();
    form.onUpdateField('age', ageUpdateHandler);
    form.onUpdateField('name', nameUpdateHandler);
    form.onUpdate(fullFormUpdateHandler);

    form.setValues({ ...initialValues });

    expect(ageUpdateHandler).not.toHaveBeenCalled();
    expect(fullFormUpdateHandler).not.toHaveBeenCalled();
    expect(nameUpdateHandler).not.toHaveBeenCalled();
  });

  it('should correctly remove update handlers', () => {
    const updateHandler = vi.fn();
    form.onUpdate(updateHandler);
    form.offUpdate(updateHandler);
    form.setValue('name', 'Jane');

    expect(updateHandler).not.toHaveBeenCalled();
  });

  it('should correctly remove field-specific update handlers', () => {
    const fieldUpdateHandler = vi.fn();
    form.onUpdateField('age', fieldUpdateHandler);
    form.offUpdateField('age', fieldUpdateHandler);
    form.setValue('age', 31);

    expect(fieldUpdateHandler).not.toHaveBeenCalled();
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import { createForm } from '@avinlab/form';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import * as ReactForm from './index';

const { createFormComponent } = ReactForm;

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextInput = ({ label, value, onChange }: TextInputProps) => (
  <input
    aria-label={label}
    value={value}
    onChange={(event) => onChange((event.currentTarget as unknown as { value: string }).value)}
  />
);

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ checked, label, onChange }: ToggleProps) => (
  <button aria-pressed={checked} onClick={() => onChange(!checked)} type="button">
    {label}
  </button>
);

interface AmountInputProps {
  amount: number;
  label: string;
  onAmountChange: (event: { detail: string }) => void;
}

const AmountInput = ({ amount, label, onAmountChange }: AmountInputProps) => (
  <button onClick={() => onAmountChange({ detail: '42' })} type="button">
    {label}: {amount}
  </button>
);

describe('createFormComponent', () => {
  it('is the only public generated-control abstraction', () => {
    expect('useFormControlProps' in ReactForm).toBe(false);
  });

  it('binds a text control to one field without rerendering for unrelated changes', () => {
    const renderSpy = vi.fn();
    const TrackedTextInput = (props: TextInputProps) => {
      renderSpy();

      return <TextInput {...props} />;
    };
    const FormTextInput = createFormComponent(TrackedTextInput);
    const form = createForm({ email: 'first@example.com', note: 'unchanged' });

    render(<FormTextInput form={form} name="email" label="Email" />);

    expect((screen.getByLabelText('Email') as unknown as { value: string }).value).toBe(
      'first@example.com',
    );
    expect(renderSpy).toHaveBeenCalledTimes(1);

    act(() => form.setValue('note', 'updated'));

    expect(renderSpy).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'next@example.com' } });

    expect(form.values.email).toBe('next@example.com');
    expect((screen.getByLabelText('Email') as unknown as { value: string }).value).toBe(
      'next@example.com',
    );
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('updates fields whose keys are an empty string or zero', () => {
    const FormTextInput = createFormComponent(TextInput);
    const form = createForm({ '': 'empty', 0: 'zero' });

    render(
      <>
        <FormTextInput form={form} name="" label="Empty key" />
        <FormTextInput form={form} name={0} label="Zero key" />
      </>,
    );

    fireEvent.change(screen.getByLabelText('Empty key'), { target: { value: 'next empty' } });
    fireEvent.change(screen.getByLabelText('Zero key'), { target: { value: 'next zero' } });

    expect(form.values['']).toBe('next empty');
    expect(form.values[0]).toBe('next zero');
  });

  it('supports checkbox-style value attributes', () => {
    const FormToggle = createFormComponent(Toggle, { valueAttrName: 'checked' });
    const form = createForm({ accepted: false });

    render(<FormToggle form={form} name="accepted" label="Accept" />);

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(form.values.accepted).toBe(true);
    expect(
      (
        screen.getByRole('button', { name: 'Accept' }) as unknown as {
          getAttribute: (name: string) => string | null;
        }
      ).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('supports custom value and change attributes with an extractor', () => {
    const FormAmountInput = createFormComponent(AmountInput, {
      valueAttrName: 'amount',
      onChangeAttrName: 'onAmountChange',
      getValue: (event) => Number(event.detail),
    });
    const form = createForm({ total: 1 });

    render(<FormAmountInput form={form} name="total" label="Amount" />);

    fireEvent.click(screen.getByRole('button', { name: 'Amount: 1' }));

    expect(form.values.total).toBe(42);
    expect(screen.getByRole('button', { name: 'Amount: 42' })).toBeDefined();
  });

  it('exposes type-safe field and configured prop bindings', () => {
    interface FlexibleInputProps {
      current: string | number;
      label: string;
      onCurrentChange: (event: { next: string }) => void;
    }

    const FlexibleInput = (_props: FlexibleInputProps) => null;
    const FormTextInput = createFormComponent(TextInput);
    const FormToggle = createFormComponent(Toggle, { valueAttrName: 'checked' });
    const FormAmountInput = createFormComponent(AmountInput, {
      valueAttrName: 'amount',
      onChangeAttrName: 'onAmountChange',
      getValue: (event) => {
        // @ts-expect-error The extractor event is the configured handler's event, not `any`.
        String(event.missing);

        return Number(event.detail);
      },
    });
    const FormFlexibleInput = createFormComponent(FlexibleInput, {
      valueAttrName: 'current',
      onChangeAttrName: 'onCurrentChange',
      getValue: (event) => Number(event.next),
    });
    const form = createForm({ accepted: false, email: '', total: 0 });
    const validBindings = [
      <FormTextInput key="text" form={form} name="email" label="Email" />,
      <FormToggle key="toggle" form={form} name="accepted" label="Accepted" />,
      <FormAmountInput key="amount" form={form} name="total" label="Amount" />,
      <FormFlexibleInput key="flexible" form={form} name="total" label="Flexible" />,
    ];
    const rejectedBindings = [
      // @ts-expect-error A boolean field cannot bind to a string value prop and extractor result.
      <FormTextInput key="invalid-field" form={form} name="accepted" label="Invalid field" />,
      // @ts-expect-error The generated binding owns the configured value prop.
      <FormTextInput key="text-value" form={form} name="email" label="Conflict" value="manual" />,
      <FormTextInput
        key="text-change"
        form={form}
        name="email"
        label="Conflict"
        // @ts-expect-error The generated binding owns the configured change prop.
        onChange={() => undefined}
      />,
      <FormAmountInput
        key="invalid-custom-field"
        form={form}
        // @ts-expect-error A string field cannot bind to the custom numeric value and extractor.
        name="email"
        label="Invalid custom field"
      />,
      <FormFlexibleInput
        key="invalid-extractor"
        form={form}
        // @ts-expect-error The value prop accepts strings, but the numeric extractor cannot update one.
        name="email"
        label="Invalid extractor"
      />,
      // @ts-expect-error The custom value prop is supplied by the generated binding.
      <FormAmountInput key="custom-value" form={form} name="total" label="Conflict" amount={10} />,
      <FormAmountInput
        key="custom-change"
        form={form}
        name="total"
        label="Conflict"
        // @ts-expect-error The custom change prop is supplied by the generated binding.
        onAmountChange={() => undefined}
      />,
    ];

    expect(validBindings).toHaveLength(4);
    expect(rejectedBindings).toHaveLength(7);
  });
});

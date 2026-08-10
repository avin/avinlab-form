import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CoreValidation } from './22-CoreValidation';

describe('CoreValidation example', () => {
  it('creates a working validation controller again after remounting', () => {
    const firstRender = render(<CoreValidation />);

    fireEvent.click(screen.getByRole('button', { name: 'Set invalid value' }));
    expect(screen.getByText('invalid: Must be positive')).toBeDefined();

    firstRender.unmount();
    render(<CoreValidation />);

    fireEvent.click(screen.getByRole('button', { name: 'Set valid value' }));
    expect(screen.getByText('valid: no errors')).toBeDefined();
  });
});

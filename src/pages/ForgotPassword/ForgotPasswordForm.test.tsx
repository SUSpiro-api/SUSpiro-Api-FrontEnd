import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('does not call submitter for an invalid CPF', () => {
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm onBack={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '123' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Recuperação de senha' }));

    expect(screen.getByRole('alert')).toHaveTextContent('CPF válido');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid CPF', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ForgotPasswordForm onBack={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Recuperação de senha' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('111.444.777-35'));
  });
});

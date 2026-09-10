import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import type { LoginFormValues } from '../../features/auth/types';

const initialValues: LoginFormValues = {
  identifier: '',
  password: '',
  rememberIdentifier: false,
};

describe('LoginForm - Criar conta', () => {
  it('does not render the "Criar conta" link when onCreateAccount is not provided', () => {
    render(
      <LoginForm
        values={initialValues}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Criar conta')).not.toBeInTheDocument();
  });

  it('renders the "Criar conta" link when onCreateAccount is provided', () => {
    render(
      <LoginForm
        values={initialValues}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCreateAccount={vi.fn()}
      />,
    );

    expect(screen.getByText('Criar conta')).toBeInTheDocument();
  });

  it('calls onCreateAccount when the link is clicked', () => {
    const onCreateAccount = vi.fn();

    render(
      <LoginForm
        values={initialValues}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCreateAccount={onCreateAccount}
      />,
    );

    fireEvent.click(screen.getByText('Criar conta'));

    expect(onCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('does not submit the login form when "Criar conta" is clicked', () => {
    const onSubmit = vi.fn();
    const onCreateAccount = vi.fn();

    render(
      <LoginForm
        values={initialValues}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        onCreateAccount={onCreateAccount}
      />,
    );

    fireEvent.click(screen.getByText('Criar conta'));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../Login/LoginForm';
import type { LoginFormValues } from '../../features/auth/types';

const initialValues: LoginFormValues = {
  identifier: '',
  password: '',
  rememberIdentifier: false,
};

function renderForm(
  onSubmit = vi.fn().mockResolvedValue(undefined),
  values = initialValues,
) {
  const onChange = vi.fn();

  render(
    <LoginForm values={values} onChange={onChange} onSubmit={onSubmit} />,
  );

  return { onSubmit, onChange };
}

describe('LoginForm', () => {
  it('shows validation errors and does not submit invalid data', async () => {
    const { onSubmit } = renderForm();

    fireEvent.submit(
      screen.getByRole('form', { name: 'Formulário de autenticação' }),
    );

    expect(screen.getByText('Informe seu CPF ou e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const values: LoginFormValues = {
      identifier: '529.982.247-25',
      password: 'senha-segura',
      rememberIdentifier: true,
    };

    renderForm(onSubmit, values);

    fireEvent.submit(
      screen.getByRole('form', { name: 'Formulário de autenticação' }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(values));
  });

  it('displays a connection error when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('connection failed'));
    const values: LoginFormValues = {
      identifier: 'usuario@suspiro.gov.br',
      password: 'senha-segura',
      rememberIdentifier: false,
    };

    renderForm(onSubmit, values);

    fireEvent.submit(
      screen.getByRole('form', { name: 'Formulário de autenticação' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao serviço.',
    );
  });
});

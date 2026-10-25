import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import type { LoginFormValues } from '../../features/auth/types';
import type { LoginFieldErrors } from '../../features/auth/useLoginForm';

const initialValues: LoginFormValues = {
  cpf: '',
  password: '',
  rememberCpf: false,
};

const noErrors: LoginFieldErrors = {};

function renderForm(
  onSubmit = vi.fn().mockResolvedValue(undefined),
  values = initialValues,
  fieldErrors = noErrors,
) {
  const onChange = vi.fn();
  render(
    <LoginForm
      values={values}
      fieldErrors={fieldErrors}
      onChange={onChange}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, onChange };
}

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders CPF and password fields', () => {
    renderForm();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha de acesso')).toBeInTheDocument();
  });

  it('does not show the patient birth-date password instruction on the login screen', () => {
    renderForm();
    expect(screen.queryByText(/Primeiro acesso de paciente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DDMMAAAA/i)).not.toBeInTheDocument();
  });

  it('submits the values received from the container', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const values: LoginFormValues = {
      cpf: '529.982.247-25',
      password: 'senha-segura',
      rememberCpf: true,
    };

    renderForm(onSubmit, values);
    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(values));
  });

  it('displays a friendly error when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('connection failed'));
    const values: LoginFormValues = { ...initialValues, cpf: '529.982.247-25', password: 'senha-segura' };

    renderForm(onSubmit, values);
    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao serviço.');
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';
import type { AuthService } from '../../features/auth/types';

function renderLogin(overrides?: Partial<AuthService>) {
  const authService: AuthService = {
    login: vi.fn().mockResolvedValue(undefined),
    restoreSession: vi.fn().mockResolvedValue(null),
    logout: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<Login authService={authService} />);
  return authService;
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('blocks invalid credentials before calling the authentication service', async () => {
    const authService = renderLogin();

    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    expect(await screen.findByText('Informe um CPF válido com 11 dígitos.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits normalized CPF credentials to the authentication service', async () => {
    const authService = renderLogin();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        cpf: '111.444.777-35',
        password: 'senha1234',
      });
    });
  });
  it('uses the same login form for a patient with a temporary password', () => {
    renderLogin();

    expect(screen.getByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha de acesso')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Entrar como paciente/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Data de nascimento')).not.toBeInTheDocument();
  });

});

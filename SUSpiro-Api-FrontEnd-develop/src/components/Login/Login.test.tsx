import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';
import type { AuthService } from '../../features/auth/types';

function renderLogin(overrides?: Partial<AuthService>) {
  const authService: AuthService = {
    login: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<Login authService={authService} />);
  return authService;
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('blocks invalid credentials before calling the authentication service', async () => {
    const authService = renderLogin();

    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    expect(await screen.findByText('Informe um CPF válido com 11 dígitos.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits normalized CPF credentials to the authentication service', async () => {
    const authService = renderLogin();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Formulário de autenticação' }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        cpf: '529.982.247-25',
        password: 'senha1234',
      });
    });
  });
});

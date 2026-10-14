import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setToken } from '../../features/auth/token';
import { HomePage } from './HomePage';

function login(perfil: string) {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);
  setToken(
    [encode({ alg: 'HS256' }), encode({ sub: '52998224725', perfil, iat: now, exp: now + 3600 }), 'x'].join('.'),
  );
}

describe('HomePage', () => {
  beforeEach(() => localStorage.clear());

  it('shows the actions allowed for a receptionist and navigates when one is opened', () => {
    login('RECEPCIONISTA');
    const onNavigate = vi.fn();

    render(<HomePage onNavigate={onNavigate} />);

    expect(screen.queryByText('Cadastrar funcionário')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Cadastrar cidadão/ }));
    expect(onNavigate).toHaveBeenCalledWith('/cadastro-cidadao');
  });

  it('shows both actions to admins', () => {
    login('ADMIN');

    render(<HomePage onNavigate={vi.fn()} />);

    expect(screen.getByRole('link', { name: /Cadastrar cidadão/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cadastrar funcionário/ })).toBeInTheDocument();
  });

  it('explains when the profile has no available actions instead of showing an empty page', () => {
    login('USUARIO');

    render(<HomePage onNavigate={vi.fn()} />);

    expect(screen.queryByRole('link', { name: /Cadastrar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Seu perfil ainda não tem ações disponíveis');
  });
});

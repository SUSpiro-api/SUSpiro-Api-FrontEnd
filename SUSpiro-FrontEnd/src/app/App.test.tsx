import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { expireSession } from '../features/auth/session';
import { authService } from '../features/auth/service';
import { getCurrentUser, getToken, setToken } from '../features/auth/token';

function makeToken(perfil: string): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);

  return [
    encode({ alg: 'HS256' }),
    encode({ sub: '52998224725', perfil, iat: now, exp: now + 3600 }),
    'assinatura',
  ].join('.');
}

const loginForm = () => screen.getByRole('form', { name: 'Formulário de autenticação' });
const mainNav = () => within(screen.getByRole('navigation', { name: 'Navegação principal' }));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('shows the login without a "Criar conta" option, since accounts are created by admins', () => {
    render(<App />);

    expect(loginForm()).toBeInTheDocument();
    expect(screen.queryByText('Criar conta')).not.toBeInTheDocument();
  });

  it('sends unknown routes to the login when there is no session', () => {
    window.history.pushState({}, '', '/criar-conta');

    render(<App />);

    expect(loginForm()).toBeInTheDocument();
  });

  it('shows the home with the profile name and a masked CPF, never the raw profile value', () => {
    setToken(makeToken('RECEPCIONISTA'));

    render(<App />);

    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.queryByText('529.982.247-25')).not.toBeInTheDocument();
    expect(screen.queryByText('RECEPCIONISTA')).not.toBeInTheDocument();
    expect(screen.getByText('Você está acessando como Recepcionista. Escolha o que deseja fazer.')).toBeInTheDocument();
  });

  it('offers only the navigation allowed for the profile', () => {
    setToken(makeToken('RECEPCIONISTA'));

    render(<App />);

    expect(mainNav().getByRole('link', { name: 'Cadastrar cidadão' })).toBeInTheDocument();
    expect(mainNav().queryByRole('link', { name: 'Cadastrar funcionário' })).not.toBeInTheDocument();
  });

  it('offers employee registration to admins', () => {
    setToken(makeToken('ADMIN'));

    render(<App />);

    expect(mainNav().getByRole('link', { name: 'Cadastrar funcionário' })).toBeInTheDocument();
  });

  it('redirects a doctor to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('MEDICO'));
      return getCurrentUser()!;
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('redirects an admin to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('ADMIN'));
      return getCurrentUser()!;
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('navigates through the menu and marks the current page', () => {
    setToken(makeToken('RECEPCIONISTA'));
    render(<App />);

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar cidadão' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Cadastrar cidadão' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/cadastro-cidadao');
    expect(mainNav().getByRole('link', { name: 'Cadastrar cidadão' })).toHaveAttribute('aria-current', 'page');
    expect(mainNav().getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  it('ends the session and returns to the login when the user logs out', () => {
    setToken(makeToken('RECEPCIONISTA'));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(loginForm()).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it('returns to the login when the session expires while the app is open', () => {
    setToken(makeToken('RECEPCIONISTA'));
    render(<App />);
    expect(screen.getByText('Bem-vindo(a) ao SUSpiro')).toBeInTheDocument();

    act(() => {
      expireSession();
    });

    expect(loginForm()).toBeInTheDocument();
  });

  it('blocks employee registration for profiles without permission', () => {
    setToken(makeToken('MEDICO'));
    window.history.pushState({}, '', '/cadastro-funcionario');

    render(<App />);

    expect(screen.getByText('Acesso não autorizado')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Formulário de cadastro de funcionário' })).not.toBeInTheDocument();
  });

  it('sets a distinct title for each screen', () => {
    const { unmount } = render(<App />);
    expect(document.title).toBe('Entrar · SUSpiro');
    unmount();

    setToken(makeToken('RECEPCIONISTA'));
    render(<App />);
    expect(document.title).toBe('Início · SUSpiro');

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar cidadão' }));
    expect(document.title).toBe('Cadastrar cidadão · SUSpiro');
  });
});

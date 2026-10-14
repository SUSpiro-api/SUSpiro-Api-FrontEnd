// Testa os principais estados do aplicativo.

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { expireSession } from '../features/auth/session';
import { authService } from '../features/auth/service';
import { clearToken, getCurrentUser, getToken, setToken } from '../features/auth/token';

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

async function bootWithoutSession() {
  vi.spyOn(authService, 'restoreSession').mockResolvedValue(null);
  const view = render(<App />);
  await screen.findByRole('form', { name: 'Formulário de autenticação' });
  return view;
}

async function bootWithSession(perfil: string) {
  setToken(makeToken(perfil));
  vi.spyOn(authService, 'restoreSession').mockResolvedValue(getCurrentUser());
  render(<App />);
  await screen.findByRole('navigation', { name: 'Navegação principal' });
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('keeps the existing public entry point for account creation', async () => {
    await bootWithoutSession();

    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByRole('form', { name: 'Formulário de cadastro de funcionário' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/criar-conta');
  });

  it('sends unknown routes to the home route and shows the login without a session', async () => {
    window.history.pushState({}, '', '/rota-inexistente');

    await bootWithoutSession();
    expect(screen.getByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
  });

  it('shows the home with the profile name and a masked CPF, never the raw profile value', async () => {
    await bootWithSession('RECEPCIONISTA');

    expect(screen.getByText('Recepcionista · •••.•••.•••-25')).toBeInTheDocument();
    expect(screen.queryByText('529.982.247-25')).not.toBeInTheDocument();
    expect(screen.queryByText('RECEPCIONISTA')).not.toBeInTheDocument();
    expect(screen.getByText('Você está acessando como Recepcionista. Escolha o que deseja fazer.')).toBeInTheDocument();
  });

  it('offers only the navigation allowed for the profile', async () => {
    await bootWithSession('RECEPCIONISTA');

    expect(mainNav().getByRole('link', { name: 'Cadastrar cidadão' })).toBeInTheDocument();
    expect(mainNav().queryByRole('link', { name: 'Cadastrar funcionário' })).not.toBeInTheDocument();
  });

  it('offers employee registration to admins', async () => {
    await bootWithSession('ADMIN');

    expect(mainNav().getByRole('link', { name: 'Cadastrar funcionário' })).toBeInTheDocument();
  });

  it('redirects a doctor to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('MEDICO'));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('redirects an admin to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('ADMIN'));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('navigates through the menu and marks the current page', async () => {
    await bootWithSession('RECEPCIONISTA');

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar cidadão' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cadastrar cidadão' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/cadastro-cidadao');
    expect(mainNav().getByRole('link', { name: 'Cadastrar cidadão' })).toHaveAttribute('aria-current', 'page');
    expect(mainNav().getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  it('ends the session and returns to the login when the user logs out', async () => {
    await bootWithSession('RECEPCIONISTA');
    vi.spyOn(authService, 'logout').mockImplementation(async () => {
      clearToken();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it('returns to the login when the session expires while the app is open', async () => {
    await bootWithSession('RECEPCIONISTA');
    expect(screen.getByText('Bem-vindo(a) ao SUSpiro')).toBeInTheDocument();

    act(() => {
      expireSession();
    });

    expect(await screen.findByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
  });

  it('blocks employee registration for profiles without permission', async () => {
    setToken(makeToken('MEDICO'));
    window.history.pushState({}, '', '/cadastro-funcionario');

    render(<App />);

    expect(await screen.findByText('Acesso não autorizado')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Formulário de cadastro de funcionário' })).not.toBeInTheDocument();
  });

  it('sets a distinct title for each screen', async () => {
    const { unmount } = await bootWithoutSession();
    expect(document.title).toBe('Entrar · SUSpiro');
    unmount();

    await bootWithSession('RECEPCIONISTA');
    expect(document.title).toBe('Início · SUSpiro');

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar cidadão' }));
    expect(document.title).toBe('Cadastrar cidadão · SUSpiro');
  });
});

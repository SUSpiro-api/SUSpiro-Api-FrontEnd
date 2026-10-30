import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { expireSession } from '../features/auth/session';
import { authService } from '../features/auth/service';
import { clearToken, getCurrentUser, getToken, setAvisoSenhaFraca, setToken } from '../features/auth/token';

function makeToken(perfil: string): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);

  return [
    encode({ alg: 'HS256' }),
    encode({ sub: '11144477735', perfil, iat: now, exp: now + 3600 }),
    'assinatura',
  ].join('.');
}

const loginForm = () => screen.getByRole('form', { name: 'Formulário de autenticação' });
const mainNav = () => within(screen.getByRole('navigation', { name: /Navegação (principal|do atendimento|do agendamento|da gestão|do paciente)/ }));

async function bootWithoutSession() {
  window.history.pushState({}, '', '/login');
  vi.spyOn(authService, 'restoreSession').mockResolvedValue(null);
  const view = render(<App />);
  await screen.findByRole('form', { name: 'Formulário de autenticação' });
  return view;
}

async function bootWithSession(perfil: string) {
  window.history.pushState({}, '', '/');
  setToken(makeToken(perfil));
  vi.spyOn(authService, 'restoreSession').mockResolvedValue(getCurrentUser());
  render(<App />);
  await screen.findByRole('navigation', { name: 'Navegação principal' });
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearToken();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('shows the public homepage before a visitor enters the login flow', async () => {
    vi.spyOn(authService, 'restoreSession').mockResolvedValue(null);
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: /Quando o cuidado importa/ })).toBeInTheDocument();
    expect(document.title).toBe('Página inicial · SUSpiro');
    fireEvent.click(screen.getByRole('link', { name: /Acessar o SUSpiro/ }));
    expect(await screen.findByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('sends unknown routes to the public homepage when there is no session', async () => {
    window.history.pushState({}, '', '/rota-inexistente');
    vi.spyOn(authService, 'restoreSession').mockResolvedValue(null);
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: /Quando o cuidado importa/ })).toBeInTheDocument();
  });

  it('shows the home with the profile name and a masked CPF, never the raw profile value', async () => {
    await bootWithSession('ATENDENTE');

    expect(screen.getByText('Recepcionista · •••.•••.•••-25')).toBeInTheDocument();
    expect(screen.queryByText('111.444.777-35')).not.toBeInTheDocument();
    expect(screen.queryByText('ATENDENTE')).not.toBeInTheDocument();
    expect(screen.getByText('Você está acessando como Recepcionista. Escolha o que deseja fazer.')).toBeInTheDocument();
  });

  it('offers only the navigation allowed for the profile', async () => {
    await bootWithSession('ATENDENTE');

    expect(mainNav().getByRole('link', { name: 'Cadastrar paciente' })).toBeInTheDocument();
    expect(mainNav().queryByRole('link', { name: 'Cadastrar funcionário' })).not.toBeInTheDocument();
  });

  it('offers employee registration to admins', async () => {
    await bootWithSession('GERENTE');

    expect(mainNav().getByRole('link', { name: 'Cadastrar funcionário' })).toBeInTheDocument();
  });

  it('redirects a doctor to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('MEDICO'));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Visão geral' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it.each(['ATENDENTE', 'ENFERMEIRO'] as const)('redirects %s to the scheduling dashboard after login', async (perfil) => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken(perfil));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Central de agendamento' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
    expect(screen.queryByRole('heading', { name: 'Não foi possível carregar esta tela' })).not.toBeInTheDocument();
  });

  it('redirects an admin to the professional dashboard after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('GERENTE'));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Central de agendamento' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it.each(['MEDICO', 'SUPER_ADMIN'])('opens the scheduling center from the sidebar for %s', async (perfil) => {
    await bootWithSession(perfil);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    fireEvent.click(mainNav().getByRole('link', { name: 'Central de agendamento' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Central de agendamento' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Guias aguardando agendamento' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard/guias');
  });

  it('redirects a patient to their health area after login', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('PACIENTE'));
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: 'senha1234' } });
    fireEvent.submit(loginForm());

    expect(await screen.findByRole('heading', { level: 1, name: 'Minha saúde' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/minha-saude');
    expect(mainNav().getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
  });

  it('restores an authenticated patient who opened /login into the patient dashboard', async () => {
    setToken(makeToken('PACIENTE'));
    window.history.pushState({}, '', '/login');
    vi.spyOn(authService, 'restoreSession').mockResolvedValue(getCurrentUser());

    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Minha saúde' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/minha-saude');
  });

  it('shows the weak-password notice before the health area and continues when the patient presses OK', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null, { status: 204 }));
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('PACIENTE'));
      setAvisoSenhaFraca(true);
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: '20051990' } });
    fireEvent.submit(loginForm());

    const notice = await screen.findByRole('dialog', { name: 'Atenção: proteja a sua conta' });
    expect(notice).toHaveTextContent('senha provisória');
    expect(screen.queryByRole('heading', { level: 1, name: 'Minha saúde' })).not.toBeInTheDocument();

    fireEvent.click(within(notice).getByRole('button', { name: 'OK, entendi' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Minha saúde' }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/minha-saude');
    expect(screen.queryByRole('dialog', { name: 'Atenção: proteja a sua conta' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lets the patient go straight to the profile to change the password from the notice', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null, { status: 204 }));
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      setToken(makeToken('PACIENTE'));
      setAvisoSenhaFraca(true);
      return getCurrentUser()!;
    });

    await bootWithoutSession();

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '111.444.777-35' } });
    fireEvent.change(screen.getByLabelText('Senha de acesso'), { target: { value: '20051990' } });
    fireEvent.submit(loginForm());

    const notice = await screen.findByRole('dialog', { name: 'Atenção: proteja a sua conta' });
    fireEvent.click(within(notice).getByRole('button', { name: 'Quero trocar a minha senha agora' }));

    await vi.waitFor(() => expect(window.location.pathname).toBe('/perfil'));
    expect(screen.queryByRole('dialog', { name: 'Atenção: proteja a sua conta' })).not.toBeInTheDocument();
  });

  it('keeps the patient health page accessible directly without exposing it in the Super Admin menu', async () => {
    setToken(makeToken('SUPER_ADMIN'));
    window.history.pushState({}, '', '/minha-saude');

    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Minha saúde' }, { timeout: 5000 })).toBeInTheDocument();
    expect(mainNav().queryByRole('link', { name: 'Minha saúde' })).not.toBeInTheDocument();
  });

  it('navigates through the menu and marks the current page', async () => {
    await bootWithSession('ATENDENTE');

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar paciente' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cadastrar paciente' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/cadastro-cidadao');
    expect(mainNav().getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('aria-current', 'page');
    expect(mainNav().getByRole('link', { name: 'Central de agendamento' })).not.toHaveAttribute('aria-current');
  });

  it('ends the session and returns to the login when the user logs out', async () => {
    await bootWithSession('ATENDENTE');
    vi.spyOn(authService, 'logout').mockImplementation(async () => {
      clearToken();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('form', { name: 'Formulário de autenticação' })).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it('returns to the login when the session expires while the app is open', async () => {
    await bootWithSession('ATENDENTE');
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

    await bootWithSession('ATENDENTE');
    expect(document.title).toBe('Início · SUSpiro');

    fireEvent.click(mainNav().getByRole('link', { name: 'Cadastrar paciente' }));
    expect(document.title).toBe('Cadastrar paciente · SUSpiro');
  });
});

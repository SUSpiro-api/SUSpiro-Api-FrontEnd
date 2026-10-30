import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/httpClient';
import * as httpClient from '../../api/httpClient';
import { PerfilPage } from './PerfilPage';
import { clearToken } from '../auth/token';
import type { AuthUser } from '../auth/types';

const user: AuthUser = { sub: '11144477735', nome: 'Dra. Marina Duarte', perfil: 'MEDICO' };

function renderPerfil(overrides: Partial<Parameters<typeof PerfilPage>[0]> = {}) {
  const props = { user, onAtualizarUsuario: vi.fn(), onVoltar: vi.fn(), ...overrides };
  render(<PerfilPage {...props} />);
  return props;
}

function tokenDeTeste(): string {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: '11144477735', iat: now, exp: now + 3600, perfil: 'MEDICO', ver: 1 })}.signature`;
}

describe('PerfilPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    clearToken();
  });

  it('mostra os dados atuais da conta', () => {
    renderPerfil();

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Dra. Marina Duarte');
    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.getByText('Médico')).toBeInTheDocument();
  });

  it('abre o modo Proteja sua conta com foco na troca de senha', () => {
    renderPerfil({ securityMode: true });

    expect(screen.getByRole('heading', { level: 1, name: 'Proteja sua conta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Senha de acesso' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(screen.getByText('Informe a senha atual.')).toBeInTheDocument();
  });

  it('exige nome completo e foca o campo com erro', () => {
    renderPerfil();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveFocus();
  });

  it('salva o novo nome na sessão e confirma, sem tocar na API', async () => {
    const fetchSpy = vi.spyOn(httpClient, 'authenticatedFetch');
    const onAtualizarUsuario = vi.fn();
    renderPerfil({ onAtualizarUsuario });

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Dra. Marina Duarte Lima' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(screen.getByText('Alterações salvas')).toBeInTheDocument());
    expect(onAtualizarUsuario).toHaveBeenCalledWith({ nome: 'Dra. Marina Duarte Lima' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('pede a senha atual quando o profissional informa a nova senha', () => {
    renderPerfil();

    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'senha1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText('Informe a senha atual.')).toBeInTheDocument();
  });

  it('troca a senha pelo endpoint existente da API', async () => {
    const fetchSpy = vi.spyOn(httpClient, 'authenticatedFetch').mockResolvedValue({ token: tokenDeTeste(), senhaProvisoria: false });
    renderPerfil();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'senhaAntiga1' } });
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'SenhaNova2026!' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'SenhaNova2026!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(screen.getByText('Alterações salvas')).toBeInTheDocument());
    expect(fetchSpy).toHaveBeenCalledWith(
      '/usuarios/me/senha',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ senhaAtual: 'senhaAntiga1', novaSenha: 'SenhaNova2026!' }) }),
    );
  });

  it('mostra o erro da API quando a senha atual não confere', async () => {
    vi.spyOn(httpClient, 'authenticatedFetch').mockRejectedValue(
      new ApiError('Senha atual incorreta.', 400),
    );
    renderPerfil();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'errada123' } });
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'SenhaNova2026!' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'SenhaNova2026!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Senha atual incorreta.');
  });

  it('volta à edição depois de salvar', async () => {
    renderPerfil();

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'senhaAntiga1' } });
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'SenhaNova2026!' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'SenhaNova2026!' } });
    vi.spyOn(httpClient, 'authenticatedFetch').mockResolvedValue({ token: tokenDeTeste(), senhaProvisoria: false });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Continuar no perfil' }));

    expect(await screen.findByRole('form', { name: 'Formulário do perfil' })).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
  });
});

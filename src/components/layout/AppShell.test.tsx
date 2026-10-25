// Testa o menu e a navegação das telas internas.

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';
import { getNavItems } from './navigation';

const user = { sub: '52998224725', perfil: 'GERENTE' as const, iat: 0, exp: 9_999_999_999 };

function renderShell(overrides: Partial<Parameters<typeof AppShell>[0]> = {}) {
  const props = { current: '/', user, onNavigate: vi.fn(), onLogout: vi.fn(), ...overrides };
  render(<AppShell {...props}>conteúdo</AppShell>);
  return props;
}

function simulateMobileViewport() {
  const style = document.createElement('style');
  style.textContent = '.shell__menu-button { display: inline-flex !important; }';
  document.head.appendChild(style);
  return () => { style.remove(); };
}

describe('getNavItems', () => {
  it('always has the home and adds items according to the profile', () => {
    const paths = (perfil: Parameters<typeof getNavItems>[0]) => getNavItems(perfil).map((i) => i.path);

    expect(paths('PACIENTE')).toEqual(['/', '/minha-saude']);
    expect(paths('ATENDENTE')).toEqual(['/', '/dashboard', '/cadastro-cidadao']);
    expect(paths('GERENTE')).toEqual(['/', '/dashboard', '/cadastro-cidadao', '/cadastro-funcionario']);
    expect(paths(undefined)).toEqual(['/']);
  });
});

describe('AppShell', () => {
  it('shows the profile label, the masked CPF and the content', () => {
    renderShell();

    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Administrador · •••.•••.•••-25')).toBeInTheDocument();
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });

  it('marks only the current page in the menu', () => {
    renderShell({ current: '/cadastro-cidadao' });

    const nav = within(screen.getByRole('navigation', { name: 'Navegação da gestão' }));

    expect(nav.getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
  });

  it('navigates without reloading the page', () => {
    const { onNavigate } = renderShell();

    fireEvent.click(screen.getByRole('link', { name: 'Cadastrar paciente' }));

    expect(onNavigate).toHaveBeenCalledWith('/cadastro-cidadao');
  });

  it('mantém no menu administrativo apenas as rotas de gestão e operação', () => {
    renderShell({ current: '/dashboard' });

    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute('href', '/dashboard/agenda');
    expect(screen.getByRole('link', { name: 'Central de agendamento' })).toHaveAttribute('href', '/dashboard/guias');
    expect(screen.getByRole('link', { name: 'Buscar paciente' })).toHaveAttribute('href', '/dashboard/buscar-paciente');
    expect(screen.getByRole('link', { name: 'Buscar guia' })).toHaveAttribute('href', '/dashboard/buscar-guia');
    expect(screen.getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('href', '/cadastro-cidadao');
    expect(screen.getByRole('link', { name: 'Cadastrar funcionário' })).toHaveAttribute('href', '/cadastro-funcionario');
    expect(screen.queryByRole('link', { name: 'Minha saúde' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Atender paciente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Últimos pacientes' })).not.toBeInTheDocument();
  });

  it('oferece ao Super Admin acesso ao atendimento para emitir guias', () => {
    const superAdmin = { ...user, perfil: 'SUPER_ADMIN' as const };
    renderShell({ current: '/dashboard', user: superAdmin });
    expect(screen.getByRole('link', { name: 'Atender paciente' })).toHaveAttribute('href', '/dashboard/atendimento');
  });

  it('mostra ao médico as rotas de atendimento sem opções administrativas', () => {
    const doctor = { ...user, perfil: 'MEDICO' as const };
    const { onNavigate } = renderShell({ current: '/dashboard', user: doctor });

    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute('href', '/dashboard/agenda');
    expect(screen.getByRole('link', { name: 'Últimos pacientes' })).toHaveAttribute('href', '/dashboard/pacientes-recentes');
    expect(screen.getByRole('link', { name: 'Atividade recente' })).toHaveAttribute('href', '/dashboard/atividade-recente');
    expect(screen.getByRole('link', { name: 'Atender paciente' })).toHaveAttribute('href', '/dashboard/atendimento');
    expect(screen.getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('href', '/cadastro-cidadao');
    expect(screen.queryByRole('link', { name: 'Central de agendamento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cadastrar funcionário' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Atender paciente' }));
    expect(onNavigate).toHaveBeenCalledWith('/dashboard/atendimento');
  });

  it('mantém a navegação da recepção focada na fila e na busca', () => {
    const receptionist = { ...user, perfil: 'ATENDENTE' as const };
    renderShell({ current: '/dashboard', user: receptionist });

    expect(screen.getByRole('link', { name: 'Central de agendamento' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Buscar paciente' })).toHaveAttribute('href', '/dashboard/buscar-paciente');
    expect(screen.getByRole('link', { name: 'Buscar guia' })).toHaveAttribute('href', '/dashboard/buscar-guia');
    expect(screen.getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('href', '/cadastro-cidadao');
    expect(screen.queryByRole('link', { name: 'Atender paciente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Agenda' })).not.toBeInTheDocument();
  });

  it('logs out', () => {
    const { onLogout } = renderShell();

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the mobile menu with the button and the Escape key', () => {
    const restoreViewport = simulateMobileViewport();
    renderShell();

    const button = screen.getByRole('button', { name: 'Abrir menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
    restoreViewport();
  });

  it('closes the mobile menu after navigating', () => {
    const restoreViewport = simulateMobileViewport();
    renderShell();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByRole('link', { name: 'Início' }));

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    restoreViewport();
  });

  it('offers a link to skip the navigation', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toHaveAttribute('href', '#conteudo');
  });

  it('moves the focus to the content when the page changes', () => {
    const props = { user, onNavigate: vi.fn(), onLogout: vi.fn() };
    const { rerender } = render(
      <AppShell {...props} current="/">
        conteúdo
      </AppShell>,
    );
    expect(screen.getByRole('main')).not.toHaveFocus();

    rerender(
      <AppShell {...props} current="/cadastro-cidadao">
        conteúdo
      </AppShell>,
    );

    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('shows the patient workspace with their navigation and profile', () => {
    const patient = { sub: '16899546043', perfil: 'PACIENTE' as const, iat: 0, exp: 9_999_999_999 };
    const onLogout = vi.fn();
    render(
      <AppShell current="/minha-saude" user={patient} onNavigate={vi.fn()} onLogout={onLogout}>
        conteúdo
      </AppShell>,
    );

    const nav = within(screen.getByRole('navigation', { name: 'Navegação do paciente' }));
    expect(nav.getByRole('link', { name: 'Minha saúde' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');

    expect(screen.getByRole('link', { name: 'Meu perfil' })).toHaveAttribute('href', '/perfil');

    // O sair fica no cartão do menu lateral, não na barra superior.
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

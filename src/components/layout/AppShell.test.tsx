// Testa o menu e a navegação das telas internas.

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';
import { getNavItems } from './navigation';

const user = { sub: '52998224725', perfil: 'ADMIN' as const, iat: 0, exp: 9_999_999_999 };

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

    expect(paths('USUARIO')).toEqual(['/']);
    expect(paths('RECEPCIONISTA')).toEqual(['/', '/dashboard', '/cadastro-cidadao']);
    expect(paths('ADMIN')).toEqual(['/', '/dashboard', '/cadastro-cidadao', '/cadastro-funcionario']);
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

    const nav = within(screen.getByRole('navigation', { name: 'Navegação principal' }));

    expect(nav.getByRole('link', { name: 'Cadastrar cidadão' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  it('navigates without reloading the page', () => {
    const { onNavigate } = renderShell();

    fireEvent.click(screen.getByRole('link', { name: 'Cadastrar cidadão' }));

    expect(onNavigate).toHaveBeenCalledWith('/cadastro-cidadao');
  });

  it('direciona os atalhos do dashboard para as seções corretas', () => {
    renderShell({
      current: '/dashboard',
      children: (
        <>
          <div id="atender-paciente" />
          <div id="ultimos-pacientes" />
          <div id="atividade-recente" />
          <div id="acoes-rapidas" />
        </>
      ),
    });

    fireEvent.click(screen.getByRole('link', { name: 'Atender paciente' }));
    expect(window.location.hash).toBe('#atender-paciente');

    window.history.replaceState({}, '', '/dashboard');
    fireEvent.click(screen.getByRole('link', { name: 'Ações rápidas' }));
    expect(window.location.hash).toBe('#acoes-rapidas');
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
});

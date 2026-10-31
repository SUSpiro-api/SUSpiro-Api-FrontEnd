import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicHomePage } from './PublicHomePage';

describe('PublicHomePage', () => {
  it('apresenta os serviços, explica o acesso e oferece entrada no sistema', () => {
    const { container } = render(<PublicHomePage onNavigate={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: /Seus atendimentos, mais fáceis de acompanhar/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Consultas e retornos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Exames e procedimentos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Encaminhamentos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Comece em poucos passos.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar na minha conta' })).toHaveAttribute('href', '/login');
    expect(screen.queryByText('PLATAFORMA DE ATENDIMENTO EM SAÚDE')).not.toBeInTheDocument();
    expect(container.querySelector('.public-hero-photo__caption')).not.toBeInTheDocument();
    expect(container.querySelector('.material-symbols-outlined')).not.toBeInTheDocument();
  });


  it('exibe um rodapé institucional com navegação, acessos e orientações', () => {
    render(<PublicHomePage onNavigate={vi.fn()} />);

    expect(screen.getByRole('navigation', { name: 'Navegação institucional' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Acesso à plataforma' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Informações importantes' })).toBeInTheDocument();
    expect(screen.getByText(/não é um canal de urgência ou emergência/i)).toBeInTheDocument();
  });

  it('navega para o login sem recarregar a página', () => {
    const onNavigate = vi.fn();
    render(<PublicHomePage onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('link', { name: 'Acessar o SUSpiro' }));
    expect(onNavigate).toHaveBeenCalledWith('/login');
  });

  it('alterna a navegação móvel com um controle textual acessível', () => {
    render(<PublicHomePage onNavigate={vi.fn()} />);
    const menu = screen.getByRole('button', { name: 'Abrir menu', hidden: true });

    fireEvent.click(menu);
    expect(screen.getByRole('button', { name: 'Fechar menu', hidden: true })).toHaveAttribute('aria-expanded', 'true');
  });
});

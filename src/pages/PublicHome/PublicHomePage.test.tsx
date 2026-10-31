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
    expect(container.querySelector('.public-photo-credit')).not.toBeInTheDocument();
    expect(screen.queryByText(/Pexels/)).not.toBeInTheDocument();
  });

  it('mostra dúvidas frequentes no lugar do chamado final para entrar', () => {
    const { container } = render(<PublicHomePage onNavigate={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Respostas para as perguntas mais comuns.' })).toBeInTheDocument();
    expect(screen.getByText('Como faço o meu primeiro acesso?')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ir para o login' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.public-faq__item').length).toBeGreaterThanOrEqual(5);
  });

  it('apresenta o rodapé institucional com navegação, acesso e contatos de urgência', () => {
    const onNavigate = vi.fn();
    render(<PublicHomePage onNavigate={onNavigate} />);
    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} SUSpiro`);
    expect(footer).toHaveTextContent('SAMU');
    expect(footer).toHaveTextContent('Disque Saúde');

    fireEvent.click(screen.getByRole('link', { name: 'Recuperar senha' }));
    expect(onNavigate).toHaveBeenCalledWith('/recuperar-senha');
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

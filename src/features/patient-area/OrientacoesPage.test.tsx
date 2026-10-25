import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrientacoesPage } from './OrientacoesPage';

describe('OrientacoesPage', () => {
  it('concentra instruções de atendimento, status, exames e urgência fora do dashboard', () => {
    render(<OrientacoesPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Orientações' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Antes do atendimento' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Entenda as situações' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Antes de fazer um exame' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Em caso de urgência' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SAMU/ })).toHaveAttribute('href', 'tel:192');
    expect(screen.getByRole('link', { name: /Disque Saúde/ })).toHaveAttribute('href', 'tel:136');
    expect(screen.queryByRole('heading', { name: 'Proteja sua conta' })).not.toBeInTheDocument();
  });
});

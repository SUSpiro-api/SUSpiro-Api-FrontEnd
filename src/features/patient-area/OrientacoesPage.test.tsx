import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrientacoesPage } from './OrientacoesPage';

describe('OrientacoesPage', () => {
  it('concentra instruções de atendimento, status e exames fora do dashboard sem o card de urgência', () => {
    render(<OrientacoesPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Orientações' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Antes do atendimento' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Entenda as situações' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Antes de fazer um exame' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Em caso de urgência' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /SAMU/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Disque Saúde/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Proteja sua conta' })).not.toBeInTheDocument();
  });
});

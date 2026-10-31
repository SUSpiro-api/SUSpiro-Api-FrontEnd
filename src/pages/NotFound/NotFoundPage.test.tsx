import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('explains the error and offers a way back', () => {
    const onAction = vi.fn();
    const onBack = vi.fn();

    render(<NotFoundPage onAction={onAction} onBack={onBack} actionLabel="Ir para o início" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ir para o início/ }));
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom title and description for missing resources', () => {
    render(<NotFoundPage variant="embedded" title="Guia não encontrada" description="Esta guia não existe mais." onAction={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Guia não encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Esta guia não existe mais.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Voltar$/ })).not.toBeInTheDocument();
  });
});

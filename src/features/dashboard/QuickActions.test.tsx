import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  it('mostra todas as ações com título e descrição desde o primeiro render', () => {
    render(<QuickActions onCreate={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Ações rápidas' })).toBeInTheDocument();
    for (const action of ['Consulta', 'Retorno', 'Exame', 'Encaminhamento']) {
      expect(screen.getByRole('button', { name: new RegExp(action) })).toBeInTheDocument();
    }
    expect(screen.getByText('Registrar atendimento')).toBeInTheDocument();
    expect(screen.getByText('Programar acompanhamento')).toBeInTheDocument();
  });

  it.each([
    ['Consulta', 'consulta'],
    ['Retorno', 'retorno'],
    ['Exame', 'exame'],
    ['Encaminhamento', 'encaminhamento'],
  ] as const)('aciona a criação do tipo %s', (label, type) => {
    const onCreate = vi.fn();
    render(<QuickActions onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));

    expect(onCreate).toHaveBeenCalledWith(type);
  });
});

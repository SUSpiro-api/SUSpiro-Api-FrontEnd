import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuidesLoadNotice } from './GuidesLoadNotice';

describe('GuidesLoadNotice', () => {
  it('permite tentar carregar as guias novamente', () => {
    const onRetry = vi.fn();
    render(<GuidesLoadNotice retrying={false} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('desabilita o botão enquanto tenta de novo', () => {
    render(<GuidesLoadNotice retrying onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: 'Tentando…' })).toBeDisabled();
  });
});

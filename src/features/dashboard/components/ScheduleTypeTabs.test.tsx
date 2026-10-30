import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScheduleTypeTabs } from './ScheduleTypeTabs';
import { scheduleTypeOptions } from '../hooks/useScheduleForm';

describe('ScheduleTypeTabs', () => {
  it('marca o tipo selecionado como a única aba na ordem de tabulação', () => {
    render(<ScheduleTypeTabs value="consulta" options={scheduleTypeOptions} onChange={() => {}} />);

    expect(screen.getByRole('tab', { name: /Consulta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Consulta/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Retorno/ })).toHaveAttribute('tabindex', '-1');
  });

  it('move foco e seleção juntos com as setas, envolvendo no último item', () => {
    const onChange = vi.fn();
    render(<ScheduleTypeTabs value="encaminhamento" options={scheduleTypeOptions} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('tab', { name: /Encaminhamento/ }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('consulta');
    expect(screen.getByRole('tab', { name: /Consulta/ })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: /Consulta/ }), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('encaminhamento');
  });

  it('desativa todas as abas enquanto a guia está sendo gerada', () => {
    render(<ScheduleTypeTabs value="consulta" options={scheduleTypeOptions} onChange={() => {}} disabled />);

    expect(screen.getByRole('tab', { name: /Consulta/ })).toBeDisabled();
  });
});

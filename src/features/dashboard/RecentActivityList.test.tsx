import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecentActivityList } from './RecentActivityList';
import type { RecentActivity } from './hooks/useDashboardOverview';

const activity: RecentActivity = {
  patientName: 'Mariana Oliveira Santos',
  record: {
    id: 42,
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Mariana Oliveira Santos',
    patientCpf: '11144477735',
    date: '2026-11-05',
    type: 'retorno',
    title: 'Cardiologia',
    status: 'pendente',
    priority: 'normal',
  },
};

describe('RecentActivityList', () => {
  it('opens details when any type of activity is selected', () => {
    const onSelectActivity = vi.fn();
    render(<RecentActivityList activities={[activity]} onSelectActivity={onSelectActivity} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes: Retorno de Mariana Oliveira Santos' }));
    expect(onSelectActivity).toHaveBeenCalledWith(activity);
  });
});

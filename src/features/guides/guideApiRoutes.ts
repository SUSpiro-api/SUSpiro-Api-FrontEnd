export const guideApiRoutes = {
  collection: '/guias',
  mine: '/guias/minhas',
  pending: '/guias/pendentes',
  patient: (patientId: string) => `/guias/paciente/${encodeURIComponent(patientId)}`,
  schedule: (id: number) => `/guias/${id}/agendamento`,
} as const;

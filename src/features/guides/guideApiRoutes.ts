// Guarda os caminhos da API usados pelas guias.

export const guideApiRoutes = {
  collection: '/guias',
  mine: '/guias/minhas',
  pending: '/guias/pendentes',
  schedule: (id: number) => `/guias/${id}/agendamento`,
} as const;

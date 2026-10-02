/**
 * Único ponto com as rotas HTTP do domínio de guias.
 * Quando o contrato do Spring Boot mudar, a alteração fica isolada aqui.
 */
export const guideApiRoutes = {
  collection: '/guias',
  mine: '/guias/minhas',
  pending: '/guias/pendentes',
  schedule: (id: number) => `/guias/${id}/agendamento`,
} as const;

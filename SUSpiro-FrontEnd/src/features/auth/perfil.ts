const PERFIL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrador',
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  ENFERMEIRO: 'Enfermeiro',
  RECEPCIONISTA: 'Recepcionista',
  USUARIO: 'Usuário',
};

/** Nome do perfil para exibição. O valor do token (ex.: RECEPCIONISTA) é interno. */
export function perfilLabel(perfil?: string | null): string {
  if (!perfil) return 'Perfil não informado';
  return PERFIL_LABELS[perfil] ?? perfil;
}

// Transforma o nome do perfil em um texto para mostrar na tela.

const PERFIL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrador',
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  ENFERMEIRO: 'Enfermeiro',
  RECEPCIONISTA: 'Recepcionista',
  USUARIO: 'Usuário',
};

export function perfilLabel(perfil?: string | null): string {
  if (!perfil) return 'Perfil não informado';
  return PERFIL_LABELS[perfil] ?? perfil;
}

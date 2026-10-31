export const NOME_MAX_LENGTH = 150;

const SENHA_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,72}$/;

export function validateNomePerfil(value: string): string {
  const nome = value.trim();
  if (!nome) return 'Informe o nome completo.';
  if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  if (nome.length > NOME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }
  return '';
}

export function validateSenhaAtualPerfil(value: string): string {
  return value ? '' : 'Informe a senha atual.';
}

export function validateNovaSenhaPerfil(value: string, senhaAtual: string): string {
  if (value.length < 12) return 'A nova senha deve ter no mínimo 12 caracteres.';
  if (value.length > 72) return 'A nova senha deve ter no máximo 72 caracteres.';
  if (!SENHA_PATTERN.test(value)) return 'Use letras maiúsculas e minúsculas, número e símbolo.';
  if (value === senhaAtual) return 'A nova senha precisa ser diferente da senha atual.';
  return '';
}

export function validateConfirmarSenhaPerfil(value: string, novaSenha: string): string {
  return value === novaSenha ? '' : 'As senhas não coincidem.';
}

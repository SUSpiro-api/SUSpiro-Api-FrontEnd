import { isValidCpf } from '../../utils/cpf';

export function validateNomePaciente(value: string): string {
  const nome = value.trim();

  if (!nome) return 'Informe o nome completo.';
  if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';

  return '';
}

export function validateCpfPaciente(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

export function validateDataNascimento(value: string): string {
  if (!value) return 'Informe a data de nascimento.';

  return '';
}

export function validateNumeroSus(value: string): string {
  const numeroSus = value.replace(/\D/g, '');

  if (!numeroSus) return 'Informe o número do SUS.';
  if (numeroSus.length !== 15) return 'O número do SUS deve conter 15 dígitos.';

  return '';
}

export function validateTelefone(value: string): string {
  const telefone = value.replace(/\D/g, '');

  if (!telefone) return '';

  if (telefone.length < 10 || telefone.length > 11) {
    return 'Informe um telefone válido com DDD.';
  }

  return '';
}

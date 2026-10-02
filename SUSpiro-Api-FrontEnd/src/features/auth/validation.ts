import { isValidCpf } from '../../utils/cpf';

export function validateLoginCpf(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

export function validatePassword(value: string): string {
  return value.trim() ? '' : 'Informe sua senha.';
}

export function validateResetCpf(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

import { isValidCpf } from '../../utils/cpf';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeIdentifier(value: string): string {
  return value.trim();
}

export function validateIdentifier(value: string): string {
  const identifier = normalizeIdentifier(value);

  if (!identifier) {
    return 'Informe seu CPF ou e-mail.';
  }

  if (identifier.includes('@')) {
    return EMAIL_PATTERN.test(identifier)
      ? ''
      : 'Informe um e-mail válido.';
  }

  return isValidCpf(identifier) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

export function validatePassword(value: string): string {
  return value.trim() ? '' : 'Informe sua senha.';
}

export function validateResetCpf(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

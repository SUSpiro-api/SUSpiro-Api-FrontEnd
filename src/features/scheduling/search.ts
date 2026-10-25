// Compara termos de busca ignorando acentos e pontuação.

import { normalizeCpf } from '../../utils/cpf';

export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesTerm(term: string, ...fields: string[]): boolean {
  const normalized = normalizeForSearch(term);
  if (!normalized) return true;
  return fields.some((field) => normalizeForSearch(field).includes(normalized));
}

export function matchesCpfDigits(term: string, cpf: string): boolean {
  const digits = term.replace(/\D/g, '');
  return digits.length > 0 && normalizeCpf(cpf).includes(digits);
}

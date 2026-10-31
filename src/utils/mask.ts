import { normalizeCpf } from './cpf';

export function maskCpf(value: string): string {
  const cpf = normalizeCpf(value);
  return cpf.length === 11 ? `•••.•••.•••-${cpf.slice(9)}` : '';
}

export function maskCns(value: string): string {
  const cns = value.replace(/\D/g, '');
  return cns.length === 15 ? `${'•'.repeat(11)}${cns.slice(11)}` : '';
}

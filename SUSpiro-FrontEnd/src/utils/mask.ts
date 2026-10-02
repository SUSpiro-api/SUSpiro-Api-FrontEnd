import { normalizeCpf } from './cpf';

/** CPF para exibição em tela, mostrando só os 2 últimos dígitos (LGPD): •••.•••.•••-25 */
export function maskCpf(value: string): string {
  const cpf = normalizeCpf(value);
  return cpf.length === 11 ? `•••.•••.•••-${cpf.slice(9)}` : '';
}

/** Cartão Nacional de Saúde (15 dígitos) mostrando só os 4 últimos: ••••••••••••1234 */
export function maskCns(value: string): string {
  const cns = value.replace(/\D/g, '');
  return cns.length === 15 ? `${'•'.repeat(11)}${cns.slice(11)}` : '';
}

// Confere os dados do cidadão antes de enviar o cadastro.

import { isValidCpf } from '../../utils/cpf';

export const NOME_MAX_LENGTH = 150;

export function validateNomePaciente(value: string): string {
  const nome = value.trim();

  if (!nome) return 'Informe o nome completo.';
  if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  if (nome.length > NOME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }

  return '';
}

export function validateCpfPaciente(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function maxBirthDate(now: Date = new Date()): string {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return toIsoDate(yesterday);
}

const MIN_BIRTH_DATE = '1900-01-01';

// Confere o dia, mês e ano para não aceitar datas que não existem.
function isRealIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateDataNascimento(value: string, now: Date = new Date()): string {
  if (!value) return 'Informe a data de nascimento.';
  if (!isRealIsoDate(value) || value < MIN_BIRTH_DATE) {
    return 'Informe uma data de nascimento válida.';
  }
  if (value > maxBirthDate(now)) return 'A data de nascimento deve estar no passado.';

  return '';
}

export function validateConvenio(value: string): string {
  return value.trim().length > 120 ? 'O convênio deve ter no máximo 120 caracteres.' : '';
}

export function validateEmailPaciente(value: string): string {
  const email = value.trim();
  if (!email) return 'Informe um e-mail para recuperação de senha.';
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Informe um e-mail válido.';
  }
  return '';
}

// Regra legada mantida para consumidores antigos; o formulário atual utiliza convênio.
export function validateNumeroSus(value: string): string {
  const numeroSus = value.replace(/\D/g, '');
  if (!numeroSus) return 'Informe o número do CNS.';
  if (numeroSus.length !== 15) return 'O CNS deve conter 15 dígitos.';
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

// Formata, limpa e confere se um CPF é válido.

const CPF_LENGTH = 11;

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, CPF_LENGTH);
}

export function formatCpf(value: string): string {
  const cpf = normalizeCpf(value);

  return cpf
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== CPF_LENGTH || /^([0-9])\1+$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (length: number): number => {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

export function getCpfError(value: string): string {
  if (!normalizeCpf(value)) return 'Informe seu CPF.';
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

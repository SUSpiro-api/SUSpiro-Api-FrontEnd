const REMEMBERED_CPF_KEY = 'suspiro.auth.rememberedCpf';

export function getRememberedCpf(): string {
  try {
    return localStorage.getItem(REMEMBERED_CPF_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveRememberedCpf(cpf: string): void {
  try {
    localStorage.setItem(REMEMBERED_CPF_KEY, cpf);
  } catch {
    // Storage pode estar indisponível em modo privado ou ambientes restritos.
  }
}

export function clearRememberedCpf(): void {
  try {
    localStorage.removeItem(REMEMBERED_CPF_KEY);
  } catch {
    // Storage pode estar indisponível em modo privado ou ambientes restritos.
  }
}

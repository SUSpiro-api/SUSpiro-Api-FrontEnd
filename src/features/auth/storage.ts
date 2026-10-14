// Lembra o CPF informado durante a sessão, sem salvar a senha.

const REMEMBERED_CPF_KEY = 'suspiro.ui.rememberedCpf';

export function getRememberedCpf(): string {
  try {
    return sessionStorage.getItem(REMEMBERED_CPF_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveRememberedCpf(cpf: string): void {
  try {
    sessionStorage.setItem(REMEMBERED_CPF_KEY, cpf);
  } catch {

  }
}

export function clearRememberedCpf(): void {
  try {
    sessionStorage.removeItem(REMEMBERED_CPF_KEY);
  } catch {

  }
}

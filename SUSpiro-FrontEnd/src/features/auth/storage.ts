const REMEMBERED_CPF_KEY = 'suspiro.ui.rememberedCpf';

/**
 * Preferimos sessionStorage para a conveniência de lembrar o CPF durante a sessão do navegador.
 * Não armazenamos tokens, senhas ou credenciais neste storage.
 */
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
    // Storage pode estar indisponível em modo privado ou ambientes restritos.
  }
}

export function clearRememberedCpf(): void {
  try {
    sessionStorage.removeItem(REMEMBERED_CPF_KEY);
  } catch {
    // Storage pode estar indisponível em modo privado ou ambientes restritos.
  }
}

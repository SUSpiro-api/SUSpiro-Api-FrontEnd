// Lembra somente o CPF quando a pessoa ativa a opção; nunca armazena a senha.

const REMEMBERED_CPF_KEY = 'suspiro.ui.rememberedCpf';

export function getRememberedCpf(): string {
  try {
    const persisted = localStorage.getItem(REMEMBERED_CPF_KEY);
    if (persisted !== null) return persisted;

    // Migra o valor salvo pela versão anterior, que durava apenas até fechar a aba.
    const legacy = sessionStorage.getItem(REMEMBERED_CPF_KEY);
    if (legacy) {
      localStorage.setItem(REMEMBERED_CPF_KEY, legacy);
      sessionStorage.removeItem(REMEMBERED_CPF_KEY);
      return legacy;
    }
    return '';
  } catch {
    return '';
  }
}

export function saveRememberedCpf(cpf: string): void {
  const value = cpf.trim();
  if (!value) {
    clearRememberedCpf();
    return;
  }

  try {
    localStorage.setItem(REMEMBERED_CPF_KEY, value);
  } catch {
    // O modo privado ou as políticas do navegador podem bloquear o armazenamento.
  }
}

export function clearRememberedCpf(): void {
  try {
    localStorage.removeItem(REMEMBERED_CPF_KEY);
  } catch {

  }
}

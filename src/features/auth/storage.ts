const REMEMBERED_IDENTIFIER_KEY = 'suspiro.auth.rememberedIdentifier';

export function getRememberedIdentifier(): string {
  try {
    return localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveRememberedIdentifier(identifier: string): void {
  try {
    localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier);
  } catch {
    
  }
}

export function clearRememberedIdentifier(): void {
  try {
    localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
  } catch {
    
  }
}

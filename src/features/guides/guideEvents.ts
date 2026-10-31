export const GUIDES_UPDATED_EVENT = 'suspiro:guides-updated';
export const GUIDES_STORAGE_KEY = 'suspiro.frontend.guias';

export function notifyGuidesUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GUIDES_UPDATED_EVENT));
}

/** Chama `listener` quando guias mudam aqui ou em outra aba. Retorna a função que cancela. */
export function subscribeToGuideUpdates(listener: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === GUIDES_STORAGE_KEY) listener();
  }

  window.addEventListener(GUIDES_UPDATED_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(GUIDES_UPDATED_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

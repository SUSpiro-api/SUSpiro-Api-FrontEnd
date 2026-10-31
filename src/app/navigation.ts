export function getCurrentPath(): string {
  return window.location.pathname;
}

export function navigate(path: string): void {
  window.history.pushState({}, '', path);
}

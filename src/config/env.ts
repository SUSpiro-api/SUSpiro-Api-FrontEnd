// Reúne as configurações usadas pelo frontend.

const DEFAULT_API_URL = '/api';
const DEFAULT_AUTH_SESSION_PATH = '/usuarios/me';
const DEFAULT_AUTH_LOGOUT_PATH = '/auth/logout';
const DEFAULT_CSRF_COOKIE_NAME = 'XSRF-TOKEN';

export type AuthMode = 'cookie' | 'legacy-bearer-memory';
export type GuideDataSource = 'api' | 'local' | 'auto';

function removeTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function normalizePath(value: string | undefined, fallback: string): string {
  const path = value?.trim() || fallback;
  return path.startsWith('/') ? path : `/${path}`;
}

function readAuthMode(value: string | undefined): AuthMode {
  // Se não estiver configurado como cookie, usa Bearer JWT em sessionStorage.

  return value === 'cookie' ? 'cookie' : 'legacy-bearer-memory';
}

function readGuideDataSource(value: string | undefined): GuideDataSource {
  // Em builds de produção, force API. Dados clínicos nunca devem cair para armazenamento local.
  if (import.meta.env.PROD) return 'api';
  // API é o padrão também em desenvolvimento; auto/local precisam ser ativados explicitamente.
  if (value === 'local' || value === 'auto' || value === 'api') return value;
  return 'api';
}

const authMode = readAuthMode(import.meta.env.VITE_AUTH_MODE);

export const env = Object.freeze({
  apiUrl: removeTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
  authMode,
  guideDataSource: readGuideDataSource(import.meta.env.VITE_GUIDE_DATA_SOURCE),
  authSessionPath: normalizePath(
    import.meta.env.VITE_AUTH_SESSION_PATH,
    DEFAULT_AUTH_SESSION_PATH,
  ),
  authLogoutPath: normalizePath(
    import.meta.env.VITE_AUTH_LOGOUT_PATH,
    DEFAULT_AUTH_LOGOUT_PATH,
  ),
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME?.trim() || DEFAULT_CSRF_COOKIE_NAME,
});

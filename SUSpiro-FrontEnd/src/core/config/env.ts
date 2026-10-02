const DEFAULT_API_URL = '/api';
const DEFAULT_AUTH_SESSION_PATH = '/auth/me';
const DEFAULT_AUTH_LOGOUT_PATH = '/auth/logout';
const DEFAULT_CSRF_COOKIE_NAME = 'XSRF-TOKEN';

export type AuthMode = 'cookie' | 'legacy-bearer-memory';

function normalizeUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function normalizePath(value: string, fallback: string): string {
  const path = value.trim() || fallback;
  return path.startsWith('/') ? path : `/${path}`;
}

const configuredAuthMode = import.meta.env.VITE_AUTH_MODE;
const authMode: AuthMode = configuredAuthMode === 'legacy-bearer-memory' ? 'legacy-bearer-memory' : 'cookie';

export const env = {
  apiUrl: normalizeUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
  guideDataSource: import.meta.env.VITE_GUIDE_DATA_SOURCE === 'local' ? 'local' : 'api',
  authMode,
  authSessionPath: normalizePath(import.meta.env.VITE_AUTH_SESSION_PATH || DEFAULT_AUTH_SESSION_PATH, DEFAULT_AUTH_SESSION_PATH),
  authLogoutPath: normalizePath(import.meta.env.VITE_AUTH_LOGOUT_PATH || DEFAULT_AUTH_LOGOUT_PATH, DEFAULT_AUTH_LOGOUT_PATH),
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME?.trim() || DEFAULT_CSRF_COOKIE_NAME,
} as const;

export type GuideDataSource = typeof env.guideDataSource;

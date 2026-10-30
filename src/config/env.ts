const DEFAULT_API_URL = '/api';

function removeTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function readGuideDataSource(value: string | undefined): 'api' | 'local' | 'auto' {
  if (import.meta.env.PROD) return 'api';
  if (value === 'local' || value === 'auto') return value;
  return 'api';
}

export const env = Object.freeze({
  apiUrl: removeTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
  guideDataSource: readGuideDataSource(import.meta.env.VITE_GUIDE_DATA_SOURCE),
});

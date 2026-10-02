/**
 * Compatibilidade para módulos legados.
 * A implementação oficial vive em core/api para manter uma única camada HTTP.
 */
export {
  ApiError,
  authenticatedFetch,
  publicFetch,
  clearApiCache,
  type ApiErrorBody,
  type RequestOptions,
} from '../core/api/httpClient';

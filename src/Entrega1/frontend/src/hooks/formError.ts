import { ApiError } from '../services/api/httpClient';

const UNEXPECTED_ERROR = 'Algo deu errado. Tente novamente.';

export function toFormErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : UNEXPECTED_ERROR;
}

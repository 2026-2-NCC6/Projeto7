import { env } from '../../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  message?: string | string[];
}

function extractMessage(body: ErrorBody, status: number): string {
  if (Array.isArray(body.message)) {
    return body.message[0] ?? `Erro ${status}`;
  }
  return body.message ?? `Erro ${status}`;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: object;
  accessToken?: string | null;
}

async function request<TResponse>({
  method,
  path,
  body,
  accessToken,
}: RequestOptions): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const payload = (await response.json().catch(() => ({}))) as ErrorBody;

  if (!response.ok) {
    throw new ApiError(extractMessage(payload, response.status), response.status);
  }

  return payload as TResponse;
}

export function post<TResponse>(path: string, body: object): Promise<TResponse> {
  return request<TResponse>({ method: 'POST', path, body });
}

export function get<TResponse>(path: string, accessToken: string | null): Promise<TResponse> {
  return request<TResponse>({ method: 'GET', path, accessToken });
}

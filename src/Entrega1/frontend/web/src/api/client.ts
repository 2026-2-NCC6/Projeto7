import type {
  AdminOverview,
  AdminUser,
  AuditEvent,
  AuthResponse,
  CatalogTraining,
  CatalogTrainingDetail,
  DeviceUsage,
  Page,
  PlayerStatistics,
  PractitionerProfile,
  ProfileView,
  SessionDetail,
  SessionSummary,
  StudioTraining,
  StudioTrainingDetail,
  TrainingAnalytics,
  TrainingContent,
  TrainingStatus,
  TrainingVersion,
  UserRole,
} from './types';

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined | null>;

let accessToken: string | null = null;
let onUnauthorized: () => void = () => undefined;

export function configureClient(token: string | null, unauthorized: () => void): void {
  accessToken = token;
  onUnauthorized = unauthorized;
}

function withQuery(path: string, query?: Query): string {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function messageOf(body: unknown, status: number): string {
  const message = (body as { message?: string | string[] } | null)?.message;

  if (Array.isArray(message)) {
    return message[0] ?? `Erro ${status}`;
  }

  return message ?? `Erro ${status}`;
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${withQuery(path, query)}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;

  if (response.status === 401 && accessToken) {
    onUnauthorized();
  }

  if (!response.ok) {
    throw new ApiError(messageOf(payload, response.status), response.status);
  }

  return payload as T;
}

export const api = {
  signIn: (email: string, password: string) =>
    request<AuthResponse>('POST', '/auth/sign-in', { email, password }),
  signUp: (name: string, email: string, password: string) =>
    request<AuthResponse>('POST', '/auth/sign-up', { name, email, password }),
  signOut: () => request<void>('POST', '/auth/sign-out'),

  profile: () => request<ProfileView>('GET', '/me/profile'),
  updateProfile: (name: string, practitioner: PractitionerProfile) =>
    request<ProfileView['player']>('PATCH', '/me/profile', { name, ...practitioner }),

  catalog: (query: Query) => request<CatalogTraining[]>('GET', '/trainings', undefined, query),
  catalogDetail: (id: string, version?: number) =>
    request<CatalogTrainingDetail>('GET', `/trainings/${id}`, undefined, { version }),
  catalogVersions: (id: string) => request<TrainingVersion[]>('GET', `/trainings/${id}/versions`),

  statistics: () => request<PlayerStatistics>('GET', '/me/statistics'),
  mySessions: (query: Query) => request<Page<SessionSummary>>('GET', '/me/sessions', undefined, query),
  session: (id: string) => request<SessionDetail>('GET', `/sessions/${id}`),

  studio: (status?: TrainingStatus) =>
    request<StudioTraining[]>('GET', '/studio/trainings', undefined, { status }),
  studioDetail: (id: string) => request<StudioTrainingDetail>('GET', `/studio/trainings/${id}`),
  createTraining: (content: TrainingContent) =>
    request<StudioTrainingDetail>('POST', '/studio/trainings', content),
  updateTraining: (id: string, content: TrainingContent) =>
    request<StudioTrainingDetail>('PUT', `/studio/trainings/${id}`, content),
  recordSimulation: (id: string, revision: number, passed: boolean) =>
    request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/simulation`, { revision, passed }),
  submitTraining: (id: string) => request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/submit`),
  publishTraining: (id: string, changeNote: string) =>
    request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/publish`, { changeNote }),
  returnTraining: (id: string, note: string) =>
    request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/return`, { note }),
  archiveTraining: (id: string) => request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/archive`),
  restoreTraining: (id: string) => request<StudioTrainingDetail>('POST', `/studio/trainings/${id}/restore`),
  trainingAnalytics: (id: string) =>
    request<TrainingAnalytics>('GET', `/studio/trainings/${id}/analytics`),

  adminOverview: () => request<AdminOverview>('GET', '/admin/overview'),
  adminUsers: (query: Query) => request<Page<AdminUser>>('GET', '/admin/users', undefined, query),
  changeRole: (id: string, role: UserRole) =>
    request<void>('PATCH', `/admin/users/${id}/role`, { role }),
  adminSessions: (query: Query) =>
    request<Page<SessionSummary>>('GET', '/admin/sessions', undefined, query),
  adminDevices: () => request<DeviceUsage[]>('GET', '/admin/devices'),
  adminAudit: (query: Query) => request<AuditEvent[]>('GET', '/admin/audit', undefined, query),
};

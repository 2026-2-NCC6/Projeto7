export const USER_ROLES = ['player', 'coach', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function canAuthorTrainings(role: UserRole): boolean {
  return role === 'coach' || role === 'admin';
}

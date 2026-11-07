import { AuditLog, auditEntry } from '../../domain/audit/audit-event';
import { UserNotFoundError } from '../../domain/user/errors';
import { PractitionerProfile } from '../../domain/user/practitioner-profile';
import { UserRole } from '../../domain/user/role';
import { UserRepository } from '../../domain/user/user-repository.port';

export interface UpdateProfileInput {
  userId: string;
  name: string;
  profile: PractitionerProfile;
}

export interface AccountView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  practitioner: PractitionerProfile;
}

export class UpdateProfileUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditLog,
  ) {}

  async execute({ userId, name, profile }: UpdateProfileInput): Promise<AccountView> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const updated = user.withProfile(name, profile);
    await this.users.save(updated);
    await this.audit.record(
      auditEntry('user.profile_updated', userId, { type: 'user', id: userId }, {
        ageGroup: updated.profile.ageGroup,
      }),
    );

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      practitioner: updated.profile,
    };
  }
}

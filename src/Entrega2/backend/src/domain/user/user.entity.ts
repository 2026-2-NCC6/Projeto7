import {
  EMPTY_PRACTITIONER_PROFILE,
  isMinor,
  normalizeProfile,
  PractitionerProfile,
} from './practitioner-profile';
import { UserRole } from './role';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  /** Bumped to revoke every access token issued before, e.g. on sign-out. */
  tokenVersion: number;
  role: UserRole;
  profile: PractitionerProfile;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static restore(props: UserProps): User {
    return new User(props);
  }

  static register(params: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): User {
    return new User({
      id: params.id,
      name: params.name.trim(),
      email: User.normalizeEmail(params.email),
      passwordHash: params.passwordHash,
      tokenVersion: 0,
      role: params.role ?? 'player',
      profile: EMPTY_PRACTITIONER_PROFILE,
      createdAt: new Date(),
    });
  }

  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get tokenVersion(): number {
    return this.props.tokenVersion;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get profile(): PractitionerProfile {
    return this.props.profile;
  }

  get isMinor(): boolean {
    return isMinor(this.props.profile.ageGroup);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  withRole(role: UserRole): User {
    return new User({ ...this.props, role });
  }

  withProfile(name: string, profile: PractitionerProfile): User {
    return new User({ ...this.props, name: name.trim(), profile: normalizeProfile(profile) });
  }
}

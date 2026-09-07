export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static restore(props: UserProps): User {
    return new User(props);
  }

  static register(params: { id: string; name: string; email: string; passwordHash: string }): User {
    return new User({
      id: params.id,
      name: params.name.trim(),
      email: User.normalizeEmail(params.email),
      passwordHash: params.passwordHash,
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

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

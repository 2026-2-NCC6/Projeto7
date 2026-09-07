export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('Este e-mail já está em uso.');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('E-mail ou senha inválidos.');
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('Usuário não encontrado.');
  }
}

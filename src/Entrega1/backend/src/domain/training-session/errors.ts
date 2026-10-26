import { DomainError } from '../user/errors';

export class InvalidTrainingSessionError extends DomainError {
  constructor(reason: string) {
    super(`Sessão de treino inválida: ${reason}`);
  }
}

export class SessionAlreadyRecordedError extends DomainError {
  constructor() {
    super('Esta sessão de treino já foi registrada.');
  }
}

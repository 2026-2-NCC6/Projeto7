import { DomainError } from '../user/errors';

export class TrainingNotFoundError extends DomainError {
  constructor() {
    super('Treino não encontrado.');
  }
}

export class TrainingTransitionError extends DomainError {}

export class InvalidTrainingError extends DomainError {
  constructor(readonly problems: string[]) {
    super(problems.join(' '));
  }
}

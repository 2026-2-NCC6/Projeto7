import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  InvalidTrainingError,
  TrainingNotFoundError,
  TrainingTransitionError,
} from '../../domain/training/errors';
import {
  NotFoundSessionError,
  SessionAlreadyRecordedError,
} from '../../domain/training-session/errors';
import {
  DomainError,
  EmailAlreadyInUseError,
  ForbiddenActionError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../domain/user/errors';

const STATUS_BY_ERROR = new Map<unknown, HttpStatus>([
  [EmailAlreadyInUseError, HttpStatus.CONFLICT],
  [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
  [UserNotFoundError, HttpStatus.NOT_FOUND],
  [SessionAlreadyRecordedError, HttpStatus.CONFLICT],
  [ForbiddenActionError, HttpStatus.FORBIDDEN],
  [TrainingNotFoundError, HttpStatus.NOT_FOUND],
  [NotFoundSessionError, HttpStatus.NOT_FOUND],
  [TrainingTransitionError, HttpStatus.CONFLICT],
  [InvalidTrainingError, HttpStatus.UNPROCESSABLE_ENTITY],
]);

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const status = STATUS_BY_ERROR.get(exception.constructor) ?? HttpStatus.BAD_REQUEST;

    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}

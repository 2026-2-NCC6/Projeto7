import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { AUDIT_ACTIONS, AuditAction } from '../../../domain/audit/audit-event';
import { USER_ROLES, UserRole } from '../../../domain/user/role';

const DEFAULT_PAGE = 20;
const MAX_PAGE = 100;

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  limit: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}

export class SessionHistoryQueryDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  trainingId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}

export class AdminSessionQueryDto extends SessionHistoryQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UserQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}

export class ChangeRoleDto {
  @IsIn(USER_ROLES, { message: 'Papel inválido.' })
  role: UserRole;
}

export class AuditQueryDto {
  @IsOptional()
  @IsIn(AUDIT_ACTIONS)
  action?: AuditAction;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  limit: number = MAX_PAGE;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  before?: Date;
}

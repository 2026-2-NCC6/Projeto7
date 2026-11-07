import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminOverview, Administration } from '../../application/use-cases/administration';
import { AuditEvent } from '../../domain/audit/audit-event';
import { DeviceUsage, SessionPage } from '../../domain/training-session/session-history';
import { UserPage } from '../../domain/user/user-repository.port';
import { CurrentUserId } from './current-user-id.decorator';
import {
  AdminSessionQueryDto,
  AuditQueryDto,
  ChangeRoleDto,
  UserQueryDto,
} from './dto/history-query.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Administração')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(@Inject(Administration) private readonly administration: Administration) {}

  @Get('overview')
  overview(@CurrentUserId() userId: string): Promise<AdminOverview> {
    return this.administration.overview(userId);
  }

  @Get('users')
  users(@CurrentUserId() userId: string, @Query() query: UserQueryDto): Promise<UserPage> {
    return this.administration.userPage(userId, query);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  changeRole(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) targetId: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<void> {
    return this.administration.changeRole(userId, targetId, dto.role);
  }

  @Get('sessions')
  sessions(@CurrentUserId() userId: string, @Query() query: AdminSessionQueryDto): Promise<SessionPage> {
    return this.administration.sessions(userId, query);
  }

  @Get('devices')
  devices(@CurrentUserId() userId: string): Promise<DeviceUsage[]> {
    return this.administration.devices(userId);
  }

  @Get('audit')
  audit(@CurrentUserId() userId: string, @Query() query: AuditQueryDto): Promise<AuditEvent[]> {
    return this.administration.auditTrail(userId, query);
  }
}

import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { GetProfileUseCase, ProfileView } from '../../application/use-cases/get-profile.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(@Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase) {}

  @Get('profile')
  profile(@CurrentUserId() userId: string): Promise<ProfileView> {
    return this.getProfile.execute(userId);
  }
}

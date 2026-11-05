import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase, ProfileView } from '../../application/use-cases/get-profile.use-case';
import {
  AccountView,
  UpdateProfileUseCase,
} from '../../application/use-cases/update-profile.use-case';
import { UpdateProfileDto } from './dto/profile.dto';
import { CurrentUserId } from './current-user-id.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Perfil')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    @Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase,
    @Inject(UpdateProfileUseCase) private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  @Get('profile')
  profile(@CurrentUserId() userId: string): Promise<ProfileView> {
    return this.getProfile.execute(userId);
  }

  @Patch('profile')
  update(@CurrentUserId() userId: string, @Body() dto: UpdateProfileDto): Promise<AccountView> {
    return this.updateProfile.execute({
      userId,
      name: dto.name,
      profile: {
        ageGroup: dto.ageGroup ?? null,
        skillLevel: dto.skillLevel ?? null,
        goals: dto.goals,
        dominantHand: dto.dominantHand ?? null,
        restrictions: dto.restrictions ?? null,
      },
    });
  }
}

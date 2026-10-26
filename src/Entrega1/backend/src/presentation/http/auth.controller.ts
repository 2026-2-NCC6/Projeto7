import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { AuthenticatedUser } from '../../application/use-cases/authenticated-user';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    @Inject(CreateUserUseCase) private readonly createUser: CreateUserUseCase,
    @Inject(AuthenticateUserUseCase) private readonly authenticateUser: AuthenticateUserUseCase,
    @Inject(SignOutUseCase) private readonly signOutUser: SignOutUseCase,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: SignUpDto): Promise<AuthenticatedUser> {
    return this.createUser.execute(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto): Promise<AuthenticatedUser> {
    return this.authenticateUser.execute(dto);
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@CurrentUserId() userId: string): Promise<void> {
    return this.signOutUser.execute(userId);
  }
}

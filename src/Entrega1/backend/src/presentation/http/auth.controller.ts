import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { AuthenticatedUser } from '../../application/use-cases/authenticated-user';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(CreateUserUseCase) private readonly createUser: CreateUserUseCase,
    @Inject(AuthenticateUserUseCase) private readonly authenticateUser: AuthenticateUserUseCase,
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
}

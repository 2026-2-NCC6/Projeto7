import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './presentation/http/auth.module';
import { HomeModule } from './presentation/http/home.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), InfrastructureModule, AuthModule, HomeModule],
})
export class AppModule {}

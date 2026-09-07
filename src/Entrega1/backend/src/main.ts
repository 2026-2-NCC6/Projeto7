import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './presentation/http/domain-error.filter';

// O ValidationPipe carrega class-validator sob demanda. No Node 22, quando o
// projeto está em um caminho com acentos, a resolução de módulos falha depois
// que a aplicação Nest é criada — por isso o pipe é construído antes.
async function bootstrap(): Promise<void> {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new DomainErrorFilter());

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}

void bootstrap();

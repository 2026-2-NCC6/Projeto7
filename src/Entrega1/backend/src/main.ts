import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './presentation/http/domain-error.filter';
import { buildServerConfig } from './server-config';

// O ValidationPipe carrega class-validator sob demanda. No Node 22, quando o
// projeto está em um caminho com acentos, a resolução de módulos falha depois
// que a aplicação Nest é criada — por isso o pipe é construído antes.
async function bootstrap(): Promise<void> {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const config = buildServerConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: config.https ?? undefined,
  });

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }
  if (config.corsOrigins.length > 0) {
    app.enableCors({ origin: config.corsOrigins });
  }
  app.enableShutdownHooks();
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new DomainErrorFilter());

  await app.listen(config.port, config.host);
}

void bootstrap();

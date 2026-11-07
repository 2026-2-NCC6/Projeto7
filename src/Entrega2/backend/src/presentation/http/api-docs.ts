import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

export function setupApiDocs(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Smash API')
      .setDescription('Treinos, sessões, telemetria da parede, ranking e administração do Smash.')
      .setVersion('2.0')
      .addBearerAuth()
      .build(),
  );
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/',
  });

  const content = schemas.TrainingContentDto as { properties: { steps: { items: object } } };
  content.properties.steps.items = {
    oneOf: [
      { $ref: '#/components/schemas/ColorStepDto' },
      { $ref: '#/components/schemas/ScoreStepDto' },
    ],
  };

  document.components = {
    ...document.components,
    schemas: { ...document.components?.schemas, ...(schemas as Record<string, object>) },
  };
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs/openapi.json' });
}

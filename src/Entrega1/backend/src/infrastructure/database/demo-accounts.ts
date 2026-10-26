import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { UuidIdGenerator } from '../security/uuid-id-generator';
import { buildDataSourceOptions } from './database.config';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';

/**
 * Contas fictícias para apresentações: ninguém joga na frente do público com
 * dados reais. O domínio .test é reservado e nunca pertence a uma pessoa.
 *
 *   npm run demo:accounts          cria 3 contas e imprime as senhas uma vez
 *   npm run demo:accounts -- 5     cria 5
 *   npm run demo:clean             apaga todas, com sessões e progresso
 */
const DEMO_DOMAIN = 'demo.smash.test';

async function create(dataSource: DataSource, count: number): Promise<void> {
  const createUser = new CreateUserUseCase(
    new TypeOrmUserRepository(dataSource),
    new BcryptPasswordHasher(),
    { issue: () => '' },
    new UuidIdGenerator(),
  );
  const stamp = Date.now().toString(36);

  for (let index = 1; index <= count; index += 1) {
    const email = `jogador${index}-${stamp}@${DEMO_DOMAIN}`;
    const password = randomBytes(12).toString('base64url');

    await createUser.execute({ name: `Jogador Demo ${index}`, email, password });
    console.log(`${email}  ${password}`);
  }

  console.log('As senhas não ficam guardadas em lugar nenhum além do hash no banco.');
}

async function clean(dataSource: DataSource): Promise<void> {
  // Sessões, progresso e ofensiva saem junto: as chaves estrangeiras são ON DELETE CASCADE.
  const [, removed] = (await dataSource.query(`DELETE FROM "users" WHERE "email" LIKE $1`, [
    `%@${DEMO_DOMAIN}`,
  ])) as [unknown, number];

  console.log(`${removed} conta(s) de demonstração apagada(s).`);
}

async function main(): Promise<void> {
  const [command, count] = process.argv.slice(2);
  const dataSource = await new DataSource(buildDataSourceOptions()).initialize();

  try {
    if (command === 'create') {
      await create(dataSource, Number(count ?? 3));
    } else if (command === 'clean') {
      await clean(dataSource);
    } else {
      throw new Error('Use "create [quantidade]" ou "clean".');
    }
  } finally {
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

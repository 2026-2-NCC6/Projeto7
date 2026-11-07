import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { openAccountFor } from '../../domain/user/account';
import { MarketplaceMetadata, TrainingContent } from '../../domain/training/training-content';
import { Training } from '../../domain/training/training.entity';
import { User } from '../../domain/user/user.entity';
import { UserRole } from '../../domain/user/role';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { buildDataSourceOptions } from './database.config';
import { TypeOrmTrainingRepository } from './repositories/typeorm-training.repository';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';

const DEMO_DOMAIN = 'demo.smash.test';
const SECOND = 1000;

const MARKETPLACE: Omit<MarketplaceMetadata, 'category'> = {
  commercialDescription: '',
  license: 'free',
  pricingModel: 'free',
  priceCents: null,
  compatibility: ['Parede Smash 3x2 (protocolo v2)'],
};

const DEMO_TRAININGS: TrainingContent[] = [
  {
    title: 'Aquecimento das cores',
    summary: 'Primeiro contato com a parede: acerte a cor pedida, sem pressa e sem penalidade.',
    audience: 'kids',
    objective: 'fun',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    instructions: 'Fique a 2 metros da parede e espere a cor aparecer no celular antes de bater.',
    scoringRules: 'Cada acerto vale 10 pontos. Erros não tiram pontos.',
    equipment: ['Raquete infantil', 'Bolas de transição (estágio vermelho)'],
    risks: ['Rebote da bola na direção do rosto', 'Piso escorregadio'],
    steps: [
      {
        title: 'Duas cores',
        mode: 'level_color',
        config: { sequenceLength: 4, palette: ['amber', 'blue'], reactionWindowMs: null, maxMistakes: null, pointsPerHit: 10, recoveryMs: 900 },
      },
      {
        title: 'Três cores',
        mode: 'level_color',
        config: { sequenceLength: 5, palette: ['amber', 'blue', 'red'], reactionWindowMs: null, maxMistakes: null, pointsPerHit: 10, recoveryMs: 900 },
      },
    ],
    marketplace: { ...MARKETPLACE, category: 'kids', commercialDescription: 'Treino lúdico para crianças de 6 a 10 anos.' },
  },
  {
    title: 'Precisão sob pressão',
    summary: 'Sequência de cores com tempo de reação e uma corrida de pontos para fechar.',
    audience: 'adults',
    objective: 'precision',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    instructions: 'Fique a 4 metros da parede. Volte ao centro depois de cada golpe.',
    scoringRules: 'Acerto vale os pontos da etapa; na corrida, a sequência de acertos multiplica os pontos.',
    equipment: ['Raquete', 'Bolas'],
    risks: ['Rebote da bola', 'Torção ao mudar de direção'],
    steps: [
      {
        title: 'Cores com relógio',
        mode: 'level_color',
        config: { sequenceLength: 8, palette: ['amber', 'blue', 'red'], reactionWindowMs: 3000, maxMistakes: 5, pointsPerHit: 16, recoveryMs: 600 },
      },
      {
        title: 'Corrida de pontos',
        mode: 'level_score',
        config: {
          targetScore: 400,
          timeLimitMs: 90 * SECOND,
          pointsPerColor: { amber: 10, blue: 20, red: 30 },
          palette: ['amber', 'blue', 'red'],
          streakMultiplier: { every: 5, step: 0.25, max: 2 },
          missPenalty: 0,
          requiredAccuracyPercent: null,
          recoveryMs: 120,
        },
      },
    ],
    marketplace: { ...MARKETPLACE, category: 'precision', commercialDescription: 'Precisão para quem já joga.' },
  },
  {
    title: 'Resistência no vermelho',
    summary: 'Só o alvo vermelho pontua. Aguente o ritmo e mantenha a precisão acima de 70%.',
    audience: 'adults',
    objective: 'endurance',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    instructions: 'Golpes firmes, sempre no alvo vermelho. Hidrate-se entre as etapas.',
    scoringRules: 'Errar fora do vermelho tira 20 pontos. A etapa exige 70% de precisão.',
    equipment: ['Raquete', 'Bolas', 'Garrafa de água'],
    risks: ['Fadiga muscular', 'Rebote da bola'],
    steps: [
      {
        title: 'Ritmo no vermelho',
        mode: 'level_score',
        config: {
          targetScore: 600,
          timeLimitMs: 75 * SECOND,
          pointsPerColor: { amber: 0, blue: 0, red: 40 },
          palette: ['red'],
          streakMultiplier: { every: 3, step: 0.25, max: 3 },
          missPenalty: -20,
          requiredAccuracyPercent: 70,
          recoveryMs: 90,
        },
      },
    ],
    marketplace: {
      ...MARKETPLACE,
      category: 'endurance',
      license: 'proprietary',
      pricingModel: 'one_time',
      priceCents: 1990,
      commercialDescription: 'Exemplo de treino pago para o futuro marketplace.',
    },
  },
];

async function createAccount(dataSource: DataSource, role: UserRole, name: string): Promise<void> {
  const users = new TypeOrmUserRepository(dataSource);
  const email = `${role}-${Date.now().toString(36)}@${DEMO_DOMAIN}`;
  const password = randomBytes(12).toString('base64url');
  const user = User.register({
    id: randomUUID(),
    name,
    email,
    passwordHash: await new BcryptPasswordHasher().hash(password),
    role,
  });

  await users.register(openAccountFor(user));
  console.log(`${role.padEnd(6)} ${email}  ${password}`);
}

async function staff(dataSource: DataSource): Promise<void> {
  await createAccount(dataSource, 'admin', 'Admin Demo');
  await createAccount(dataSource, 'coach', 'Treinador Demo');
  console.log('As senhas não ficam guardadas em lugar nenhum além do hash no banco.');
}

async function trainings(dataSource: DataSource): Promise<void> {
  const [admin] = await dataSource.query<{ id: string }[]>(
    `SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1`,
  );

  if (!admin) {
    throw new Error('Crie um administrador antes: npm run demo:staff');
  }

  const repository = new TypeOrmTrainingRepository(dataSource);
  const actor = { id: admin.id, role: 'admin' as const };
  const now = new Date();

  for (const content of DEMO_TRAININGS) {
    const { training, version } = Training.create({ id: randomUUID(), author: actor, content, now })
      .recordSimulation(actor, 1, true, now)
      .publish(actor, 'Treino de demonstração', now);

    await repository.save(training);
    await repository.publish(training, version);
    console.log(`publicado: ${content.title}`);
  }
}

async function main(): Promise<void> {
  const [command] = process.argv.slice(2);
  const dataSource = await new DataSource(buildDataSourceOptions()).initialize();

  try {
    if (command === 'staff') {
      await staff(dataSource);
    } else if (command === 'trainings') {
      await trainings(dataSource);
    } else {
      throw new Error('Use "staff" ou "trainings".');
    }
  } finally {
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

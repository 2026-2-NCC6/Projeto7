import { TrainingContent } from '../../src/domain/training/training-content';

export function aTrainingContent(overrides: Partial<TrainingContent> = {}): TrainingContent {
  return {
    title: 'Precisão em dupla',
    summary: 'Acerte as cores em sequência e depois some pontos.',
    audience: 'adults',
    objective: 'precision',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    instructions: 'Fique a 3 metros da parede.',
    scoringRules: 'Cada acerto vale os pontos da etapa.',
    equipment: ['Raquete', 'Bolas'],
    risks: ['Rebote da bola'],
    steps: [
      {
        title: 'Sequência de cores',
        mode: 'level_color',
        config: {
          sequenceLength: 5,
          palette: ['amber', 'blue'],
          reactionWindowMs: 4000,
          maxMistakes: null,
          pointsPerHit: 12,
          recoveryMs: 800,
        },
      },
      {
        title: 'Corrida de pontos',
        mode: 'level_score',
        config: {
          targetScore: 200,
          timeLimitMs: 60000,
          pointsPerColor: { amber: 10, blue: 20, red: 30 },
          palette: ['amber', 'blue', 'red'],
          streakMultiplier: { every: 5, step: 0.25, max: 2 },
          missPenalty: 0,
          requiredAccuracyPercent: null,
          recoveryMs: 120,
        },
      },
    ],
    marketplace: {
      category: 'precision',
      commercialDescription: 'Treino de precisão para adultos.',
      license: 'free',
      pricingModel: 'free',
      priceCents: null,
      compatibility: ['Parede Smash 3x2'],
    },
    ...overrides,
  };
}

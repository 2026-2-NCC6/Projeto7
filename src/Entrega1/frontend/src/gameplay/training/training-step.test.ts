import { colorRules } from '../modes/color/color-rules';
import { levelConfigOf, type TrainingStep } from './training-step';

const colorStep: TrainingStep = {
  title: 'Cores',
  mode: 'level_color',
  config: {
    sequenceLength: 3,
    palette: ['amber', 'blue'],
    reactionWindowMs: null,
    maxMistakes: null,
    pointsPerHit: 10,
    recoveryMs: 800,
  },
};

describe('levelConfigOf', () => {
  it('turns a training step into a level the existing rules can run', () => {
    const config = levelConfigOf(colorStep, 'beginner');

    expect(config).toMatchObject({ level: 0, difficulty: 'easy', sequenceLength: 3, pointsPerHit: 10 });
    expect(() => colorRules.start(config as never, () => 0.5)).not.toThrow();
  });
});

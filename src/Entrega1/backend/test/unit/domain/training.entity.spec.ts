import { InvalidTrainingError, TrainingTransitionError } from '../../../src/domain/training/errors';
import { trainingContentProblems } from '../../../src/domain/training/training-content';
import { Actor, Training } from '../../../src/domain/training/training.entity';
import { ForbiddenActionError } from '../../../src/domain/user/errors';
import { aTrainingContent } from '../../support/training-fixtures';

const coach: Actor = { id: 'coach', role: 'coach' };
const admin: Actor = { id: 'admin', role: 'admin' };
const otherCoach: Actor = { id: 'other', role: 'coach' };
const now = new Date('2026-11-01T12:00:00.000Z');

function aDraft(author: Actor = coach): Training {
  return Training.create({ id: 'training-1', author, content: aTrainingContent(), now });
}

describe('Training', () => {
  it('starts as an unlisted draft owned by its author', () => {
    const training = aDraft();

    expect(training.status).toBe('draft');
    expect(training.revision).toBe(1);
    expect(training.isListed).toBe(false);
    expect(training.authorId).toBe('coach');
  });

  it('refuses a player as author', () => {
    expect(() =>
      Training.create({ id: 't', author: { id: 'p', role: 'player' }, content: aTrainingContent(), now }),
    ).toThrow(ForbiddenActionError);
  });

  it('goes draft, simulated, in review and published, creating version 1', () => {
    const reviewed = aDraft().recordSimulation(coach, 1, true, now).submitForReview(coach, now);
    const { training, version } = reviewed.publish(admin, 'Primeira versão', now);

    expect(reviewed.status).toBe('in_review');
    expect(training.status).toBe('published');
    expect(training.isListed).toBe(true);
    expect(version).toMatchObject({ version: 1, publishedBy: 'admin', changeNote: 'Primeira versão' });
  });

  it('needs a passed simulation of the current revision before review', () => {
    const edited = aDraft().recordSimulation(coach, 1, true, now).edit(coach, aTrainingContent(), now);

    expect(edited.isSimulated).toBe(false);
    expect(() => edited.submitForReview(coach, now)).toThrow(TrainingTransitionError);
    expect(() => edited.recordSimulation(coach, 1, true, now)).toThrow(TrainingTransitionError);
  });

  it('keeps the published version listed while the author edits a new revision', () => {
    const { training } = aDraft()
      .recordSimulation(coach, 1, true, now)
      .submitForReview(coach, now)
      .publish(admin, '', now);

    const edited = training.edit(coach, aTrainingContent({ title: 'Nova versão' }), now);

    expect(edited.status).toBe('draft');
    expect(edited.isListed).toBe(true);
    expect(edited.hasUnpublishedChanges).toBe(true);
    expect(edited.currentVersion).toBe(1);
  });

  it('lets only admins publish, and only reviewed trainings or their own drafts', () => {
    const simulated = aDraft().recordSimulation(coach, 1, true, now);

    expect(() => simulated.publish(coach, '', now)).toThrow(ForbiddenActionError);
    expect(() => simulated.publish(admin, '', now)).toThrow(TrainingTransitionError);

    const own = aDraft(admin).recordSimulation(admin, 1, true, now);
    expect(own.publish(admin, '', now).version.version).toBe(1);
  });

  it('keeps other coaches out of a training', () => {
    expect(() => aDraft().edit(otherCoach, aTrainingContent(), now)).toThrow(ForbiddenActionError);
  });

  it('returns a reviewed training to draft with a note', () => {
    const returned = aDraft()
      .recordSimulation(coach, 1, true, now)
      .submitForReview(coach, now)
      .returnToDraft(admin, 'Aumente o descanso', now);

    expect(returned.status).toBe('draft');
    expect(returned.reviewNote).toBe('Aumente o descanso');
  });

  it('archives and restores, leaving the catalog while archived', () => {
    const { training } = aDraft()
      .recordSimulation(coach, 1, true, now)
      .submitForReview(coach, now)
      .publish(admin, '', now);
    const archived = training.archive(coach, now);

    expect(archived.isListed).toBe(false);
    expect(() => archived.edit(coach, aTrainingContent(), now)).toThrow(TrainingTransitionError);
    expect(archived.restore(coach, now).status).toBe('published');
  });

  it('rejects publishing invalid content', () => {
    const empty = Training.create({
      id: 't',
      author: admin,
      content: aTrainingContent({ steps: [] }),
      now,
    }).recordSimulation(admin, 1, true, now);

    expect(() => empty.publish(admin, '', now)).toThrow(InvalidTrainingError);
  });
});

describe('trainingContentProblems', () => {
  it('accepts the fixture', () => {
    expect(trainingContentProblems(aTrainingContent())).toEqual([]);
  });

  it('flags a score palette colour worth nothing and a priced free training', () => {
    const content = aTrainingContent();
    const scoreStep = content.steps[1];

    if (scoreStep.mode !== 'level_score') {
      throw new Error('fixture changed');
    }

    const problems = trainingContentProblems({
      ...content,
      steps: [
        { ...scoreStep, config: { ...scoreStep.config, pointsPerColor: { amber: 0, blue: 20, red: 30 } } },
      ],
      marketplace: { ...content.marketplace, priceCents: 990 },
    });

    expect(problems).toEqual([
      'Um treino gratuito não tem preço.',
      'Etapa 1: toda cor da paleta precisa valer pontos.',
    ]);
  });
});

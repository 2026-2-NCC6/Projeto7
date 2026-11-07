import type { TrainingDifficulty, TrainingStep } from './training-step';

export interface TrainingRef {
  readonly id: string;
  readonly version: number;
  readonly stepIndex: number;
}

export interface TrainingRun {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly difficulty: TrainingDifficulty;
  readonly steps: readonly TrainingStep[];
  readonly stepIndex: number;
}

export function stepOf(run: TrainingRun): TrainingStep {
  return run.steps[run.stepIndex];
}

export function refOf(run: TrainingRun): TrainingRef {
  return { id: run.id, version: run.version, stepIndex: run.stepIndex };
}

export function hasNextStep(run: TrainingRun): boolean {
  return run.stepIndex + 1 < run.steps.length;
}

export function nextStepOf(run: TrainingRun): TrainingRun {
  return { ...run, stepIndex: run.stepIndex + 1 };
}

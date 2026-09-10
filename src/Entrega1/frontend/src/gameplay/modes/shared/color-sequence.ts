import type { TargetColor } from '../../../types/game';
import type { RandomSource } from '../../domain/game-rules';

/** Draws colours at random, never repeating the one before. */
export function buildSequence(
  palette: readonly TargetColor[],
  length: number,
  random: RandomSource,
): TargetColor[] {
  const sequence: TargetColor[] = [];

  while (sequence.length < length) {
    const choices = palette.filter((color) => color !== sequence[sequence.length - 1]);
    sequence.push(choices[Math.floor(random() * choices.length)]);
  }

  return sequence;
}

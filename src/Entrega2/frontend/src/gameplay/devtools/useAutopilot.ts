import { useEffect, useRef } from 'react';
import { WALL_TARGETS, type TargetId } from '../../device/contracts';
import type { SimulatedTargetDevice } from '../../device/adapters/simulated/simulated-device';

const ACCURATE_ODDS = 0.85;

function pick<T>(values: readonly T[]): T | null {
  return values.length === 0 ? null : values[Math.floor(Math.random() * values.length)];
}

export interface AutopilotOptions {
  device: SimulatedTargetDevice | null;
  running: boolean;
  expectedTargets: readonly TargetId[];
  intervalMs: number;
}

/**
 * A stand-in player for demos: it looks at what the screen is asking for and
 * hits the wall. It never touches the gameplay engine, only the simulated device.
 */
export function useAutopilot({
  device,
  running,
  expectedTargets,
  intervalMs,
}: AutopilotOptions): void {
  // The prompt changes on every tick; keeping it in a ref stops the timer from
  // being torn down and rebuilt before it ever fires.
  const targets = useRef(expectedTargets);
  targets.current = expectedTargets;

  useEffect(() => {
    if (!device || !running) {
      return;
    }

    const timer = setInterval(() => {
      const expected = targets.current;
      const wrongTargets = WALL_TARGETS.filter((target) => !expected.includes(target.id));
      const accurate = Math.random() < ACCURATE_ODDS || wrongTargets.length === 0;
      const chosen = accurate ? pick(expected) : (pick(wrongTargets)?.id ?? null);

      if (chosen !== null) {
        device.emitHit(chosen);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [device, running, intervalMs]);
}

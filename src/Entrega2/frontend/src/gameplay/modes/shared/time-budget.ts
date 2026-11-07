/**
 * The endless modes run on a time bank instead of a level goal: the clock drains,
 * every correct hit puts time back, and the time it puts back shrinks as the score
 * grows. Tuning the difficulty is editing these numbers.
 */
export interface TimeBudget {
  /** Time in the bank when the first prompt appears, and the bar's full scale. */
  readonly startBudgetMs: number;
  /** Time a correct hit gives back at score zero. */
  readonly baseBonusMs: number;
  /** Floor of that reward, so the bank always loses ground in the end. */
  readonly minBonusMs: number;
  /** How much of the reward survives each difficulty step. */
  readonly bonusDecayPerStep: number;
  /** Score between two difficulty steps. */
  readonly stepScore: number;
  /** Time a wrong hit costs. */
  readonly missPenaltyMs: number;
}

export function difficultyStep(score: number, budget: TimeBudget): number {
  return Math.floor(Math.max(0, score) / budget.stepScore);
}

export function bonusMsFor(score: number, budget: TimeBudget): number {
  const decayed =
    budget.baseBonusMs * budget.bonusDecayPerStep ** difficultyStep(score, budget);

  return Math.max(budget.minBonusMs, Math.round(decayed));
}

/**
 * Pushes the deadline forward, but never lets the bank hold more than it started
 * with. Without this a fast player banks an unbounded reserve early on, the bar
 * sits pinned at full, and the run stops being endurable — it becomes endless.
 */
export function grantTime(
  deadlineMs: number,
  sessionElapsedMs: number,
  bonusMs: number,
  budget: TimeBudget,
): number {
  return Math.min(deadlineMs + bonusMs, sessionElapsedMs + budget.startBudgetMs);
}

export function remainingMsOf(deadlineMs: number, sessionElapsedMs: number): number {
  return Math.max(0, deadlineMs - sessionElapsedMs);
}

export function remainingPercentOf(
  deadlineMs: number,
  sessionElapsedMs: number,
  budget: TimeBudget,
): number {
  return (remainingMsOf(deadlineMs, sessionElapsedMs) / budget.startBudgetMs) * 100;
}

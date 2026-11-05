import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WALL_TARGETS, type WallTarget } from '@app/device/contracts/target';
import { applyInput, startSession, type GameSession } from '@app/gameplay/domain/game-session';
import type { GameRules, LevelConfig } from '@app/gameplay/domain/game-rules';
import { isTerminal } from '@app/gameplay/domain/session-phase';
import { currentColorOf, type ColorRoundState } from '@app/gameplay/modes/color/color-rules';
import { rulesFor } from '@app/gameplay/modes/registry';
import { levelConfigOf } from '@app/gameplay/training/training-step';
import type { TrainingContent } from '../api/types';
import { formatDuration, formatNumber } from '../content/format';
import { colorLabels } from '../content/labels';
import { ProgressBar } from './charts';

const TICK_MS = 100;

type Session = GameSession<unknown>;

export interface StepOutcome {
  title: string;
  cleared: boolean;
  score: number;
  attempts: number;
}

interface TrainingSimulatorProps {
  content: TrainingContent;
  onFinished: (outcomes: StepOutcome[]) => void;
}

function hitOn(target: WallTarget, sequence: number) {
  return {
    kind: 'targetHit' as const,
    eventId: `sim-${sequence}`,
    deviceId: 'simulador-web',
    targetId: target.id,
    color: target.color,
    row: target.row,
    column: target.column,
    impact: null,
    deviceUptimeMs: sequence * 250,
    receivedAt: Date.now(),
  };
}

const PHASE_LABEL: Record<Session['phase']['kind'], string> = {
  preparing: 'Preparando',
  awaitingHit: 'Bata no alvo',
  resolving: 'Registrando batida',
  paused: 'Pausado',
  deviceLost: 'Parede desconectada',
  levelCleared: 'Etapa concluída',
  levelFailed: 'Etapa perdida',
};

export function TrainingSimulator({ content, onFinished }: TrainingSimulatorProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const hits = useRef(0);

  const step = content.steps[stepIndex];
  const rules = useMemo(
    () => (step ? (rulesFor(step.mode) as GameRules<LevelConfig, unknown>) : null),
    [step],
  );
  const config = useMemo(() => (step ? levelConfigOf(step, content.difficulty) : null), [step, content.difficulty]);

  useEffect(() => {
    if (!rules || !config) {
      return;
    }
    setSession(startSession({ rules, config, random: Math.random, deviceStatus: 'connected', startedAt: Date.now() }));
  }, [rules, config]);

  useEffect(() => {
    if (!rules || !config) {
      return;
    }
    const timer = window.setInterval(
      () => setSession((current) => (current ? applyInput(current, { kind: 'tick', deltaMs: TICK_MS }, rules, config) : current)),
      TICK_MS,
    );
    return () => window.clearInterval(timer);
  }, [rules, config]);

  const hit = useCallback(
    (target: WallTarget) => {
      if (!rules || !config) {
        return;
      }
      hits.current += 1;
      const event = hitOn(target, hits.current);
      setSession((current) => (current ? applyInput(current, { kind: 'deviceEvent', event }, rules, config) : current));
    },
    [rules, config],
  );

  const togglePause = () => {
    if (!rules || !config) {
      return;
    }
    setSession((current) =>
      current
        ? applyInput(current, { kind: current.phase.kind === 'paused' ? 'resume' : 'pause' }, rules, config)
        : current,
    );
  };

  const finished = session !== null && isTerminal(session.phase);

  const next = () => {
    if (!session || !step) {
      return;
    }
    const outcome: StepOutcome = {
      title: step.title,
      cleared: session.phase.kind === 'levelCleared',
      score: session.score,
      attempts: session.records.length,
    };
    const all = [...outcomes, outcome];
    setOutcomes(all);

    if (stepIndex + 1 >= content.steps.length || !outcome.cleared) {
      setSession(null);
      onFinished(all);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  if (!step || !session) {
    return null;
  }

  const promptColor = step.mode === 'level_color' ? currentColorOf(session.modeState as ColorRoundState) : null;
  const scoring = step.mode === 'level_score' ? step.config.palette : null;
  const awaiting = session.phase.kind === 'awaitingHit';

  return (
    <div className="stack">
      <div className="row-between">
        <div className="stack-sm">
          <span className="eyebrow">
            Etapa {stepIndex + 1} de {content.steps.length}
          </span>
          <h3>{step.title}</h3>
        </div>
        <div className="row">
          <span className="badge">{PHASE_LABEL[session.phase.kind]}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={togglePause} disabled={finished}>
            {session.phase.kind === 'paused' ? 'Retomar' : 'Pausar'}
          </button>
        </div>
      </div>

      <div className="grid-tiles">
        <div className="card-flat stat">
          <span className="eyebrow">Pontos</span>
          <span className="stat-value">{formatNumber(session.score)}</span>
        </div>
        <div className="card-flat stat">
          <span className="eyebrow">Tempo</span>
          <span className="stat-value">{formatDuration(session.sessionElapsedMs)}</span>
        </div>
        <div className="card-flat stat">
          <span className="eyebrow">{promptColor ? 'Cor pedida' : 'Cores que pontuam'}</span>
          <span className="stat-value" style={{ fontSize: '1.125rem' }}>
            {promptColor ? colorLabels[promptColor] : scoring?.map((color) => colorLabels[color]).join(', ')}
          </span>
        </div>
      </div>

      <ProgressBar value={session.progress * 100} label="Progresso da etapa" />

      {session.phase.kind === 'preparing' ? (
        <p className="muted">Começa em {Math.ceil(session.phase.remainingMs / 1000)} s…</p>
      ) : null}

      <div className="sim-wall" aria-label="Parede simulada">
        {WALL_TARGETS.map((target) => (
          <button
            key={target.id}
            type="button"
            className={`sim-target ${target.color} ${awaiting && promptColor === target.color ? 'prompted' : ''}`}
            disabled={!awaiting}
            onClick={() => hit(target)}
            aria-label={`Bater no alvo A${target.id}, ${colorLabels[target.color]}`}
          >
            A{target.id}
          </button>
        ))}
      </div>

      {session.feedback ? (
        <p className={session.feedback.verdict === 'correct' ? 'feedback-correct' : 'feedback-incorrect'} aria-live="polite">
          {session.feedback.verdict === 'correct' ? `Acerto +${session.feedback.scoreDelta}` : 'Erro'}
        </p>
      ) : null}

      {finished ? (
        <div className={session.phase.kind === 'levelCleared' ? 'alert alert-success row-between' : 'alert alert-danger row-between'}>
          <span>{session.phase.kind === 'levelCleared' ? 'Etapa concluída.' : 'A etapa não foi concluída.'}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={next}>
            {stepIndex + 1 < content.steps.length && session.phase.kind === 'levelCleared' ? 'Próxima etapa' : 'Ver resultado'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

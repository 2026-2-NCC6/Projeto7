import { useEffect } from 'react';
import { useTheme } from 'styled-components/native';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { WALL_TARGETS } from '../../device/contracts';
import { useDevice } from '../../device/runtime/useDevice';
import { ConnectionBanner } from '../../gameplay/components/ConnectionBanner';
import { GameHeader } from '../../gameplay/components/GameHeader';
import { MeterBar } from '../../gameplay/components/MeterBar';
import { PrepareOverlay } from '../../gameplay/components/PrepareOverlay';
import { TargetGrid } from '../../gameplay/components/TargetGrid';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import { GameplayDevPanel } from '../../gameplay/devtools/GameplayDevPanel';
import type { InfiniteScoreConfig } from '../../gameplay/modes/infinite-score/infinite-score-levels';
import type { InfiniteScoreState } from '../../gameplay/modes/infinite-score/infinite-score-rules';
import { INFINITE_LEVEL } from '../../gameplay/modes/mode-catalog';
import { multiplierFor } from '../../gameplay/modes/shared/scoring';
import { remainingPercentOf } from '../../gameplay/modes/shared/time-budget';
import { useGameSession } from '../../gameplay/runtime/useGameSession';
import { TARGET_COLORS } from '../../types/game';
import {
  Body,
  GridArea,
  Legend,
  LegendItem,
  LegendValue,
  ScoreBlock,
  ScoreValue,
  Stage,
  StatusNote,
  StatusRow,
  Swatch,
  TimeLabel,
} from './styles';

interface InfiniteScoreGameScreenProps {
  level: number;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

export function InfiniteScoreGameScreen({
  onExit,
  onHelp,
  onFinish,
}: InfiniteScoreGameScreenProps) {
  const theme = useTheme();
  const { status, reconnect } = useDevice();
  const controller = useGameSession<InfiniteScoreState>({
    mode: 'infinite_score',
    level: INFINITE_LEVEL,
  });

  useEffect(() => {
    if (controller?.result) {
      onFinish(controller.result);
    }
  }, [controller?.result, onFinish]);

  if (!controller) {
    return null;
  }

  const { session, config } = controller;
  const scoreConfig = config as InfiniteScoreConfig;
  const { modeState } = session;
  const multiplier = multiplierFor(modeState.streak, scoreConfig.streakMultiplier);

  return (
    <Stage edges={['top', 'bottom']}>
      <GameHeader
        label={texts.game.header(gameModeLabels.infinite_score, null)}
        foreground={theme.colors.ink}
        chipBackground={theme.colors.surface}
        onClose={onExit}
        onHelp={onHelp}
      />

      <Body>
        <ScoreBlock>
          <ScoreValue foreground={theme.colors.primaryDark}>
            {modeState.score.toLocaleString('pt-BR')}
          </ScoreValue>
        </ScoreBlock>

        <TimeLabel>{texts.game.timeLeft}</TimeLabel>
        <MeterBar
          percentage={remainingPercentOf(
            modeState.deadlineMs,
            session.sessionElapsedMs,
            scoreConfig.timeBudget,
          )}
          fillColor={theme.colors.danger}
          trackColor={theme.colors.border}
          thickness={theme.sizes.meterThick}
          animated={false}
        />

        <Legend>
          {TARGET_COLORS.map((color) => (
            <LegendItem key={color}>
              <Swatch fill={theme.colors.target[color].background} />
              <LegendValue>{`+${scoreConfig.pointsPerColor[color]}`}</LegendValue>
            </LegendItem>
          ))}
        </Legend>

        <GridArea>
          <TargetGrid
            activeColors={scoreConfig.palette}
            valueOf={(color) => `+${scoreConfig.pointsPerColor[color]}`}
            pulse={
              session.feedback && session.feedback.targetId !== null
                ? {
                    seq: session.feedback.seq,
                    scoreDelta: session.feedback.scoreDelta,
                    targetId: session.feedback.targetId,
                  }
                : null
            }
            popForeground={theme.colors.ink}
          />
        </GridArea>

        <StatusRow>
          <StatusNote>{texts.game.streak(modeState.streak)}</StatusNote>
          {scoreConfig.streakMultiplier ? (
            <StatusNote>{texts.game.multiplier(multiplier)}</StatusNote>
          ) : null}
        </StatusRow>

        <ConnectionBanner
          status={status}
          surface={theme.colors.surface}
          foreground={theme.colors.ink}
          onRetry={reconnect}
        />
      </Body>

      {session.phase.kind === 'preparing' ? (
        <PrepareOverlay
          remainingMs={session.phase.remainingMs}
          foreground={theme.colors.ink}
          backdrop={theme.colors.background}
        />
      ) : null}

      <GameplayDevPanel
        expectedTargets={WALL_TARGETS.filter((target) =>
          scoreConfig.palette.includes(target.color),
        ).map((target) => target.id)}
      />
    </Stage>
  );
}

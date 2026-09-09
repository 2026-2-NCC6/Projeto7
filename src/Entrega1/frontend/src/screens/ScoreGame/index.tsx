import { useEffect } from 'react';
import { useTheme } from 'styled-components/native';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { useDevice } from '../../device/runtime/useDevice';
import { ConnectionBanner } from '../../gameplay/components/ConnectionBanner';
import { GameHeader } from '../../gameplay/components/GameHeader';
import { MeterBar } from '../../gameplay/components/MeterBar';
import { PrepareOverlay } from '../../gameplay/components/PrepareOverlay';
import { TargetGrid } from '../../gameplay/components/TargetGrid';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import type { ScoreLevelConfig } from '../../gameplay/modes/score/score-levels';
import {
  accuracyOf,
  multiplierFor,
  type ScoreRoundState,
} from '../../gameplay/modes/score/score-rules';
import { GameplayDevPanel } from '../../gameplay/devtools/GameplayDevPanel';
import { useGameSession } from '../../gameplay/runtime/useGameSession';
import { WALL_TARGETS } from '../../device/contracts';
import { TARGET_COLORS } from '../../types/game';
import {
  Body,
  GridArea,
  Legend,
  LegendItem,
  LegendValue,
  ScoreBlock,
  ScoreGoal,
  ScoreValue,
  Stage,
  StatusNote,
  StatusRow,
  Swatch,
  TimeLabel,
} from './styles';

const FULL_PERCENT = 100;

interface ScoreGameScreenProps {
  level: number;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

export function ScoreGameScreen({ level, onExit, onHelp, onFinish }: ScoreGameScreenProps) {
  const theme = useTheme();
  const { status, reconnect } = useDevice();
  const controller = useGameSession<ScoreRoundState>({ mode: 'level_score', level });

  useEffect(() => {
    if (controller?.result) {
      onFinish(controller.result);
    }
  }, [controller?.result, onFinish]);

  if (!controller) {
    return null;
  }

  const { session, config } = controller;
  const scoreConfig = config as ScoreLevelConfig;
  const { modeState } = session;

  const timePercent =
    scoreConfig.timeLimitMs === null
      ? null
      : Math.max(
          0,
          FULL_PERCENT - (session.sessionElapsedMs / scoreConfig.timeLimitMs) * FULL_PERCENT,
        );

  const accuracy = accuracyOf(modeState);
  const multiplier = multiplierFor(modeState.streak, scoreConfig.streakMultiplier);

  return (
    <Stage edges={['top', 'bottom']}>
      <GameHeader
        label={texts.game.header(gameModeLabels.level_score, config.level)}
        foreground={theme.colors.ink}
        chipBackground={theme.colors.surface}
        onClose={onExit}
        onHelp={onHelp}
      />

      <Body>
        <ScoreBlock>
          <ScoreValue foreground={theme.colors.primaryDark}>{modeState.score}</ScoreValue>
          <ScoreGoal>{texts.game.scoreGoal(scoreConfig.targetScore)}</ScoreGoal>
        </ScoreBlock>

        <MeterBar
          percentage={session.progress * FULL_PERCENT}
          fillColor={theme.colors.primaryDark}
          trackColor={theme.colors.border}
          thickness={theme.sizes.meterThick}
        />

        {timePercent === null ? null : (
          <>
            <TimeLabel>{texts.game.timeLeft}</TimeLabel>
            <MeterBar
              percentage={timePercent}
              fillColor={theme.colors.danger}
              trackColor={theme.colors.border}
              thickness={theme.sizes.progressBarSmall}
              animated={false}
            />
          </>
        )}

        <Legend>
          {TARGET_COLORS.map((color) => (
            <LegendItem key={color}>
              <Swatch
                fill={theme.colors.target[color].background}
                muted={!scoreConfig.palette.includes(color)}
              />
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
          {scoreConfig.requiredAccuracyPercent === null ? null : (
            <StatusNote>
              {accuracy === null
                ? texts.game.minimumAccuracy(scoreConfig.requiredAccuracyPercent)
                : texts.game.currentAccuracy(accuracy)}
            </StatusNote>
          )}
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

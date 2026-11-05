import { useEffect } from 'react';
import { useTheme } from 'styled-components/native';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { useDevice } from '../../device/runtime/useDevice';
import { ConnectionBanner } from '../../gameplay/components/ConnectionBanner';
import { GameHeader } from '../../gameplay/components/GameHeader';
import { MeterBar } from '../../gameplay/components/MeterBar';
import { PrepareOverlay } from '../../gameplay/components/PrepareOverlay';
import { PromptRing } from '../../gameplay/components/PromptRing';
import { SequenceTimeline } from '../../gameplay/components/SequenceTimeline';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import type { ColorLevelConfig } from '../../gameplay/modes/color/color-levels';
import { currentColorOf, type ColorRoundState } from '../../gameplay/modes/color/color-rules';
import { GameplayDevPanel } from '../../gameplay/devtools/GameplayDevPanel';
import { useColorWash } from '../../gameplay/runtime/useColorWash';
import { useGameSession } from '../../gameplay/runtime/useGameSession';
import type { TrainingRun } from '../../gameplay/training/training-run';
import { targetsWithColor } from '../../device/contracts';
import { TARGET_COLORS, type TargetColor } from '../../types/game';
import {
  Footer,
  FooterNote,
  Middle,
  Prompt,
  Safe,
  Stage,
  TargetName,
  TimelineArea,
  WindowBar,
} from './styles';

const FULL_PERCENT = 100;

interface ColorGameScreenProps {
  level: number;
  training?: TrainingRun;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

export function ColorGameScreen({ level, training, onExit, onHelp, onFinish }: ColorGameScreenProps) {
  const theme = useTheme();
  const { status, reconnect } = useDevice();
  const controller = useGameSession<ColorRoundState>({ mode: 'level_color', level, training });

  const modeState = controller?.session.modeState;
  const activeColor: TargetColor = modeState ? currentColorOf(modeState) : TARGET_COLORS[0];
  const { background, tone, overlay } = useColorWash(activeColor);

  useEffect(() => {
    if (controller?.result) {
      onFinish(controller.result);
    }
  }, [controller?.result, onFinish]);

  if (!controller) {
    return null;
  }

  const { session, config } = controller;
  const colorConfig = config as ColorLevelConfig;

  const windowPercent =
    colorConfig.reactionWindowMs === null
      ? null
      : Math.max(
          0,
          FULL_PERCENT - (session.promptElapsedMs / colorConfig.reactionWindowMs) * FULL_PERCENT,
        );

  const mistakesLeft =
    colorConfig.maxMistakes === null ? null : colorConfig.maxMistakes - session.modeState.mistakes;

  return (
    <Stage style={{ backgroundColor: background }}>
      <Safe edges={['top', 'bottom']}>
        <GameHeader
          label={training ? texts.game.trainingHeader(training.title, training.stepIndex + 1, training.steps.length) : texts.game.header(gameModeLabels.level_color, config.level)}
          foreground={tone.foreground}
          chipBackground={overlay}
          onClose={onExit}
          onHelp={onHelp}
        />

        <TimelineArea>
          <SequenceTimeline
            length={session.modeState.sequence.length}
            index={session.modeState.index}
            colors={{
              done: tone.foreground,
              doneMark: tone.background,
              current: overlay,
              pending: overlay,
              outline: tone.foreground,
            }}
          />
        </TimelineArea>

        {windowPercent === null ? null : (
          <WindowBar>
            <MeterBar
              percentage={windowPercent}
              fillColor={tone.foreground}
              trackColor={overlay}
              thickness={theme.sizes.progressBarSmall}
              animated={false}
            />
          </WindowBar>
        )}

        <Middle>
          {session.phase.kind === 'preparing' ? null : (
            <>
              <PromptRing
                fill={overlay}
                outline={tone.foreground}
                pulsing={session.phase.kind === 'awaitingHit'}
              />
              <Prompt foreground={tone.foreground}>{texts.game.hitTarget}</Prompt>
              <TargetName foreground={tone.foreground}>
                {texts.game.targetName[activeColor].toUpperCase()}
              </TargetName>
            </>
          )}
        </Middle>

        <Footer>
          <ConnectionBanner
            status={status}
            surface={overlay}
            foreground={tone.foreground}
            onRetry={reconnect}
          />
          <FooterNote foreground={tone.foreground}>
            {mistakesLeft === null
              ? texts.game.sequence(session.modeState.index, session.modeState.sequence.length)
              : texts.game.mistakesLeft(Math.max(0, mistakesLeft))}
          </FooterNote>
        </Footer>

        {session.phase.kind === 'preparing' ? (
          <PrepareOverlay
            remainingMs={session.phase.remainingMs}
            foreground={tone.foreground}
            backdrop={overlay}
          />
        ) : null}

        <GameplayDevPanel
          expectedTargets={targetsWithColor(activeColor).map((target) => target.id)}
        />
      </Safe>
    </Stage>
  );
}

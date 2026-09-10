import { useEffect } from 'react';
import { useTheme } from 'styled-components/native';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { targetsWithColor } from '../../device/contracts';
import { useDevice } from '../../device/runtime/useDevice';
import { ConnectionBanner } from '../../gameplay/components/ConnectionBanner';
import { GameHeader } from '../../gameplay/components/GameHeader';
import { MeterBar } from '../../gameplay/components/MeterBar';
import { PrepareOverlay } from '../../gameplay/components/PrepareOverlay';
import { PromptRing } from '../../gameplay/components/PromptRing';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import { GameplayDevPanel } from '../../gameplay/devtools/GameplayDevPanel';
import { INFINITE_LEVEL } from '../../gameplay/modes/mode-catalog';
import type { InfiniteColorConfig } from '../../gameplay/modes/infinite-color/infinite-color-levels';
import {
  currentColorOf,
  type InfiniteColorState,
} from '../../gameplay/modes/infinite-color/infinite-color-rules';
import { remainingPercentOf } from '../../gameplay/modes/shared/time-budget';
import { useColorWash } from '../../gameplay/runtime/useColorWash';
import { useGameSession } from '../../gameplay/runtime/useGameSession';
import { TARGET_COLORS, type TargetColor } from '../../types/game';
import {
  Footer,
  FooterNote,
  Middle,
  Prompt,
  Safe,
  Score,
  Stage,
  TargetName,
  TimeArea,
  TimeLabel,
} from './styles';

interface InfiniteColorGameScreenProps {
  level: number;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

export function InfiniteColorGameScreen({
  onExit,
  onHelp,
  onFinish,
}: InfiniteColorGameScreenProps) {
  const theme = useTheme();
  const { status, reconnect } = useDevice();
  const controller = useGameSession<InfiniteColorState>({
    mode: 'infinite_color',
    level: INFINITE_LEVEL,
  });

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
  const { timeBudget } = config as InfiniteColorConfig;

  return (
    <Stage style={{ backgroundColor: background }}>
      <Safe edges={['top', 'bottom']}>
        <GameHeader
          label={texts.game.header(gameModeLabels.infinite_color, null)}
          foreground={tone.foreground}
          chipBackground={overlay}
          onClose={onExit}
          onHelp={onHelp}
        />

        <TimeArea>
          <TimeLabel foreground={tone.foreground}>{texts.game.timeLeft.toUpperCase()}</TimeLabel>
          <MeterBar
            percentage={remainingPercentOf(
              session.modeState.deadlineMs,
              session.sessionElapsedMs,
              timeBudget,
            )}
            fillColor={tone.foreground}
            trackColor={overlay}
            thickness={theme.sizes.meterThick}
            animated={false}
          />
        </TimeArea>

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
          <Score foreground={tone.foreground}>
            {session.modeState.score.toLocaleString('pt-BR')}
          </Score>
          <FooterNote foreground={tone.foreground}>
            {texts.game.hitsMade(session.modeState.index)}
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

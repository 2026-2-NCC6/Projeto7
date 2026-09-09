import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from 'styled-components/native';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { useDevice } from '../../device/runtime/useDevice';
import { ConnectionBanner } from '../../gameplay/components/ConnectionBanner';
import { GameHeader } from '../../gameplay/components/GameHeader';
import { MeterBar } from '../../gameplay/components/MeterBar';
import { PrepareOverlay } from '../../gameplay/components/PrepareOverlay';
import { SequenceTimeline } from '../../gameplay/components/SequenceTimeline';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import type { ColorLevelConfig } from '../../gameplay/modes/color/color-levels';
import { currentColorOf, type ColorRoundState } from '../../gameplay/modes/color/color-rules';
import { GameplayDevPanel } from '../../gameplay/devtools/GameplayDevPanel';
import { useGameSession } from '../../gameplay/runtime/useGameSession';
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
import { PromptRing } from './components/PromptRing';

const COLOR_FADE_MS = 320;
const FULL_PERCENT = 100;

interface ColorGameScreenProps {
  level: number;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

export function ColorGameScreen({ level, onExit, onHelp, onFinish }: ColorGameScreenProps) {
  const theme = useTheme();
  const { status, reconnect } = useDevice();
  const controller = useGameSession<ColorRoundState>({ mode: 'level_color', level });
  const blend = useRef(new Animated.Value(0)).current;

  const modeState = controller?.session.modeState;
  const activeColor: TargetColor = modeState ? currentColorOf(modeState) : TARGET_COLORS[0];

  useEffect(() => {
    Animated.timing(blend, {
      toValue: TARGET_COLORS.indexOf(activeColor),
      duration: COLOR_FADE_MS,
      useNativeDriver: false,
    }).start();
  }, [activeColor, blend]);

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
  const tone = theme.colors.target[activeColor];
  const overlay =
    tone.foreground === theme.colors.onInk ? theme.colors.translucentDark : theme.colors.translucentLight;

  const background = blend.interpolate({
    inputRange: TARGET_COLORS.map((_, index) => index),
    outputRange: TARGET_COLORS.map((color) => theme.colors.target[color].background),
  });

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
          label={texts.game.header(gameModeLabels.level_color, config.level)}
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

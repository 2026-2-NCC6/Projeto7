import type { ComponentType } from 'react';
import type { SessionResult } from '../gameplay/domain/metrics/session-result';
import { ColorGameScreen } from '../screens/ColorGame';
import { InfiniteColorGameScreen } from '../screens/InfiniteColorGame';
import { InfiniteScoreGameScreen } from '../screens/InfiniteScoreGame';
import { ScoreGameScreen } from '../screens/ScoreGame';
import type { PlayableModeId } from '../types/game';

export interface MatchScreenProps {
  level: number;
  onExit: () => void;
  onHelp: () => void;
  onFinish: (result: SessionResult) => void;
}

/** Adding a mode means adding its screen here — no conditional anywhere else. */
export const matchScreens: Record<PlayableModeId, ComponentType<MatchScreenProps>> = {
  level_color: ColorGameScreen,
  level_score: ScoreGameScreen,
  infinite_color: InfiniteColorGameScreen,
  infinite_score: InfiniteScoreGameScreen,
};

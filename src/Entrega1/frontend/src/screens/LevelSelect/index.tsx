import { Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import type { LevelConfig } from '../../gameplay/domain/game-rules';
import { rulesFor } from '../../gameplay/modes/registry';
import { isLevelUnlocked, useLevelProgressStore } from '../../gameplay/store/levelProgressStore';
import type { PlayableModeId } from '../../types/game';
import { LevelTile, type LevelTileTone } from './components/LevelTile';
import {
  BackAction,
  Content,
  Grid,
  GridRow,
  Header,
  Progress,
  Title,
} from './styles';

const PER_ROW = 4;

function inRows(levels: readonly LevelConfig[]): LevelConfig[][] {
  return levels.reduce<LevelConfig[][]>((rows, level, index) => {
    if (index % PER_ROW === 0) {
      rows.push([]);
    }
    rows[rows.length - 1].push(level);
    return rows;
  }, []);
}

interface LevelSelectScreenProps {
  mode: PlayableModeId;
  onGoBack: () => void;
  onSelectLevel: (level: number) => void;
}

export function LevelSelectScreen({ mode, onGoBack, onSelectLevel }: LevelSelectScreenProps) {
  const theme = useTheme();
  const progress = useLevelProgressStore((state) => state.byMode[mode]);
  const levels = rulesFor(mode).levels;

  const toneFor = (level: number): LevelTileTone => {
    if (level <= progress.highestCleared) {
      return {
        surface: theme.colors.primary,
        outline: theme.colors.primary,
        foreground: theme.colors.onPrimary,
        noteForeground: theme.colors.onPrimary,
      };
    }

    if (isLevelUnlocked(progress, level)) {
      return {
        surface: theme.colors.surfaceRaised,
        outline: theme.colors.primaryDark,
        foreground: theme.colors.ink,
        noteForeground: theme.colors.inkSoft,
      };
    }

    return {
      surface: theme.colors.surface,
      outline: theme.colors.border,
      foreground: theme.colors.inkSoft,
      noteForeground: theme.colors.inkSoft,
    };
  };

  const noteFor = (level: number): string | null => {
    if (!isLevelUnlocked(progress, level)) {
      return texts.levels.locked;
    }

    const best = progress.bestScoreByLevel[level];
    return best ? texts.levels.bestScore(best) : null;
  };

  return (
    <Screen edges={['top']}>
      <Content>
        <Pressable onPress={onGoBack} accessibilityRole="button">
          <BackAction>{`‹ ${texts.levels.back}`}</BackAction>
        </Pressable>

        <Header>
          <Title>{texts.levels.title(gameModeLabels[mode])}</Title>
          <Progress>
            {texts.levels.progress(progress.highestCleared, levels.length)}
          </Progress>
        </Header>

        <Grid>
          {inRows(levels).map((row) => (
            <GridRow key={row[0].level}>
              {row.map((level) => (
                <LevelTile
                  key={level.level}
                  level={level.level}
                  note={noteFor(level.level)}
                  tone={toneFor(level.level)}
                  disabled={!isLevelUnlocked(progress, level.level)}
                  onPress={() => onSelectLevel(level.level)}
                />
              ))}
            </GridRow>
          ))}
        </Grid>
      </Content>
    </Screen>
  );
}

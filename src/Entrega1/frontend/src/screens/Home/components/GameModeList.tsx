import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Icon } from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import { gameModeIcons, gameModeLabels } from '../../../content/gameLabels';
import { texts } from '../../../content/texts';
import { accentPairOf } from '../../../gameplay/components/ModeAccent';
import type { ModeCatalogEntry } from '../../../gameplay/modes/mode-catalog';

const CHEVRON = { length: 7, half: 5 };

const List = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Row = styled(Card)<{ dimmed: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  padding: ${({ theme }) => theme.spacing['2xl']}px ${({ theme }) => theme.spacing['3xl']}px;
  opacity: ${({ dimmed }) => (dimmed ? 0.55 : 1)};
`;

const Badge = styled.View<{ accent: string }>`
  width: ${({ theme }) => theme.sizes.badge}px;
  height: ${({ theme }) => theme.sizes.badge}px;
  border-radius: ${({ theme }) => theme.radii.xl}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ accent }) => accent};
`;

const Details = styled.View`
  flex: 1;
`;

const Name = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })``;

const Tag = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft' })``;

const Soon = styled(Text).attrs({ size: 'xs', weight: 'extraBold', tone: 'inkSoft' })``;

interface GameModeListProps {
  modes: readonly ModeCatalogEntry[];
  onSelect: (mode: ModeCatalogEntry) => void;
}

export function GameModeList({ modes, onSelect }: GameModeListProps) {
  const theme = useTheme();

  return (
    <List>
      {modes.map((mode) => {
        const accent = accentPairOf(theme, mode.accent);

        return (
          <Pressable
            key={mode.id}
            onPress={() => onSelect(mode)}
            disabled={!mode.playable}
            accessibilityRole="button"
          >
            <Row dimmed={!mode.playable}>
              <Badge accent={accent.background}>
                <Icon name={gameModeIcons[mode.id]} color={accent.foreground} />
              </Badge>
              <Details>
                <Name>{gameModeLabels[mode.id]}</Name>
                <Tag>{texts.play.modeTag[mode.id]}</Tag>
              </Details>
              {mode.playable ? (
                <Triangle direction="right" {...CHEVRON} color={theme.colors.inkSoft} />
              ) : (
                <Soon>{texts.play.soon}</Soon>
              )}
            </Row>
          </Pressable>
        );
      })}
    </List>
  );
}

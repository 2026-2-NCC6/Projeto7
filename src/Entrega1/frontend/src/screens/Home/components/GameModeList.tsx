import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Icon } from '../../../components/Icon';
import { gameModeIcons, gameModeLabels } from '../../../content/gameLabels';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import type { GameMode, ModeAccent } from '../data/gameModes';

const CHEVRON = { length: 7, half: 5 };

const List = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Row = styled(Card)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  padding: ${({ theme }) => theme.spacing['2xl']}px ${({ theme }) => theme.spacing['3xl']}px;
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

interface GameModeListProps {
  modes: GameMode[];
  onSelect: (mode: GameMode) => void;
}

export function GameModeList({ modes, onSelect }: GameModeListProps) {
  const theme = useTheme();

  const accentColor = (accent: ModeAccent): string => {
    if (accent === 'primary') return theme.colors.primary;
    if (accent === 'ink') return theme.colors.ink;
    return theme.colors.target[accent];
  };

  return (
    <List>
      {modes.map((mode) => (
        <Pressable key={mode.id} onPress={() => onSelect(mode)} accessibilityRole="button">
          <Row>
            <Badge accent={accentColor(mode.accent)}>
              <Icon name={gameModeIcons[mode.id]} color={theme.colors.onPrimary} />
            </Badge>
            <Details>
              <Name>{gameModeLabels[mode.id]}</Name>
              <Tag>{mode.tag}</Tag>
            </Details>
            <Triangle direction="right" {...CHEVRON} color={theme.colors.inkSoft} />
          </Row>
        </Pressable>
      ))}
    </List>
  );
}

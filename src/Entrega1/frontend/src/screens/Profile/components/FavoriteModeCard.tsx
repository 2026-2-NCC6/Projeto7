import styled, { useTheme } from 'styled-components/native';
import { Icon } from '../../../components/Icon';
import { IconTile } from '../../../components/IconTile';
import { Text } from '../../../components/Text';
import { gameModeIcons, gameModeLabels } from '../../../content/gameLabels';
import { texts } from '../../../content/texts';
import type { GameModeId } from '../../../types/game';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  padding: ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii['4xl']}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Labels = styled.View`
  flex: 1;
`;

const Eyebrow = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'primaryDark',
  tracking: 'wide',
})``;

const Name = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })`
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

interface FavoriteModeCardProps {
  mode: GameModeId;
}

export function FavoriteModeCard({ mode }: FavoriteModeCardProps) {
  const theme = useTheme();

  return (
    <Container>
      <IconTile diameter={theme.sizes.badge} background={theme.colors.primary}>
        <Icon name={gameModeIcons[mode]} color={theme.colors.onPrimary} />
      </IconTile>
      <Labels>
        <Eyebrow>{texts.profile.favoriteModeLabel}</Eyebrow>
        <Name>{gameModeLabels[mode]}</Name>
      </Labels>
    </Container>
  );
}

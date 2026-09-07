import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import { texts } from '../../../content/texts';
import { heroAccents } from '../data/gameModes';

const HERO_TITLE_MAX_WIDTH = 220;
const PLAY_ICON = { length: 9, half: 6 };

const Gradient = styled(LinearGradient)`
  border-radius: ${({ theme }) => theme.radii['6xl']}px;
  padding: ${({ theme }) => theme.spacing['7xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
  overflow: hidden;
`;

const Eyebrow = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'onPrimary',
  tracking: 'wider',
})`
  opacity: 0.85;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled(Text).attrs({
  size: '3xl',
  weight: 'extraBold',
  tone: 'onPrimary',
  leading: 'snug',
})`
  max-width: ${HERO_TITLE_MAX_WIDTH}px;
  margin-bottom: ${({ theme }) => theme.spacing['4xl']}px;
`;

const ActionButton = styled.View`
  flex-direction: row;
  align-self: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['6xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

const ActionLabel = styled(Text).attrs({ size: 'md', weight: 'extraBold', tone: 'primaryDark' })``;

const AccentGrid = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing['3xl']}px;
  right: ${({ theme }) => theme.spacing['3xl']}px;
  flex-direction: row;
  flex-wrap: wrap;
  width: ${({ theme }) => theme.sizes.heroCell * 3 + (theme.spacing.sm - 1) * 2}px;
  gap: ${({ theme }) => theme.spacing.sm - 1}px;
  opacity: 0.9;
`;

const AccentCell = styled.View<{ fill: string }>`
  width: ${({ theme }) => theme.sizes.heroCell}px;
  height: ${({ theme }) => theme.sizes.heroCell}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ fill }) => fill};
`;

interface HeroCardProps {
  onStartTraining: () => void;
}

export function HeroCard({ onStartTraining }: HeroCardProps) {
  const theme = useTheme();

  return (
    <Gradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={theme.shadows.heroCard}
    >
      <Eyebrow>{texts.home.heroEyebrow}</Eyebrow>
      <Title>{texts.home.heroTitle}</Title>

      <Pressable onPress={onStartTraining} accessibilityRole="button">
        <ActionButton>
          <Triangle direction="right" {...PLAY_ICON} color={theme.colors.primaryDark} />
          <ActionLabel>{texts.home.heroAction}</ActionLabel>
        </ActionButton>
      </Pressable>

      <AccentGrid>
        {heroAccents.map((accent, index) => (
          <AccentCell
            key={index}
            fill={accent ? theme.colors.target[accent] : theme.colors.translucentLight}
          />
        ))}
      </AccentGrid>
    </Gradient>
  );
}

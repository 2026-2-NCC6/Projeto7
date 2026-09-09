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

const CTA_ARROW = { length: 6, half: 4 };

const Container = styled(Card)<{ dimmed: boolean }>`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  border-radius: ${({ theme }) => theme.radii['5xl']}px;
  opacity: ${({ dimmed }) => (dimmed ? 0.55 : 1)};
`;

const Heading = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
`;

const Badge = styled.View<{ accent: string }>`
  width: ${({ theme }) => theme.sizes.badgeLarge}px;
  height: ${({ theme }) => theme.sizes.badgeLarge}px;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ accent }) => accent};
`;

const Titles = styled.View`
  flex: 1;
`;

const Name = styled(Text).attrs({ size: 'xl', weight: 'extraBold' })``;

const Tag = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft' })``;

const Description = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft', leading: 'relaxed' })``;

const Cta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const CtaLabel = styled(Text).attrs({ size: 'base', weight: 'extraBold' })<{ accent: string }>`
  color: ${({ accent }) => accent};
`;

const Soon = styled(Text).attrs({ size: 'base', weight: 'extraBold', tone: 'inkSoft' })``;

interface ModeCardProps {
  mode: ModeCatalogEntry;
  onPress: () => void;
}

export function ModeCard({ mode, onPress }: ModeCardProps) {
  const theme = useTheme();
  const accent = accentPairOf(theme, mode.accent);
  const ctaColor = mode.accent === 'primary' ? theme.colors.primaryDark : accent.background;

  return (
    <Pressable onPress={onPress} disabled={!mode.playable} accessibilityRole="button">
      <Container dimmed={!mode.playable}>
        <Heading>
          <Badge accent={accent.background}>
            <Icon name={gameModeIcons[mode.id]} color={accent.foreground} />
          </Badge>
          <Titles>
            <Name>{gameModeLabels[mode.id]}</Name>
            <Tag>{texts.play.modeTag[mode.id]}</Tag>
          </Titles>
        </Heading>

        <Description>{texts.play.modeDescription[mode.id]}</Description>

        {mode.playable ? (
          <Cta>
            <CtaLabel accent={ctaColor}>
              {texts.play.playMode(gameModeLabels[mode.id])}
            </CtaLabel>
            <Triangle direction="right" {...CTA_ARROW} color={ctaColor} />
          </Cta>
        ) : (
          <Soon>{texts.play.soon}</Soon>
        )}
      </Container>
    </Pressable>
  );
}

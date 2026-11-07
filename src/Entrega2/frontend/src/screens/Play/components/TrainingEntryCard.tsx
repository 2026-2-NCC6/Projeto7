import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Icon } from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import { texts } from '../../../content/texts';

const CTA_ARROW = { length: 6, half: 4 };

const Container = styled(Card)`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  border-radius: ${({ theme }) => theme.radii['5xl']}px;
  border-width: ${({ theme }) => theme.sizes.inputBorder}px;
  border-color: ${({ theme }) => theme.colors.primaryDark};
`;

const Heading = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
`;

const Badge = styled.View`
  width: ${({ theme }) => theme.sizes.badgeLarge}px;
  height: ${({ theme }) => theme.sizes.badgeLarge}px;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const Name = styled(Text).attrs({ size: 'xl', weight: 'extraBold' })`
  flex: 1;
`;

const Description = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft', leading: 'relaxed' })``;

const Cta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const CtaLabel = styled(Text).attrs({ size: 'base', weight: 'extraBold', tone: 'primaryDark' })``;

export function TrainingEntryCard({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Container>
        <Heading>
          <Badge>
            <Icon name="calendar" color={theme.colors.onPrimary} />
          </Badge>
          <Name>{texts.trainings.entryTitle}</Name>
        </Heading>
        <Description>{texts.trainings.entryDescription}</Description>
        <Cta>
          <CtaLabel>{texts.trainings.entryCta}</CtaLabel>
          <Triangle direction="right" {...CTA_ARROW} color={theme.colors.primaryDark} />
        </Cta>
      </Container>
    </Pressable>
  );
}

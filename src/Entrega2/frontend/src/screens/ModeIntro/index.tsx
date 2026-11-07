import { useState } from 'react';
import { Pressable } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { gameModeLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import { useLevelProgressStore } from '../../gameplay/store/levelProgressStore';
import type { PlayableModeId } from '../../types/game';
import {
  ActionSlot,
  Actions,
  Body,
  Container,
  Dot,
  Dots,
  Eyebrow,
  Skip,
  StepBadge,
  StepDescription,
  StepNumber,
  StepTitle,
  TopRow,
} from './styles';
import { useTheme } from 'styled-components/native';

interface ModeIntroScreenProps {
  mode: PlayableModeId;
  onStart: () => void;
}

export function ModeIntroScreen({ mode, onStart }: ModeIntroScreenProps) {
  const theme = useTheme();
  const markIntroSeen = useLevelProgressStore((state) => state.markIntroSeen);
  const steps = texts.intro.steps[mode];
  const [index, setIndex] = useState(0);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const start = () => {
    markIntroSeen(mode);
    onStart();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Container>
        <TopRow>
          <Eyebrow>{texts.intro.eyebrow(gameModeLabels[mode])}</Eyebrow>
          <Pressable onPress={start} accessibilityRole="button">
            <Skip>{texts.intro.skip}</Skip>
          </Pressable>
        </TopRow>

        <Body>
          <StepBadge accent={theme.colors.primary}>
            <StepNumber foreground={theme.colors.onPrimary}>{index + 1}</StepNumber>
          </StepBadge>
          <StepTitle>{step.title}</StepTitle>
          <StepDescription>{step.description}</StepDescription>
        </Body>

        <Dots>
          {steps.map((_, position) => (
            <Dot key={position} active={position === index} />
          ))}
        </Dots>

        <Actions>
          {index > 0 ? (
            <ActionSlot weight={1}>
              <Button
                label={texts.intro.back}
                variant="outline"
                onPress={() => setIndex((current) => current - 1)}
              />
            </ActionSlot>
          ) : null}
          <ActionSlot weight={2}>
            <Button
              label={isLast ? texts.intro.start : texts.intro.next}
              onPress={isLast ? start : () => setIndex((current) => current + 1)}
            />
          </ActionSlot>
        </Actions>
      </Container>
    </Screen>
  );
}

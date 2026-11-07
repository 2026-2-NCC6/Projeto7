import { useCallback } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import type { TrainingRun } from '../../gameplay/training/training-run';
import type { TrainingStep } from '../../gameplay/training/training-step';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { useAuthStore } from '../../store/authStore';
import { trainingService } from '../../services/training/trainingService';
import {
  Actions,
  BackAction,
  Block,
  BlockTitle,
  Body,
  Centered,
  Content,
  Item,
  Message,
  Notice,
  Retry,
  Safety,
  StepCard,
  StepName,
  StepRule,
  Subtitle,
  Title,
} from './styles';

function ruleOf(step: TrainingStep): string {
  return step.mode === 'level_color'
    ? texts.trainings.colorRule(step.config.sequenceLength, step.config.reactionWindowMs)
    : texts.trainings.scoreRule(step.config.targetScore, step.config.timeLimitMs);
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Block>
      <BlockTitle>{title.toUpperCase()}</BlockTitle>
      {items.length === 0 ? <Item>{texts.trainings.noneListed}</Item> : items.map((item) => <Item key={item}>• {item}</Item>)}
    </Block>
  );
}

interface TrainingDetailScreenProps {
  trainingId: string;
  onGoBack: () => void;
  onStart: (run: TrainingRun) => void;
}

export function TrainingDetailScreen({ trainingId, onGoBack, onStart }: TrainingDetailScreenProps) {
  const theme = useTheme();
  const signedIn = useAuthStore((state) => state.session === 'authenticated');
  const loader = useCallback(() => trainingService.detail(trainingId), [trainingId]);
  const { data, loading, error, reload } = useRemoteResource(loader);
  const training = data?.data;

  if (loading && !training) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ActivityIndicator color={theme.colors.primaryDark} size="large" />
        </Centered>
      </Screen>
    );
  }

  if (!training) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <Message>{error ?? texts.trainings.loadError}</Message>
          <Pressable onPress={reload} accessibilityRole="button">
            <Retry>{texts.trainings.retry}</Retry>
          </Pressable>
        </Centered>
      </Screen>
    );
  }

  const run: TrainingRun = {
    id: training.id,
    version: training.version,
    title: training.title,
    difficulty: training.difficulty,
    steps: training.content.steps,
    stepIndex: 0,
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Content>
        <Pressable onPress={onGoBack} accessibilityRole="button">
          <BackAction>{texts.trainings.back}</BackAction>
        </Pressable>
        <Title>{training.title}</Title>
        <Subtitle>{training.summary}</Subtitle>
        {data.fromCache ? <Notice>{texts.trainings.cached}</Notice> : null}

        <Block>
          <BlockTitle>{texts.trainings.instructions.toUpperCase()}</BlockTitle>
          <Body>{training.content.instructions || texts.trainings.noneListed}</Body>
          <BlockTitle>{texts.trainings.scoring.toUpperCase()}</BlockTitle>
          <Body>{training.content.scoringRules || texts.trainings.noneListed}</Body>
        </Block>

        <Block>
          <BlockTitle>{`${texts.trainings.steps} (${training.content.steps.length})`.toUpperCase()}</BlockTitle>
          {training.content.steps.map((step, index) => (
            <StepCard key={index}>
              <StepName>{`${index + 1}. ${step.title}`}</StepName>
              <StepRule>{texts.trainings.stepMode[step.mode]}</StepRule>
              <StepRule>{ruleOf(step)}</StepRule>
            </StepCard>
          ))}
        </Block>

        <ListBlock title={texts.trainings.equipment} items={training.content.equipment} />
        <ListBlock title={texts.trainings.risks} items={training.content.risks} />
        <Safety>{texts.trainings.safetyNote}</Safety>
      </Content>
      <Actions>
        {signedIn ? (
          <Button label={texts.trainings.start} onPress={() => onStart(run)} />
        ) : (
          <Message>{texts.trainings.signInToPlay}</Message>
        )}
      </Actions>
    </Screen>
  );
}

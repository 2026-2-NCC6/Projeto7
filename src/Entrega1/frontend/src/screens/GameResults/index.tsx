import { useTheme } from 'styled-components/native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { MetricGrid } from '../../gameplay/components/MetricGrid';
import type { SessionResult } from '../../gameplay/domain/metrics/session-result';
import { hasLevels } from '../../gameplay/modes/mode-catalog';
import { levelCountOf } from '../../gameplay/modes/registry';
import { useRecordSession } from '../../gameplay/runtime/useRecordSession';
import { hasNextStep, type TrainingRun } from '../../gameplay/training/training-run';
import {
  Actions,
  Badge,
  BadgeMark,
  Container,
  Notice,
  RewardLabel,
  RewardPill,
  Scroll,
  Subtitle,
  Title,
} from './styles';
import { metricsFor } from './metrics';

interface GameResultsScreenProps {
  result: SessionResult;
  training?: TrainingRun;
  onPlayLevel: (level: number) => void;
  onNextStep: (training: TrainingRun) => void;
  onExit: () => void;
}

export function GameResultsScreen({
  result,
  training,
  onPlayLevel,
  onNextStep,
  onExit,
}: GameResultsScreenProps) {
  const theme = useTheme();
  const { status, recorded, error } = useRecordSession(result);

  const levelled = hasLevels(result.mode);
  const hasNextLevel = !training && levelled && result.level < levelCountOf(result.mode);
  const stopped = result.failureReason === 'emergencyStop';
  const moreSteps = Boolean(training && result.cleared && hasNextStep(training));
  // An endless run always ends on the clock, so it is neither cleared nor failed.
  const positive = !stopped && (result.cleared || !levelled);
  const subtitle = !levelled
    ? texts.results.runEndedSubtitle
    : result.cleared
      ? texts.results.clearedSubtitle
      : result.failureReason
        ? texts.results.failedReason[result.failureReason]
        : '';

  const notice =
    status === 'guest'
      ? texts.results.guestNotice
      : status === 'queued'
        ? texts.results.queuedNotice
        : status === 'error'
          ? (error ?? texts.results.saveError)
          : training && result.cleared && !moreSteps
            ? texts.results.trainingDone
            : !training && levelled && result.cleared && !hasNextLevel
              ? texts.results.allLevelsDone
              : null;

  const title = stopped
    ? texts.results.stopped
    : training
      ? result.cleared
        ? texts.results.stepCleared
        : texts.results.stepFailed
      : !levelled
        ? texts.results.runEnded
        : result.cleared
          ? texts.results.cleared
          : texts.results.failed;

  return (
    <Screen edges={['top', 'bottom']}>
      <Container>
        <Scroll>
          <Badge fill={positive ? theme.colors.primary : theme.colors.surface}>
            <BadgeMark foreground={positive ? theme.colors.onPrimary : theme.colors.inkSoft}>
              {positive ? '✓' : '!'}
            </BadgeMark>
          </Badge>

          <Title>{title}</Title>
          {training ? (
            <Subtitle>
              {texts.results.stepOf(
                training.stepIndex + 1,
                training.steps.length,
                training.steps[training.stepIndex].title,
              )}
            </Subtitle>
          ) : null}
          <Subtitle>{subtitle}</Subtitle>

          {recorded ? (
            <RewardPill>
              <RewardLabel>
                {recorded.leveledUp
                  ? texts.results.levelUp(recorded.progression.level)
                  : texts.results.xpAwarded(recorded.xpAwarded)}
              </RewardLabel>
            </RewardPill>
          ) : null}

          <MetricGrid metrics={metricsFor(result.mode, result.metrics)} />

          {notice ? <Notice>{notice}</Notice> : null}
        </Scroll>

        <Actions>
          {stopped ? null : training && moreSteps ? (
            <Button label={texts.results.nextStep} onPress={() => onNextStep(training)} />
          ) : training ? (
            <Button label={texts.results.retryStep} onPress={() => onPlayLevel(result.level)} />
          ) : result.cleared && hasNextLevel ? (
            <Button
              label={texts.results.nextLevel}
              onPress={() => onPlayLevel(result.level + 1)}
            />
          ) : (
            <Button
              label={levelled ? texts.results.retryLevel : texts.results.playAgain}
              onPress={() => onPlayLevel(result.level)}
            />
          )}
          <Button label={texts.results.exit} variant="outline" onPress={onExit} />
        </Actions>
      </Container>
    </Screen>
  );
}

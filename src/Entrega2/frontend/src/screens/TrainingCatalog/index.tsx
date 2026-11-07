import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { PillToggle } from '../../components/PillToggle';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { forAudience, trainingService } from '../../services/training/trainingService';
import type { TrainingAudience } from '../../services/training/types';
import {
  BackAction,
  CardHeader,
  Centered,
  Content,
  Dot,
  Dots,
  Filters,
  List,
  Message,
  Meta,
  Name,
  Notice,
  Retry,
  Subtitle,
  Summary,
  Tag,
  Title,
  TrainingCard,
} from './styles';

const AUDIENCES: TrainingAudience[] = ['all', 'kids', 'teens', 'adults', 'seniors'];

interface TrainingCatalogScreenProps {
  onGoBack: () => void;
  onOpenTraining: (id: string) => void;
}

export function TrainingCatalogScreen({ onGoBack, onOpenTraining }: TrainingCatalogScreenProps) {
  const theme = useTheme();
  const [audience, setAudience] = useState<TrainingAudience>('all');
  const loader = useCallback(() => trainingService.catalog(), []);
  const { data, loading, error, reload } = useRemoteResource(loader);

  return (
    <Screen edges={['top']}>
      <Content>
        <Pressable onPress={onGoBack} accessibilityRole="button">
          <BackAction>{texts.trainings.back}</BackAction>
        </Pressable>
        <Title>{texts.trainings.title}</Title>
        <Subtitle>{texts.trainings.subtitle}</Subtitle>

        <Filters>
          <PillToggle
            options={AUDIENCES.map((value) => ({ value, label: texts.trainings.audienceFilter[value] }))}
            selected={audience}
            onSelect={setAudience}
          />
        </Filters>

        {data?.fromCache ? <Notice>{texts.trainings.cached}</Notice> : null}

        {loading && !data ? (
          <Centered>
            <ActivityIndicator color={theme.colors.primaryDark} size="large" />
          </Centered>
        ) : error && !data ? (
          <Centered>
            <Message>{texts.trainings.loadError}</Message>
            <Pressable onPress={reload} accessibilityRole="button">
              <Retry>{texts.trainings.retry}</Retry>
            </Pressable>
          </Centered>
        ) : (
          <List>
            {data && forAudience(data.data, audience).length === 0 ? <Message>{texts.trainings.empty}</Message> : null}
            {data
              ? forAudience(data.data, audience).map((training) => (
                  <Pressable key={training.id} onPress={() => onOpenTraining(training.id)} accessibilityRole="button">
                    <TrainingCard>
                      <CardHeader>
                        <Tag>
                          {texts.trainings.audienceFilter[training.audience].toUpperCase()} ·{' '}
                          {texts.trainings.difficulty[training.difficulty].toUpperCase()}
                        </Tag>
                        <Dots>
                          {training.targetColors.map((color) => (
                            <Dot key={color} fill={theme.colors.target[color].background} />
                          ))}
                        </Dots>
                      </CardHeader>
                      <Name>{training.title}</Name>
                      <Summary>{training.summary}</Summary>
                      <Meta>{texts.trainings.meta(training.estimatedMinutes, training.stepCount)}</Meta>
                      <Meta>{texts.trainings.byAuthor(training.authorName, training.version)}</Meta>
                    </TrainingCard>
                  </Pressable>
                ))
              : null}
          </List>
        )}
      </Content>
    </Screen>
  );
}

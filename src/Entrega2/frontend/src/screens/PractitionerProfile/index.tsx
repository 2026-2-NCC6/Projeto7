import { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { texts } from '../../content/texts';
import { toFormErrorMessage } from '../../hooks/formError';
import { useProfile } from '../../hooks/useProfile';
import { profileService } from '../../services/profile/profileService';
import type { PracticeGoal, PractitionerProfile } from '../../services/profile/types';
import { useAuthStore } from '../../store/authStore';
import {
  Actions,
  BackAction,
  Centered,
  Chip,
  ChipLabel,
  Chips,
  Content,
  ErrorText,
  Field,
  Label,
  Message,
  Notice,
  Retry,
  Status,
  Subtitle,
  Title,
} from './styles';

function Choices<T extends string>({
  labels,
  selected,
  onToggle,
}: {
  labels: Record<T, string>;
  selected: (value: T) => boolean;
  onToggle: (value: T) => void;
}) {
  return (
    <Chips>
      {(Object.keys(labels) as T[]).map((value) => (
        <Pressable key={value} onPress={() => onToggle(value)} accessibilityRole="button" accessibilityState={{ selected: selected(value) }}>
          <Chip active={selected(value)}>
            <ChipLabel active={selected(value)}>{labels[value]}</ChipLabel>
          </Chip>
        </Pressable>
      ))}
    </Chips>
  );
}

function toggleOptional<T>(current: T | null, value: T): T | null {
  return current === value ? null : value;
}

interface PractitionerProfileScreenProps {
  onGoBack: () => void;
}

export function PractitionerProfileScreen({ onGoBack }: PractitionerProfileScreenProps) {
  const theme = useTheme();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { profile, loading, error, reload } = useProfile();

  if (loading && !profile) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ActivityIndicator color={theme.colors.primaryDark} size="large" />
        </Centered>
      </Screen>
    );
  }

  if (!profile || !accessToken) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <Message>{error ?? texts.practitioner.loadError}</Message>
          <Pressable onPress={reload} accessibilityRole="button">
            <Retry>{texts.trainings.retry}</Retry>
          </Pressable>
        </Centered>
      </Screen>
    );
  }

  return (
    <PractitionerForm
      initialName={profile.player.name}
      initial={profile.player.practitioner}
      accessToken={accessToken}
      onGoBack={onGoBack}
    />
  );
}

interface PractitionerFormProps {
  initialName: string;
  initial: PractitionerProfile;
  accessToken: string;
  onGoBack: () => void;
}

function PractitionerForm({ initialName, initial, accessToken, onGoBack }: PractitionerFormProps) {
  const [name, setName] = useState(initialName);
  const [practitioner, setPractitioner] = useState<PractitionerProfile>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (changes: Partial<PractitionerProfile>) => {
    setPractitioner({ ...practitioner, ...changes });
    setStatus('idle');
  };

  const toggleGoal = (goal: PracticeGoal) =>
    update({
      goals: practitioner.goals.includes(goal)
        ? practitioner.goals.filter((item) => item !== goal)
        : [...practitioner.goals, goal],
    });

  const save = async () => {
    setStatus('saving');
    setSaveError(null);
    try {
      await profileService.updatePractitioner(name, practitioner, accessToken);
      setStatus('saved');
    } catch (cause) {
      setSaveError(toFormErrorMessage(cause));
      setStatus('idle');
    }
  };

  const minor = practitioner.ageGroup === 'child' || practitioner.ageGroup === 'teen';

  return (
    <Screen edges={['top']}>
      <Content keyboardShouldPersistTaps="handled">
        <Pressable onPress={onGoBack} accessibilityRole="button">
          <BackAction>{texts.practitioner.back}</BackAction>
        </Pressable>
        <Title>{texts.practitioner.title}</Title>
        <Subtitle>{texts.practitioner.subtitle}</Subtitle>

        <Field>
          <Label>{texts.practitioner.name.toUpperCase()}</Label>
          <TextField value={name} onChangeText={(value) => { setName(value); setStatus('idle'); }} autoComplete="name" />
        </Field>
        <Field>
          <Label>{texts.practitioner.ageGroup.toUpperCase()}</Label>
          <Choices labels={texts.practitioner.ageGroups} selected={(value) => practitioner.ageGroup === value} onToggle={(value) => update({ ageGroup: toggleOptional(practitioner.ageGroup, value) })} />
        </Field>
        <Field>
          <Label>{texts.practitioner.skillLevel.toUpperCase()}</Label>
          <Choices labels={texts.practitioner.skillLevels} selected={(value) => practitioner.skillLevel === value} onToggle={(value) => update({ skillLevel: toggleOptional(practitioner.skillLevel, value) })} />
        </Field>
        <Field>
          <Label>{texts.practitioner.goals.toUpperCase()}</Label>
          <Choices labels={texts.practitioner.goalOptions} selected={(value) => practitioner.goals.includes(value)} onToggle={toggleGoal} />
        </Field>
        <Field>
          <Label>{texts.practitioner.dominantHand.toUpperCase()}</Label>
          <Choices labels={texts.practitioner.hands} selected={(value) => practitioner.dominantHand === value} onToggle={(value) => update({ dominantHand: toggleOptional(practitioner.dominantHand, value) })} />
        </Field>
        <Field>
          <Label>{texts.practitioner.restrictions.toUpperCase()}</Label>
          <TextField
            value={practitioner.restrictions ?? ''}
            onChangeText={(value) => update({ restrictions: value.length > 0 ? value : null })}
            placeholder={texts.practitioner.restrictionsPlaceholder}
            maxLength={280}
            multiline
          />
        </Field>

        {minor ? <Notice>{texts.practitioner.minorNotice}</Notice> : null}

        <Actions>
          {status === 'saved' ? <Status>{texts.practitioner.saved}</Status> : null}
          {saveError ? <ErrorText>{saveError}</ErrorText> : null}
          <Button
            label={status === 'saving' ? texts.practitioner.saving : texts.practitioner.save}
            onPress={() => void save()}
            disabled={status === 'saving' || name.trim().length < 2}
          />
        </Actions>
      </Content>
    </Screen>
  );
}

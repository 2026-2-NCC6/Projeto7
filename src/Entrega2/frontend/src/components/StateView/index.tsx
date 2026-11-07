import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Button } from '../Button';
import {
  ActionSlot,
  Centered,
  EmptyCard,
  EmptyMessage,
  EmptyTitle,
  Message,
  RetryLabel,
} from './styles';

export function LoadingState() {
  const theme = useTheme();

  return (
    <Centered accessible accessibilityRole="progressbar">
      <ActivityIndicator color={theme.colors.primaryDark} size="large" />
    </Centered>
  );
}

interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <Centered>
      <Message>{message}</Message>
      <Pressable onPress={onRetry} accessibilityRole="button">
        <RetryLabel>{retryLabel}</RetryLabel>
      </Pressable>
    </Centered>
  );
}

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: EmptyStateAction;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <EmptyCard>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyMessage>{message}</EmptyMessage>
      {action ? (
        <ActionSlot>
          <Button label={action.label} onPress={action.onPress} />
        </ActionSlot>
      ) : null}
    </EmptyCard>
  );
}

import * as Haptics from 'expo-haptics';
import type { HitVerdict } from '../domain/session-phase';

export function pulseFor(verdict: HitVerdict): void {
  const style =
    verdict === 'correct'
      ? Haptics.ImpactFeedbackStyle.Light
      : Haptics.ImpactFeedbackStyle.Heavy;

  void Haptics.impactAsync(style).catch(() => undefined);
}

export function pulseOutcome(cleared: boolean): void {
  const type = cleared
    ? Haptics.NotificationFeedbackType.Success
    : Haptics.NotificationFeedbackType.Warning;

  void Haptics.notificationAsync(type).catch(() => undefined);
}

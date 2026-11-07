import { Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import type { DeviceConnectionStatus } from '../../../device/contracts';

const Banner = styled.View<{ surface: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing['3xl']}px;
  margin: 0 ${({ theme }) => theme.spacing['5xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ surface }) => surface};
`;

const Message = styled(Text).attrs({ size: 'sm', weight: 'bold', align: 'center' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

const Action = styled(Text).attrs({ size: 'sm', weight: 'extraBold' })<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
  text-decoration-line: underline;
`;

const messages: Record<Exclude<DeviceConnectionStatus, 'connected'>, string> = {
  connecting: texts.game.device.connecting,
  lost: texts.game.device.lost,
  disconnected: texts.game.device.disconnected,
};

interface ConnectionBannerProps {
  status: DeviceConnectionStatus;
  surface: string;
  foreground: string;
  onRetry: () => void;
}

export function ConnectionBanner({
  status,
  surface,
  foreground,
  onRetry,
}: ConnectionBannerProps) {
  if (status === 'connected') {
    return null;
  }

  return (
    <Banner surface={surface}>
      <Message foreground={foreground}>{messages[status]}</Message>
      {status === 'connecting' ? null : (
        <Pressable onPress={onRetry} accessibilityRole="button">
          <Action foreground={foreground}>{texts.game.device.retry}</Action>
        </Pressable>
      )}
    </Banner>
  );
}

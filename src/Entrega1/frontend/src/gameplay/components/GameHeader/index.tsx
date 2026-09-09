import { Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';

const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing['5xl']}px;
`;

const Chip = styled.View<{ chipBackground: string }>`
  width: ${({ theme }) => theme.sizes.gameChip}px;
  height: ${({ theme }) => theme.sizes.gameChip}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ chipBackground }) => chipBackground};
`;

const ChipLabel = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

const Label = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tracking: 'wide',
  align: 'center',
})<{ foreground: string }>`
  flex: 1;
  color: ${({ foreground }) => foreground};
`;

interface GameHeaderProps {
  label: string;
  foreground: string;
  chipBackground: string;
  onClose: () => void;
  onHelp: () => void;
}

export function GameHeader({
  label,
  foreground,
  chipBackground,
  onClose,
  onHelp,
}: GameHeaderProps) {
  return (
    <Bar>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={texts.game.close}>
        <Chip chipBackground={chipBackground}>
          <ChipLabel foreground={foreground}>×</ChipLabel>
        </Chip>
      </Pressable>

      <Label foreground={foreground}>{label}</Label>

      <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel={texts.game.help}>
        <Chip chipBackground={chipBackground}>
          <ChipLabel foreground={foreground}>?</ChipLabel>
        </Chip>
      </Pressable>
    </Bar>
  );
}

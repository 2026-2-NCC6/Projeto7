import { Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../components/Text';

const Tile = styled.View<{ surface: string; outline: string }>`
  flex: 1;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  background-color: ${({ surface }) => surface};
  border-width: ${({ theme }) => theme.sizes.inputBorder}px;
  border-color: ${({ outline }) => outline};
`;

const Number = styled(Text).attrs({ size: '2xl', weight: 'extraBold' })<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

const Note = styled(Text).attrs({ size: '2xs', weight: 'bold' })<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

const Slot = styled.View`
  flex: 1;
`;

export interface LevelTileTone {
  readonly surface: string;
  readonly outline: string;
  readonly foreground: string;
  readonly noteForeground: string;
}

interface LevelTileProps {
  level: number;
  note: string | null;
  tone: LevelTileTone;
  disabled: boolean;
  onPress: () => void;
}

export function LevelTile({ level, note, tone, disabled, onPress }: LevelTileProps) {
  return (
    <Slot>
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">
        <Tile surface={tone.surface} outline={tone.outline}>
          <Number foreground={tone.foreground}>{level}</Number>
          {note ? <Note foreground={tone.noteForeground}>{note}</Note> : null}
        </Tile>
      </Pressable>
    </Slot>
  );
}

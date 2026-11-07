import { Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import { texts } from '../../../content/texts';

const CHEVRON = { length: 6, half: 5 } as const;

const Backdrop = styled(Pressable)`
  flex: 1;
`;

const Sheet = styled(Card)<{ top: number }>`
  position: absolute;
  top: ${({ top }) => top}px;
  right: ${({ theme }) => theme.spacing['5xl']}px;
  min-width: 60%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  border-width: ${({ theme }) => theme.sizes.hairline}px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['5xl']}px;
  padding: ${({ theme }) => theme.spacing['3xl']}px;
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.sizes.hairline}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Label = styled(Text).attrs({ size: 'mdPlus', weight: 'bold' })``;

const SignOutLabel = styled(Label).attrs({ tone: 'danger' })``;

interface AccountMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onViewProfile: () => void;
  onSignOut: () => void;
}

export function AccountMenu({
  visible,
  onDismiss,
  onViewProfile,
  onSignOut,
}: AccountMenuProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const top =
    insets.top + theme.spacing['6xl'] + theme.sizes.avatar + theme.spacing.md;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Backdrop onPress={onDismiss} accessibilityRole="button" accessibilityLabel={texts.home.accountMenu}>
        <Sheet top={top} style={theme.shadows.menu}>
          <Pressable onPress={onViewProfile} accessibilityRole="button">
            <Row>
              <Label>{texts.home.viewProfile}</Label>
              <Triangle direction="right" {...CHEVRON} color={theme.colors.inkSoft} />
            </Row>
          </Pressable>
          <Separator />
          <Pressable onPress={onSignOut} accessibilityRole="button">
            <Row>
              <SignOutLabel>{texts.settings.signOut}</SignOutLabel>
              <Triangle direction="right" {...CHEVRON} color={theme.colors.danger} />
            </Row>
          </Pressable>
        </Sheet>
      </Backdrop>
    </Modal>
  );
}

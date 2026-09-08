import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Text } from '../../../components/Text';
import { Triangle } from '../../../components/Triangle';
import { texts } from '../../../content/texts';
import { ThemeModeRow } from './ThemeModeRow';

const CHEVRON = { length: 6, half: 5 } as const;

const Container = styled(Card)`
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.sizes.hairline}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing['3xl']}px;
`;

const SignOutLabel = styled(Text).attrs({
  size: 'mdPlus',
  weight: 'bold',
  tone: 'danger',
})``;

interface SettingsListProps {
  onSignOut: () => void;
}

export function SettingsList({ onSignOut }: SettingsListProps) {
  const theme = useTheme();

  return (
    <Container>
      <ThemeModeRow />
      <Separator />
      <Pressable onPress={onSignOut} accessibilityRole="button">
        <Row>
          <SignOutLabel>{texts.settings.signOut}</SignOutLabel>
          <Triangle direction="right" {...CHEVRON} color={theme.colors.danger} />
        </Row>
      </Pressable>
    </Container>
  );
}
